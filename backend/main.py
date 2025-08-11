# ==========================================================================
# main.py: FastAPI Backend for Smartsheet OAuth
# ==========================================================================
#
# Description:
# This FastAPI application handles the server-side logic for the Smartsheet
# OAuth 2.0 flow and data retrieval for the Compass application.
# It operates on a single-sheet data model with a simplified data structure.
# ==========================================================================

import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from itsdangerous import URLSafeSerializer
from datetime import datetime

# Load environment variables from the .env file
load_dotenv()

# Initialize the FastAPI application
app = FastAPI()

# --- Configuration ---
SMARTSHEET_CLIENT_ID = os.getenv("SMARTSHEET_CLIENT_ID")
SMARTSHEET_CLIENT_SECRET = os.getenv("SMARTSHEET_CLIENT_SECRET")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")

# The Redirect URI must match what is registered in your Smartsheet App
REDIRECT_URI = "http://localhost:8000/api/callback"
AUTHORIZATION_URL = "https://app.smartsheet.com/b/authorize"
TOKEN_URL = "https://api.smartsheet.com/2.0/token"

# This single Sheet ID is used for all data.
MASTER_SHEET_ID = "6581841701064580"

# Serializer for securely signing cookies
serializer = URLSafeSerializer(SESSION_SECRET_KEY)

# --- Helper Functions ---
def format_display_date(date_string):
    """Formats a YYYY-MM-DD date string into 'Mon DD, YYYY' format."""
    if not date_string:
        return 'N/A'
    try:
        dt_object = datetime.strptime(date_string, '%Y-%m-%d')
        return dt_object.strftime('%b %d, %Y')
    except ValueError:
        return date_string

def get_token_from_request(request: Request):
    """Helper to extract and validate token from request cookies."""
    signed_token = request.cookies.get("access_token")
    if not signed_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return serializer.loads(signed_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Authentication Endpoints ---

@app.get("/api/login")
async def oauth_login():
    """Initiates the OAuth 2.0 login flow."""
    auth_url_params = {
        "response_type": "code",
        "client_id": SMARTSHEET_CLIENT_ID,
        "scope": "READ_SHEETS",
        "redirect_uri": REDIRECT_URI,
    }
    auth_url = f"{AUTHORIZATION_URL}?{requests.compat.urlencode(auth_url_params)}"
    return RedirectResponse(url=auth_url)

@app.get("/api/callback")
async def oauth_callback(code: str):
    """Handles the OAuth callback, exchanges code for a token, and sets a secure cookie."""
    try:
        token_request_payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": SMARTSHEET_CLIENT_ID,
            "client_secret": SMARTSHEET_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
        }
        response = requests.post(TOKEN_URL, data=token_request_payload, headers={
            "Content-Type": "application/x-www-form-urlencoded"
        })
        response.raise_for_status()
        token_data = response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise Exception("Access token not found in Smartsheet response.")
        redirect_response = RedirectResponse(url="http://localhost:5173/my-assessments")
        signed_token = serializer.dumps(access_token)
        redirect_response.set_cookie(
            key="access_token",
            value=signed_token,
            httponly=True,
            secure=False,
            samesite="lax",
        )
        return redirect_response
    except Exception as e:
        print(f"Error during OAuth callback: {e}")
        return RedirectResponse(url="http://localhost:5173/?error=auth_failed")

# --- Data Endpoints ---

