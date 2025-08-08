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
        redirect_response = RedirectResponse(url="http://localhost:5173/assessments")
        
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
