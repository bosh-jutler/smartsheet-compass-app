# ==========================================================================
# main.py: FastAPI Backend for Smartsheet OAuth
# ==========================================================================
#
# Description:
# This FastAPI application handles the server-side logic for the Smartsheet
# OAuth 2.0 flow and data retrieval for the Compass application.
# It operates on a single-sheet data model with a simplified data structure.
# ==========================================================================

# --- Standard Library Imports ---
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

# --- Third-Party Imports ---
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from itsdangerous import URLSafeSerializer

# Load environment variables from the .env file
load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Configuration Constants ---
SMARTSHEET_CLIENT_ID = os.getenv("SMARTSHEET_CLIENT_ID")
SMARTSHEET_CLIENT_SECRET = os.getenv("SMARTSHEET_CLIENT_SECRET")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")
REDIRECT_URI = "http://localhost:8000/api/callback"
FRONTEND_URL = "http://localhost:5173"

# Smartsheet API URLs
AUTHORIZATION_URL = "https://app.smartsheet.com/b/authorize"
TOKEN_URL = "https://api.smartsheet.com/2.0/token"
API_BASE_URL = "https://api.smartsheet.com/2.0"

# Application-specific constants
MASTER_SHEET_ID = "6581841701064580"
REQUIRED_COLS_ASSESSMENTS = [
    "Customer Name", "Created Date", "Assessment ID", 
    "Industry", "Submitter", "Maturity Score"
]
REQUIRED_COLS_DASHBOARD = [
    "Assessment ID", "Customer Name", "Created Date", "Executive Summary", "Maturity Score",
    "Strengths & Key Findings Formatted", "D&I Summary", "D&I Dimensional Performance",
    "D&I Average Score", "WS&P Average Score", "WE Average Score", "W&PR Average Score", "PP Average Score", "SP Average Score",
    "D&I Score", "WS&P Score", "WE Score", "W&PR Score", "PP Score", "SP Score",
    "D&I - People Score"
]

# --- Security and Serializers ---
# Serializer for securely signing cookies
if not SESSION_SECRET_KEY:
    raise RuntimeError("SESSION_SECRET_KEY is not set in the environment.")
serializer = URLSafeSerializer(SESSION_SECRET_KEY)


# --- Helper Functions ---
def _get_cell_value(row: Dict[str, Any], column_id: int) -> Optional[Any]:
    """Safely retrieves a cell's value from a row by column ID."""
    for cell in row.get("cells", []):
        if cell.get("columnId") == column_id:
            return cell.get("displayValue") or cell.get("value")
    return None

def format_display_date(date_string: Optional[str]) -> str:
    """Formats a YYYY-MM-DD date string into 'Mon DD, YYYY' format."""
    if not date_string:
        return 'N/A'
    try:
        dt_object = datetime.strptime(date_string, '%Y-%m-%d')
        return dt_object.strftime('%b %d, %Y')
    except ValueError:
        return date_string

def get_token_from_request(request: Request) -> str:
    """Helper to extract and validate token from request cookies."""
    signed_token = request.cookies.get("access_token")
    if not signed_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        # The 'loads' method returns the original string
        return serializer.loads(signed_token)  # type: ignore
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Authentication Endpoints ---
@app.get("/api/login")
async def oauth_login() -> RedirectResponse:
    """Initiates the OAuth 2.0 login flow by redirecting to Smartsheet."""
    auth_url_params = {
        "response_type": "code",
        "client_id": SMARTSHEET_CLIENT_ID,
        "scope": "READ_SHEETS",
        "redirect_uri": REDIRECT_URI,
    }
    auth_url = f"{AUTHORIZATION_URL}?{requests.compat.urlencode(auth_url_params)}"
    return RedirectResponse(url=auth_url)


