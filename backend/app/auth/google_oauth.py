import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

_VALID_ISSUERS = ("accounts.google.com", "https://accounts.google.com")

def verify_google_token(token: str):
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise ValueError("Google login isn't configured on the server yet (missing GOOGLE_CLIENT_ID).")

    try:
        payload = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

        if payload.get("iss") not in _VALID_ISSUERS:
            raise ValueError("Invalid token issuer.")
        if not payload.get("email_verified", False):
            raise ValueError("Google account email is not verified.")

        return payload
    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
