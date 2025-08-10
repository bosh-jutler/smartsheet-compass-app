# ==========================================================================
# main.py: FastAPI Backend for Smartsheet OAuth
# ==========================================================================
#
# Description:
# This FastAPI application handles the server-side logic for the Smartsheet
# OAuth 2.0 flow. It provides two endpoints:
#
# 1. /api/login: Initiates the OAuth flow by redirecting the user to the
#    Smartsheet authorization URL with the necessary parameters.
#
# 2. /api/callback: Securely handles the callback from Smartsheet,
#    exchanges the authorization code for an access token, and stores the
#    token in a secure, signed HTTPOnly cookie.
#
# This architecture ensures that the client_secret and access tokens are
# never exposed to the client-side browser.
# ==========================================================================

import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from itsdangerous import URLSafeSerializer

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

# Serializer for securely signing the state and cookies
serializer = URLSafeSerializer(SESSION_SECRET_KEY)

@app.get("/api/login")
async def oauth_login(request: Request):
    """
    Initiates the OAuth 2.0 login flow.
    Redirects the user to the Smartsheet authorization page.
    """
    # Construct the authorization URL with required parameters
    auth_url_params = {
        "response_type": "code",
        "client_id": SMARTSHEET_CLIENT_ID,
        "scope": "READ_SHEETS",
        "redirect_uri": REDIRECT_URI,
    }
    
    # Redirect the user's browser to Smartsheet to authorize the app
    return RedirectResponse(url=f"{AUTHORIZATION_URL}?{requests.compat.urlencode(auth_url_params)}")

@app.get("/api/callback")
async def oauth_callback(code: str):
    """
    Handles the callback from Smartsheet after user authorization.
    Exchanges the authorization code for an access token and stores it.
    """
    try:
        # Prepare the request to exchange the code for a token
        token_request_payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": SMARTSHEET_CLIENT_ID,
            "client_secret": SMARTSHEET_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
        }

        # Make the server-to-server POST request
        response = requests.post(TOKEN_URL, data=token_request_payload, headers={
            "Content-Type": "application/x-www-form-urlencoded"
        })
        response.raise_for_status()  # Raise an exception for bad status codes

        token_data = response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise Exception("Access token not found in response")

        # Create a redirect response to the frontend assessments page
        redirect_response = RedirectResponse(url="http://localhost:5173/my-assessments")
        
        # Store the access token in a secure, signed, HTTPOnly cookie
        # This prevents the token from being accessed by client-side JavaScript (XSS)
        signed_token = serializer.dumps(access_token)
        redirect_response.set_cookie(
            key="access_token",
            value=signed_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
        )
        return redirect_response

    except Exception as e:
        print(f"An error occurred during token exchange: {e}")
        # Redirect to a login failure page if something goes wrong
        return RedirectResponse(url="http://localhost:5173/?error=auth_failed")
    
# ==========================================================================
# New Endpoint: /api/assessments
# ==========================================================================

# You will need to know the ID of your "Compass Assessments Index" sheet.
# For a real application, this would come from a database or a more robust
# configuration system. For now, we'll hardcode it.
ASSESSMENTS_INDEX_SHEET_ID = "6581841701064580"