@app.get("/api/callback")
async def oauth_callback(code: str) -> RedirectResponse:
    """Handles the OAuth callback, exchanges code for a token, and sets a secure cookie."""
    try:
        token_request_payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": SMARTSHEET_CLIENT_ID,
            "client_secret": SMARTSHEET_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
        }
        response = requests.post(
            TOKEN_URL,
            data=token_request_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        token_data = response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise Exception("Access token not found in Smartsheet response.")

        redirect_response = RedirectResponse(url=f"{FRONTEND_URL}/my-assessments")
        signed_token = serializer.dumps(access_token)
        redirect_response.set_cookie(
            key="access_token",
            value=signed_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
        )
        return redirect_response
    except requests.exceptions.RequestException as e:
        print(f"HTTP Error during OAuth callback: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_failed")
    except Exception as e:
        print(f"An unexpected error occurred during OAuth callback: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_failed")


# --- Data Endpoints ---
@app.get("/api/assessments")
async def get_assessments(request: Request) -> List[Dict[str, Any]]:
    """Fetches a de-duplicated list of assessments for the logged-in user."""
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}

        # Get current user's email
        user_response = requests.get(f"{API_BASE_URL}/users/me", headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email", "").lower()

        # Get the master sheet data
        sheet_response = requests.get(f"{API_BASE_URL}/sheets/{MASTER_SHEET_ID}", headers=headers)
        sheet_response.raise_for_status()
        sheet_data = sheet_response.json()

        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        if not all(col in column_map for col in REQUIRED_COLS_ASSESSMENTS):
            raise HTTPException(500, "Master sheet is missing required columns.")

        assessments: Dict[str, Dict[str, Any]] = {}
        for row in sheet_data.get("rows", []):
            submitter_email = _get_cell_value(row, column_map["Submitter"])
            if submitter_email and submitter_email.lower() == user_email:
                try:
                    assessment_id_val = _get_cell_value(row, column_map["Assessment ID"])
                    if assessment_id_val is None:
                        continue
                    
                    assessment_id = str(int(float(assessment_id_val)))
                    if assessment_id not in assessments:
                        assessments[assessment_id] = {
                            "name": _get_cell_value(row, column_map["Customer Name"]),
                            "date": _get_cell_value(row, column_map["Created Date"]),
                            "sheetId": assessment_id,
                            "industry": _get_cell_value(row, column_map["Industry"]),
                            "maturityScore": _get_cell_value(row, column_map["Maturity Score"]),
                        }
                except (ValueError, TypeError):
                    continue  # Skip rows with invalid assessment IDs

        return list(assessments.values())
    except requests.exceptions.HTTPError as e:
        # Forward client-side errors, handle server-side errors
        if 400 <= e.response.status_code < 500:
                raise HTTPException(e.response.status_code, "Authentication error with Smartsheet.")
        raise HTTPException(500, "Failed to communicate with Smartsheet.")
    except Exception as e:
        print(f"Error fetching assessments: {e}")
        raise HTTPException(500, "Failed to fetch assessments.")


@app.get("/api/dashboard/{assessment_id_str}")
async def get_dashboard_data(assessment_id_str: str, request: Request) -> JSONResponse:
    """Builds a dashboard summary from a single row in the master sheet."""
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}

        sheet_response = requests.get(f"{API_BASE_URL}/sheets/{MASTER_SHEET_ID}", headers=headers)
        sheet_response.raise_for_status()
        sheet_data = sheet_response.json()
        
        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        if not all(col in column_map for col in REQUIRED_COLS_DASHBOARD):
            raise HTTPException(500, "Data sheet missing required columns for dashboard.")

        assessment_data_for_heatmap = []
        dashboard_data = None

        for row in sheet_data.get("rows", []):
            try:
                row_assessment_id_val = _get_cell_value(row, column_map["Assessment ID"])
                if row_assessment_id_val is None:
                    continue
                
                row_assessment_id = str(int(float(row_assessment_id_val)))
                
                # Collect data for the heatmap
                maturity_score_val = _get_cell_value(row, column_map["Maturity Score"])
                di_people_score_val = _get_cell_value(row, column_map["D&I - People Score"])

                if maturity_score_val is not None and di_people_score_val is not None:
                    try:
                        assessment_data_for_heatmap.append({
                            "Maturity Score": float(maturity_score_val),
                            "D&I - People Score": int(di_people_score_val)
                        })
                    except (ValueError, TypeError):
                        pass # Ignore rows where scores are not valid numbers

                if row_assessment_id == assessment_id_str and dashboard_data is None:
                    maturity_score = None
                    di_people_score = None
                    try:
                        if maturity_score_val is not None:
                            maturity_score = float(maturity_score_val)
                        if di_people_score_val is not None:
                            di_people_score = int(di_people_score_val)
                    except (ValueError, TypeError):
                        maturity_score = None
                        di_people_score = None

                    dashboard_data = {
                        "customerName": _get_cell_value(row, column_map["Customer Name"]) or "N/A",
                        "createdDate": format_display_date(
                            _get_cell_value(row, column_map["Created Date"])
                        ),
                        "executiveSummary": _get_cell_value(row, column_map["Executive Summary"]) or "No summary available.",
                        "maturityScore": maturity_score,
                        "highlightMaturityScore": maturity_score,
                        "highlightDiPeopleScore": di_people_score,
                        "strengthsAndKeyFindings": _get_cell_value(row, column_map["Strengths & Key Findings Formatted"]) or "No data available.",
                        "diSummary": _get_cell_value(row, column_map["D&I Summary"]) or "No summary available.",
                        "diDimensionalPerformance": _get_cell_value(row, column_map["D&I Dimensional Performance"]) or "No dimensional performance data available.",
                        "radarChartData": {
                            "diAverage": _get_cell_value(row, column_map["D&I Average Score"]),
                            "wspAverage": _get_cell_value(row, column_map["WS&P Average Score"]),
                            "weAverage": _get_cell_value(row, column_map["WE Average Score"]),
                            "wprAverage": _get_cell_value(row, column_map["W&PR Average Score"]),
                            "ppAverage": _get_cell_value(row, column_map["PP Average Score"]),
                            "spAverage": _get_cell_value(row, column_map["SP Average Score"]),
                            "diScore": _get_cell_value(row, column_map["D&I Score"]),
                            "wspScore": _get_cell_value(row, column_map["WS&P Score"]),
                            "weScore": _get_cell_value(row, column_map["WE Score"]),
                            "wprScore": _get_cell_value(row, column_map["W&PR Score"]),
                            "ppScore": _get_cell_value(row, column_map["PP Score"]),
                            "spScore": _get_cell_value(row, column_map["SP Score"]),
                        }
                    }
            except (ValueError, TypeError):
                continue

        if dashboard_data:
            dashboard_data["assessmentData"] = assessment_data_for_heatmap
            return JSONResponse(content=dashboard_data)
        
        # If loop finishes without finding the assessment
        raise HTTPException(404, f"Assessment with ID '{assessment_id_str}' not found.")
    except requests.exceptions.HTTPError as e:
        if 400 <= e.response.status_code < 500:
                raise HTTPException(e.response.status_code, "Authentication error with Smartsheet.")
        raise HTTPException(500, "Failed to communicate with Smartsheet.")
    except Exception as e:
        print(f"Error in get_dashboard_data for {assessment_id_str}: {e}")
        raise HTTPException(500, "Failed to fetch dashboard data.")


