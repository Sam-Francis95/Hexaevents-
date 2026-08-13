from datetime import datetime, timezone

from flask import Blueprint, request, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user
from ..events.eligibility import evaluate_eligibility
from ..events.serializers import serialize_event
from ..email.mailer import send_email

registrations_bp = Blueprint("registrations", __name__)


def _serialize(r, event=None):
    r = dict(r)
    r["id"] = str(r.pop("_id"))
    r["eventId"] = str(r["eventId"])
    r["userId"] = str(r["userId"])
    if event is not None:
        r["event"] = serialize_event(current_app.db, event)
    return r


@registrations_bp.get("/event/<event_id>")
@require_auth
def get_registration_for_event(event_id):
    """Used by Event Details to decide whether to show 'Register' or
    'Cancel registration' — returns null (not 404) when there's simply no
    registration yet, since that's an expected, normal state, not an error."""
    user = current_user()
    try:
        event_oid = ObjectId(event_id)
    except InvalidId:
        return fail("Event not found.", "NOT_FOUND", status=404)

    reg = current_app.db.registrations.find_one({"userId": user["_id"], "eventId": event_oid})
    return ok(_serialize(reg) if reg else None)


@registrations_bp.get("/<registration_id>")
@require_auth
def get_registration_by_id(registration_id):
    """Used by the Submission page, which is linked to directly from My
    Registrations and needs the event (for teamSizeLimit/submissionDeadline)
    alongside the registration itself."""
    user = current_user()
    try:
        oid = ObjectId(registration_id)
    except InvalidId:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    reg = current_app.db.registrations.find_one({"_id": oid, "userId": user["_id"]})
    if not reg:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    event = current_app.db.events.find_one({"_id": reg["eventId"]})
    return ok(_serialize(reg, event))


@registrations_bp.get("")
@require_auth
def list_my_registrations():
    user = current_user()
    regs = list(current_app.db.registrations.find({"userId": user["_id"]}))
    result = []
    for r in regs:
        event = current_app.db.events.find_one({"_id": r["eventId"]})
        result.append(_serialize(r, event))
    return ok(result)


@registrations_bp.post("")
@require_auth
def create_registration():
    user = current_user()
    body = request.get_json(silent=True) or {}

    try:
        event_oid = ObjectId(body.get("eventId"))
    except (InvalidId, TypeError):
        return fail("Event not found.", "NOT_FOUND", status=404)

    event = current_app.db.events.find_one({"_id": event_oid})
    if not event:
        return fail("Event not found.", "NOT_FOUND", status=404)

    # Server-side eligibility gate — the UI disabling the button is a
    # courtesy, this check is the actual gate and cannot be bypassed
    # by calling the API directly.
    eligible, reasons = evaluate_eligibility(user, event)
    if not eligible:
        return fail("You are not eligible for this event.", "NOT_ELIGIBLE", details=reasons, status=403)

    if current_app.db.registrations.find_one({"userId": user["_id"], "eventId": event_oid}):
        return fail("You are already registered for this event.", "ALREADY_REGISTERED", status=409)

    # Hackathon team roster -- only collected/validated when the event
    # actually requires a submission (gated on the boolean field, never on
    # the category label). teamMembers here is the *rest* of the team, i.e.
    # teammates in addition to the person registering -- teamSizeLimit is
    # validated against this array's length. Enforced server-side because,
    # same as eligibility, the UI's min/max on the form is a courtesy.
    team_members = []
    if event.get("requiresSubmission"):
        raw_members = body.get("teamMembers", [])
        if not isinstance(raw_members, list):
            return fail("teamMembers must be a list.", "VALIDATION_ERROR", status=400)

        for member in raw_members:
            name = str((member or {}).get("name", "")).strip()
            email = str((member or {}).get("email", "")).strip()
            if not name or not email:
                return fail("Each team member needs a name and an email.", "VALIDATION_ERROR", status=400)
            team_members.append({"name": name, "email": email})

        limit = event.get("teamSizeLimit") or {}
        min_size = limit.get("min", 0)
        max_size = limit.get("max", min_size)
        if not (min_size <= len(team_members) <= max_size):
            return fail(
                f"This event requires between {min_size} and {max_size} additional team members "
                f"(you listed {len(team_members)}).",
                "TEAM_SIZE_INVALID",
                status=400,
            )

    registered_count = current_app.db.registrations.count_documents({
        "eventId": event_oid,
        "status": {"$ne": "rejected"},
    })
    is_full = registered_count >= event.get("capacity", 0)

    registration = {
        "eventId": event_oid,
        "userId": user["_id"],
        "formResponses": body.get("formResponses", {}),
        "teamMembers": team_members,
        "status": "waitlisted" if is_full else "registered",
        "attended": False,
        "registeredAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    result = current_app.db.registrations.insert_one(registration)
    registration["_id"] = result.inserted_id

    send_email(
        to=user["email"],
        subject=f"You're {'waitlisted for' if is_full else 'registered for'}: {event['title']}",
        template="registration_confirmation.html",
        context={
            "name": user.get("name", ""),
            "event_title": event["title"],
            "status": registration["status"],
        },
    )

    message = "Added to the waitlist." if is_full else "Registration submitted."
    return ok(_serialize(registration, event), message)


@registrations_bp.delete("/<registration_id>")
@require_auth
def cancel_registration(registration_id):
    user = current_user()
    try:
        oid = ObjectId(registration_id)
    except InvalidId:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    reg = current_app.db.registrations.find_one({"_id": oid, "userId": user["_id"]})
    if not reg:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    current_app.db.registrations.delete_one({"_id": oid})
    return ok(None, "Registration cancelled.")
