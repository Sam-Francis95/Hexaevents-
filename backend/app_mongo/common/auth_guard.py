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


def require_role(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = current_user()
            if not user or user.get("role") != role:
                from flask import jsonify
                return jsonify({"success": False, "message": "Unauthorized role.", "error": "FORBIDDEN"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def current_user():
    user_id = get_jwt_identity()
    user = current_app.db.users.find_one({"_id": user_id})
    if user:
        return user
    try:
        oid = ObjectId(user_id)
        return current_app.db.users.find_one({"_id": oid})
    except Exception:
        return None