@app.get("/api/assessments")
async def get_assessments(request: Request):
    """
    Fetches the list of assessments for the logged-in user from the
    "Compass Assessments Index" sheet in Smartsheet.
    """
    try:
        # Retrieve the signed access token from the secure cookie
        signed_token = request.cookies.get("access_token")
        if not signed_token:
            return {"error": "Not authenticated"}, 401

        # Un-sign the cookie to get the actual access token
        access_token = serializer.loads(signed_token)

        # Prepare the authenticated request to the Smartsheet API
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Get the current user's email from Smartsheet
        user_profile_url = "https://api.smartsheet.com/2.0/users/me"
        user_response = requests.get(user_profile_url, headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email")

        if not user_email:
            return {"error": "Could not retrieve user email"}, 500

        # Make the API call to get the specific sheet
        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{ASSESSMENTS_INDEX_SHEET_ID}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()

        sheet_data = response.json()
        
        # Create a map of column names to their IDs
        column_map = {col["title"]: col["id"] for col in sheet_data["columns"]}
        
        # Get the IDs for the columns we need
        name_col_id = column_map.get("Customer Name")
        date_col_id = column_map.get("Created Date")
        sheet_id_col_id = column_map.get("Assessment ID")
        industry_col_id = column_map.get("Industry")
        maturity_score_col_id = column_map.get("Maturity Score")
        submitter_col_id = column_map.get("Submitter")


        if not all([name_col_id, date_col_id, sheet_id_col_id, industry_col_id, maturity_score_col_id, submitter_col_id]):
             return {"error": "Required columns not found in sheet"}, 500

        assessments = []
        for row in sheet_data["rows"]:
            # Helper function to get cell value by column ID
            def get_cell_value(col_id):
                cell = next((c for c in row["cells"] if c["columnId"] == col_id), None)
                return cell.get("value") if cell else None

            submitter_email = get_cell_value(submitter_col_id)

            # Filter rows by the logged-in user's email
            if submitter_email and submitter_email.lower() == user_email.lower():
                assessment_name = get_cell_value(name_col_id)
                completion_date = get_cell_value(date_col_id)
                data_sheet_id = get_cell_value(sheet_id_col_id)
                industry = get_cell_value(industry_col_id)
                maturity_score = get_cell_value(maturity_score_col_id)

                # Ensure all required fields have a value before adding to the list
                if assessment_name and completion_date and data_sheet_id:
                    assessments.append({
                        "name": assessment_name,
                        "date": completion_date,
                        "sheetId": str(data_sheet_id),  # Ensure sheetId is a string
                        "industry": industry,
                        "maturityScore": maturity_score,
                    })

        return assessments

    except Exception as e:
        print(f"Error fetching assessments: {e}")
        return {"error": "Failed to fetch assessments"}, 500

# ==========================================================================
# New Endpoint: /api/dashboard/{sheet_id}
# ==========================================================================

@app.get("/api/dashboard/{sheet_id}")
async def get_dashboard_data(sheet_id: str, request: Request):
    """
    Fetches and parses the data for a specific assessment dashboard sheet.
    """
    try:
        # Retrieve and un-sign the access token from the secure cookie
        signed_token = request.cookies.get("access_token")
        if not signed_token:
            return {"error": "Not authenticated"}, 401
        access_token = serializer.loads(signed_token)

        # Prepare the authenticated request to the Smartsheet API
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Make the API call to get the specific sheet
        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{sheet_id}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()

        sheet_data = response.json()
        
        column_map = {col["title"]: col["id"] for col in sheet_data["columns"]}
        metric_col_id = column_map.get("Metric")
        value_col_id = column_map.get("Value")

        if not metric_col_id or not value_col_id:
            return {"error": "Dashboard sheet must contain 'Metric' and 'Value' columns."}, 500

        metrics = []
        for row in sheet_data["rows"]:
            def get_cell_value(col_id):
                cell = next((c for c in row["cells"] if c["columnId"] == col_id), None)
                return cell.get("displayValue") or cell.get("value") if cell else None

            metric_title = get_cell_value(metric_col_id)
            metric_value = get_cell_value(value_col_id)

            if metric_title and metric_value:
                metrics.append({"title": metric_title, "value": str(metric_value)})
        
        # Return the parsed data along with the sheet name
        return {
            "sheetName": sheet_data.get("name"),
            "metrics": metrics
        }

    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return {"error": "Failed to fetch dashboard data"}, 500

@app.get("/api/assessments/total")
async def get_total_assessments(request: Request):
    """
    Fetches the total number of assessments for the logged-in user.
    """
    try:
        # Retrieve the signed access token from the secure cookie
        signed_token = request.cookies.get("access_token")
        if not signed_token:
            return {"error": "Not authenticated"}, 401

        # Un-sign the cookie to get the actual access token
        access_token = serializer.loads(signed_token)

        # Prepare the authenticated request to the Smartsheet API
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Get the current user's email from Smartsheet
        user_profile_url = "https://api.smartsheet.com/2.0/users/me"
        user_response = requests.get(user_profile_url, headers=headers)
        user_response.raise_for_status()
        user_email = user_response.json().get("email")

        if not user_email:
            return {"error": "Could not retrieve user email"}, 500

        # Make the API call to get the specific sheet
        sheet_url = f"https://api.smartsheet.com/2.0/sheets/{ASSESSMENTS_INDEX_SHEET_ID}"
        response = requests.get(sheet_url, headers=headers)
        response.raise_for_status()

        sheet_data = response.json()
        
        # Create a map of column names to their IDs
        column_map = {col["title"]: col["id"] for col in sheet_data["columns"]}
        
        # Get the IDs for the columns we need
        submitter_col_id = column_map.get("Submitter")

        if not submitter_col_id:
             return {"error": "Required columns not found in sheet"}, 500

        total_assessments = 0
        for row in sheet_data["rows"]:
            # Helper function to get cell value by column ID
            def get_cell_value(col_id):
                cell = next((c for c in row["cells"] if c["columnId"] == col_id), None)
                return cell.get("value") if cell else None

            submitter_email = get_cell_value(submitter_col_id)

            # Filter rows by the logged-in user's email
            if submitter_email and submitter_email.lower() == user_email.lower():
                total_assessments += 1

        return {"total": total_assessments}

    except Exception as e:
        print(f"Error fetching total assessments: {e}")
        return {"error": "Failed to fetch total assessments"}, 500
