"""
Shared JWT auth helpers for protected routes. Works identically regardless of
whether the user originally logged in via Google or User ID/password — both
paths converge on the same JWT.
"""
from functools import wraps
from flask import current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from bson import ObjectId


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper


def current_user():
    user_id = get_jwt_identity()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return current_app.db.users.find_one({"_id": oid})