@app.get("/api/assessments/total")
async def get_total_assessments(request: Request) -> JSONResponse:
    """Fetches the total number of unique assessments for the logged-in user."""
    # This logic is very similar to get_assessments, consider refactoring in a real app
    # For now, keeping it separate for clarity.
    try:
        access_token = get_token_from_request(request)
        headers = {"Authorization": f"Bearer {access_token}"}

        user_response = requests.get(f"{API_BASE_URL}/users/me", headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email", "").lower()

        sheet_response = requests.get(f"{API_BASE_URL}/sheets/{MASTER_SHEET_ID}", headers=headers)
        sheet_response.raise_for_status()
        sheet_data = sheet_response.json()
        
        column_map = {col["title"]: col["id"] for col in sheet_data.get("columns", [])}
        if not all(col in column_map for col in ["Submitter", "Assessment ID"]):
            raise HTTPException(500, "'Submitter' or 'Assessment ID' column not found.")
        
        submitter_col_id = column_map["Submitter"]
        assessment_id_col = column_map["Assessment ID"]

        processed_ids = set()
        for row in sheet_data.get("rows", []):
            submitter_cell = _get_cell_value(row, submitter_col_id)
            if submitter_cell and submitter_cell.lower() == user_email:
                try:
                    assessment_id_val = _get_cell_value(row, assessment_id_col)
                    if assessment_id_val is not None:
                        processed_ids.add(str(int(float(assessment_id_val))))
                except (ValueError, TypeError):
                    continue
        
        return JSONResponse(content={"total": len(processed_ids)})
    except Exception as e:
        print(f"Error fetching total assessments: {e}")
        raise HTTPException(500, "Failed to fetch total assessments")