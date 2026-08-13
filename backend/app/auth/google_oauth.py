"""
Verifies a Google ID token SERVER-SIDE. This is the part that actually makes
"Sign in with Google" trustworthy — the frontend hands us a credential, but
we never take its word for who the user is until Google's own libraries
confirm the signature, audience, and issuer ourselves.
"""
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import current_app

_VALID_ISSUERS = ("accounts.google.com", "https://accounts.google.com")


def verify_google_token(token):
    client_id = current_app.config["GOOGLE_CLIENT_ID"]
    if not client_id:
        raise ValueError("Google login isn't configured on the server yet (missing GOOGLE_CLIENT_ID).")

    payload = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

    if payload.get("iss") not in _VALID_ISSUERS:
        raise ValueError("Invalid token issuer.")
    if not payload.get("email_verified", False):
        raise ValueError("Google account email is not verified.")

    return payload