@app.get("/api/assessments")
async def get_assessments(request: Request):
    """
    Fetches a de-duplicated list of assessments from the master sheet.
    """
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}
        user_profile_url = "https://api.smartsheet.com/2.0/users/me"
        user_response = requests.get(user_profile_url, headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email")

        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{MASTER_SHEET_ID}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()
        sheet_data = response.json()

        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        
        required_cols = ["Customer Name", "Created Date", "Assessment ID", "Industry", "Submitter", "Maturity Score"]
        if not all(col in column_map for col in required_cols):
             return JSONResponse({"error": "Master sheet is missing required columns."}, status_code=500)

        assessments = {}
        for row in sheet_data.get("rows", []):
            cells = {cell["columnId"]: cell.get("value") for cell in row.get("cells", [])}
            submitter_email = cells.get(column_map["Submitter"])

            if submitter_email and submitter_email.lower() == user_email.lower():
                assessment_id_val = cells.get(column_map["Assessment ID"])
                try:
                    if assessment_id_val is not None:
                        assessment_id_str = str(int(float(assessment_id_val)))
                        if assessment_id_str not in assessments:
                            assessments[assessment_id_str] = {
                                "name": cells.get(column_map["Customer Name"]),
                                "date": cells.get(column_map["Created Date"]),
                                "sheetId": assessment_id_str,
                                "industry": cells.get(column_map["Industry"]),
                                "maturityScore": cells.get(column_map["Maturity Score"])
                            }
                except (ValueError, TypeError):
                    continue
        
        return list(assessments.values())

    except Exception as e:
        print(f"Error fetching assessments: {e}")
        return JSONResponse({"error": "Failed to fetch assessments"}, status_code=500)


@app.get("/api/dashboard/{assessment_id_str}")
async def get_dashboard_data(assessment_id_str: str, request: Request):
    """
    Builds a dashboard summary from a single row in the master sheet.
    """
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}

        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{MASTER_SHEET_ID}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()
        sheet_data = response.json()
        
        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        
        required_cols = ["Assessment ID", "Customer Name", "Industry", "Created Date", "Maturity Score"]
        if not all(col in column_map for col in required_cols):
             return JSONResponse({"error": "Data sheet is missing required columns for the dashboard."}, status_code=500)

        dashboard_data = None
        for row in sheet_data.get("rows", []):
            cells = {cell["columnId"]: cell.get("displayValue") or cell.get("value") for cell in row.get("cells", [])}
            row_assessment_id = cells.get(column_map["Assessment ID"])
            
            try:
                if row_assessment_id is not None and str(int(float(row_assessment_id))) == assessment_id_str:
                    dashboard_data = {
                        "name": cells.get(column_map["Customer Name"], "N/A"),
                        "industry": cells.get(column_map["Industry"], "N/A"),
                        "date": format_display_date(cells.get(column_map["Created Date"])),
                        "score": cells.get(column_map["Maturity Score"], "N/A")
                    }
                    break
            except (ValueError, TypeError):
                continue
        
        if not dashboard_data:
            return JSONResponse(status_code=404, content={"error": f"Assessment with ID '{assessment_id_str}' not found."})

        final_metrics = [
            {"title": "Customer Name", "value": dashboard_data.get("name")},
            {"title": "Industry", "value": dashboard_data.get("industry")},
            {"title": "Created Date", "value": dashboard_data.get("date")},
            {"title": "Maturity Score", "value": str(dashboard_data.get("score"))}
        ]
        
        return {
            "sheetName": dashboard_data.get("name", "Dashboard"),
            "metrics": final_metrics
        }

    except Exception as e:
        print(f"An unexpected error occurred in get_dashboard_data for assessment {assessment_id_str}: {e}")
        return JSONResponse(status_code=500, content={"error": "Failed to fetch dashboard data"})


@app.get("/api/assessments/total")
async def get_total_assessments(request: Request):
    """ Fetches the total number of unique assessments for the logged-in user. """
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}
        user_profile_url = "https://api.smartsheet.com/2.0/users/me"
        user_response = requests.get(user_profile_url, headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email")

        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{MASTER_SHEET_ID}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()
        sheet_data = response.json()
        
        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        submitter_col_id = column_map.get("Submitter")
        assessment_id_col = column_map.get("Assessment ID")

        if not submitter_col_id or not assessment_id_col:
             return JSONResponse({"error": "'Submitter' or 'Assessment ID' column not found."}, status_code=500)

        processed_ids = set()
        for row in sheet_data.get("rows", []):
            submitter_cell = next((c for c in row["cells"] if c["columnId"] == submitter_col_id), None)
            if submitter_cell and submitter_cell.get("value", "").lower() == user_email.lower():
                assessment_id_cell = next((c for c in row["cells"] if c["columnId"] == assessment_id_col), None)
                if assessment_id_cell and assessment_id_cell.get("value") is not None:
                    try:
                        processed_ids.add(str(int(float(assessment_id_cell.get("value")))))
                    except (ValueError, TypeError):
                        continue
        
        return {"total": len(processed_ids)}
    except Exception as e:
        print(f"Error fetching total assessments: {e}")
        return JSONResponse({"error": "Failed to fetch total assessments"}, status_code=500)