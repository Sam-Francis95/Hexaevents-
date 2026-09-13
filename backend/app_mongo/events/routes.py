from flask import Blueprint, request, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user
from .eligibility import evaluate_eligibility
from .serializers import serialize_event

events_bp = Blueprint("events", __name__)


def _find_event_or_404(event_id):
    try:
        oid = ObjectId(event_id)
    except InvalidId:
        return None
    return current_app.db.events.find_one({"_id": oid})


@events_bp.get("")
def list_events():
    query = {}
    category = request.args.get("category")
    mode = request.args.get("mode")
    status = request.args.get("status")
    search = request.args.get("search")

    if category:
        query["category"] = category
    if mode:
        query["mode"] = mode
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    events = list(current_app.db.events.find(query))
    return ok([serialize_event(current_app.db, e) for e in events])


@events_bp.get("/categories")
def list_categories():
    categories = current_app.db.events.distinct("category")
    return ok(categories)


@events_bp.get("/<event_id>")
def get_event(event_id):
    event = _find_event_or_404(event_id)
    if not event:
        return fail("Event not found.", "NOT_FOUND", status=404)
    return ok(serialize_event(current_app.db, event))


@events_bp.get("/<event_id>/eligibility")
@require_auth
def check_eligibility(event_id):
    event = _find_event_or_404(event_id)
    if not event:
        return fail("Event not found.", "NOT_FOUND", status=404)

    user = current_user()
    if not user:
        return fail("User not found.", "NOT_FOUND", status=404)

    eligible, reasons = evaluate_eligibility(user, event)
    return ok({"eligible": eligible, "reasons": reasons, "rules": event.get("eligibilityRules", [])})
