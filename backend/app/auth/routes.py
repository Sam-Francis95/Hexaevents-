from datetime import datetime, timezone

from flask import Blueprint, request, current_app

from ..common.responses import ok, fail
from .security import hash_password, verify_password, issue_token
from .google_oauth import verify_google_token

auth_bp = Blueprint("auth", __name__)


def _serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "participant"),
        "authProvider": user.get("authProvider"),
        "avatarUrl": user.get("avatarUrl", ""),
        "department": user.get("department", ""),
        "college": user.get("college", ""),
        "employeeId": user.get("employeeId", ""),
        "phone": user.get("phone", ""),
        "batch": user.get("batch", ""),
        "createdAt": user.get("createdAt"),
    }


@auth_bp.post("/register")
def register():
    """Direct sign-up — 'registration directly by students' per the MoM."""
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not name or not email or not password:
        return fail("Name, email, and password are all required.", "VALIDATION_ERROR", status=400)
    if len(password) < 8:
        return fail("Password must be at least 8 characters.", "VALIDATION_ERROR", status=400)

    users = current_app.db.users
    if users.find_one({"email": email}):
        return fail("An account with this email already exists.", "EMAIL_TAKEN", status=409)

    user = {
        "name": name,
        "email": email,
        "passwordHash": hash_password(password),
        "role": "participant",
        "authProvider": "local",
        "avatarUrl": "",
        "department": body.get("department", ""),
        "college": body.get("college", ""),
        "employeeId": body.get("employeeId", ""),
        "phone": body.get("phone", ""),
        "batch": body.get("batch", ""),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    result = users.insert_one(user)
    user["_id"] = result.inserted_id

    token = issue_token(user)
    return ok({"token": token, "user": _serialize_user(user)}, "Account created.")


@auth_bp.post("/login")
def login():
    """User ID (email) + password login."""
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    users = current_app.db.users
    user = users.find_one({"email": email})

    if not user or user.get("authProvider") != "local":
        return fail("Invalid email or password.", "INVALID_CREDENTIALS", status=401)
    if not verify_password(password, user.get("passwordHash")):
        return fail("Invalid email or password.", "INVALID_CREDENTIALS", status=401)

    token = issue_token(user)
    return ok({"token": token, "user": _serialize_user(user)}, "Logged in successfully.")


@auth_bp.post("/google")
def google_login():
    """
    Frontend sends the Google ID token (the 'credential' from
    @react-oauth/google's GoogleLogin component) here. We verify it
    server-side, then find-or-create the user and issue our own JWT —
    from this point on the rest of the app never touches Google again.
    """
    body = request.get_json(silent=True) or {}
    credential = body.get("credential")
    if not credential:
        return fail("Missing Google credential.", "VALIDATION_ERROR", status=400)

    try:
        payload = verify_google_token(credential)
    except ValueError as e:
        return fail(str(e), "INVALID_GOOGLE_TOKEN", status=401)

    email = payload["email"].lower()
    users = current_app.db.users
    user = users.find_one({"email": email})

    if not user:
        user = {
            "name": payload.get("name", email.split("@")[0]),
            "email": email,
            "passwordHash": None,
            "role": "participant",
            "authProvider": "google",
            "avatarUrl": payload.get("picture", ""),
            "department": "",
            "college": "",
            "employeeId": "",
            "phone": "",
            "batch": "",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        result = users.insert_one(user)
        user["_id"] = result.inserted_id

    token = issue_token(user)
    return ok({"token": token, "user": _serialize_user(user)}, "Logged in with Google.")
