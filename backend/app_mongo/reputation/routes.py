from flask import Blueprint, current_app, request
from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user
from .services import get_reputation_summary, get_participant_achievements, award_xp

reputation_bp = Blueprint("reputation", __name__)

@reputation_bp.get("/me")
@require_auth
def get_my_reputation():
    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)
        
    summary = get_reputation_summary(current_app.db, str(user["_id"]))
    if not summary:
        return fail("Failed to fetch reputation.", "ERROR")
        
    return ok(summary)

@reputation_bp.get("/me/achievements")
@require_auth
def get_my_achievements():
    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)
        
    achievements_data = get_participant_achievements(current_app.db, str(user["_id"]))
    return ok(achievements_data)

# NOTE: This endpoint is mainly for demonstration purposes or webhook calls from internal services.
# In a real microservices arch, XP would be awarded securely via internal events, not a public facing API.
@reputation_bp.post("/me/award-xp")
@require_auth
def manual_award_xp():
    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)
        
    body = request.get_json(silent=True) or {}
    source_type = body.get("sourceType")
    source_id = body.get("sourceId")
    amount = body.get("amount")
    description = body.get("description", "Activity completed")

    if not all([source_type, source_id, amount]):
        return fail("Missing required fields: sourceType, sourceId, amount", "BAD_REQUEST")

    success, result = award_xp(
        current_app.db, 
        str(user["_id"]), 
        source_type, 
        source_id, 
        int(amount), 
        description
    )

    if not success:
        return fail(result, "BAD_REQUEST")

    return ok(result, "XP awarded successfully.")
