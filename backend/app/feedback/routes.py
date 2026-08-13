from datetime import datetime, timezone

from flask import Blueprint, request, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user

feedback_bp = Blueprint("feedback", __name__)


def _serialize(entry):
    entry = dict(entry)
    entry["id"] = str(entry.pop("_id"))
    entry["eventId"] = str(entry["eventId"])
    entry["userId"] = str(entry["userId"])
    return entry


@feedback_bp.get("")
@require_auth
def list_my_feedback():
    """Bulk list, used by My Registrations to know which completed events
    still need feedback without an extra round trip per row."""
    user = current_user()
    entries = list(current_app.db.feedback.find({"userId": user["_id"]}))
    return ok([_serialize(e) for e in entries])


@feedback_bp.post("")
@require_auth
def submit_feedback():
    user = current_user()
    body = request.get_json(silent=True) or {}

    rating = body.get("rating")
    if not rating or not (1 <= int(rating) <= 5):
        return fail("Please select a rating.", "VALIDATION_ERROR", status=400)

    try:
        event_oid = ObjectId(body.get("eventId"))
    except (InvalidId, TypeError):
        return fail("Event not found.", "NOT_FOUND", status=404)

    if current_app.db.feedback.find_one({"userId": user["_id"], "eventId": event_oid}):
        return fail("You already submitted feedback for this event.", "ALREADY_SUBMITTED", status=409)

    entry = {
        "eventId": event_oid,
        "userId": user["_id"],
        "rating": int(rating),
        "comments": body.get("comments", ""),
        "suggestions": body.get("suggestions", ""),
        "submittedAt": datetime.now(timezone.utc).isoformat(),
    }
    result = current_app.db.feedback.insert_one(entry)
    entry["_id"] = result.inserted_id
    return ok(_serialize(entry), "Thanks for your feedback.")


@feedback_bp.get("/<event_id>")
@require_auth
def get_feedback_for_event(event_id):
    user = current_user()
    try:
        event_oid = ObjectId(event_id)
    except InvalidId:
        return fail("Event not found.", "NOT_FOUND", status=404)

    entry = current_app.db.feedback.find_one({"userId": user["_id"], "eventId": event_oid})
    return ok(_serialize(entry) if entry else None)
