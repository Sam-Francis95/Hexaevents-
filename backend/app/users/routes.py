from flask import Blueprint, request, current_app

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user

users_bp = Blueprint("users", __name__)

_EDITABLE_FIELDS = ["department", "college", "phone", "skills", "batch"]


def _serialize(u):
    return {
        "id": str(u["_id"]),
        "name": u.get("name"),
        "email": u.get("email"),
        "role": u.get("role", "participant"),
        "authProvider": u.get("authProvider"),
        "avatarUrl": u.get("avatarUrl", ""),
        "department": u.get("department", ""),
        "college": u.get("college", ""),
        "employeeId": u.get("employeeId", ""),
        "phone": u.get("phone", ""),
        "batch": u.get("batch", ""),
        "skills": u.get("skills", []),
    }


@users_bp.get("/me")
@require_auth
def get_me():
    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)
    return ok(_serialize(user))


@users_bp.patch("/me")
@require_auth
def update_me():
    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)

    body = request.get_json(silent=True) or {}
    updates = {field: body[field] for field in _EDITABLE_FIELDS if field in body}

    if updates:
        current_app.db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user = current_app.db.users.find_one({"_id": user["_id"]})

    return ok(_serialize(user), "Profile updated.")
