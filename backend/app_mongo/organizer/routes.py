from datetime import datetime, timezone
from flask import Blueprint, request, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, require_role, current_user
from ..events.serializers import serialize_event
from ..registrations.routes import _serialize as serialize_registration
def create_notification(db, participant_id, title, message, link):
    from datetime import datetime, timezone
    from bson import ObjectId
    db.notifications.insert_one({
        "userId": ObjectId(participant_id) if isinstance(participant_id, str) else participant_id,
        "title": title,
        "message": message,
        "link": link,
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

organizer_bp = Blueprint("organizer", __name__)

def _find_event_or_404(event_id, organizer_id):
    try:
        oid = ObjectId(event_id)
    except InvalidId:
        return None
    return current_app.db.events.find_one({"_id": oid, "organizerId": str(organizer_id)})

@organizer_bp.before_request
@require_auth
@require_role("event_manager")
def organizer_guard():
    """Ensure all routes in this blueprint require event_manager role."""
    pass

@organizer_bp.get("/events")
def list_managed_events():
    user = current_user()
    events = list(current_app.db.events.find({"organizerId": str(user["_id"])}))
    
    # Add some basic stats to the event listing
    for e in events:
        eid_str = str(e["_id"])
        e["stats"] = {
            "registrations": current_app.db.registrations.count_documents({"eventId": eid_str}),
            "approved": current_app.db.registrations.count_documents({"eventId": eid_str, "status": "approved"}),
            "pending": current_app.db.registrations.count_documents({"eventId": eid_str, "status": "pending"})
        }

    return ok([serialize_event(current_app.db, e) for e in events])

@organizer_bp.post("/events")
def create_event():
    user = current_user()
    body = request.get_json() or {}
    
    now = datetime.now(timezone.utc).isoformat()
    new_event = {
        "title": body.get("title", ""),
        "description": body.get("description", ""),
        "category": body.get("category", ""),
        "mode": body.get("mode", ""),
        "venue": body.get("venue", ""),
        "startDate": body.get("startDate", ""),
        "endDate": body.get("endDate", ""),
        "registrationDeadline": body.get("registrationDeadline", ""),
        "capacity": body.get("capacity", 0),
        "eligibilityRules": body.get("eligibilityRules", []),
        "agenda": body.get("agenda", []),
        "status": body.get("status", "draft"),
        "organizerId": str(user["_id"]),
        "requiresSubmission": body.get("requiresSubmission", False),
        "teamSizeLimit": body.get("teamSizeLimit", None),
        "submissionDeadline": body.get("submissionDeadline", ""),
        "bannerColor": body.get("bannerColor", "#5B5FEE"),
        "createdAt": now,
        "updatedAt": now
    }
    
    result = current_app.db.events.insert_one(new_event)
    new_event["_id"] = result.inserted_id
    
    return ok(serialize_event(current_app.db, new_event), "Event created successfully")

@organizer_bp.get("/events/<event_id>")
def get_event(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    return ok(serialize_event(current_app.db, event))

@organizer_bp.put("/events/<event_id>")
def update_event(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    body = request.get_json() or {}
    update_data = {k: v for k, v in body.items() if k not in ["_id", "organizerId", "createdAt"]}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    current_app.db.events.update_one({"_id": event["_id"]}, {"$set": update_data})
    
    updated_event = current_app.db.events.find_one({"_id": event["_id"]})
    return ok(serialize_event(current_app.db, updated_event), "Event updated successfully")

@organizer_bp.get("/events/<event_id>/registrations")
def get_event_registrations(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    registrations = list(current_app.db.registrations.find({"eventId": str(event["_id"])}))
    
    # Manually fetch participant details for each registration to give to the organizer
    for r in registrations:
        try:
            pid = ObjectId(r.get("userId", r.get("participantId")))
            participant = current_app.db.users.find_one({"_id": pid})
            if participant:
                r["participant"] = {
                    "id": str(participant["_id"]),
                    "name": participant.get("name"),
                    "email": participant.get("email"),
                    "department": participant.get("department")
                }
        except Exception:
            r["participant"] = None

    return ok([serialize_registration(r) for r in registrations])

@organizer_bp.put("/registrations/<reg_id>/status")
def update_registration_status(reg_id):
    user = current_user()
    try:
        rid = ObjectId(reg_id)
    except InvalidId:
        return fail("Invalid registration ID", status=400)
        
    reg = current_app.db.registrations.find_one({"_id": rid})
    if not reg:
        return fail("Registration not found", status=404)
        
    # Verify ownership of event
    event = _find_event_or_404(reg["eventId"], user["_id"])
    if not event:
        return fail("Unauthorized.", status=403)
        
    body = request.get_json() or {}
    new_status = body.get("status")
    if new_status not in ["approved", "rejected", "waitlisted"]:
        return fail("Invalid status.", status=400)
        
    current_app.db.registrations.update_one({"_id": rid}, {"$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc).isoformat()}})
    
    # Send notification
    status_msg = "approved" if new_status == "approved" else "rejected" if new_status == "rejected" else "waitlisted"
    create_notification(
        current_app.db,
        participant_id=reg.get("userId", reg.get("participantId")),
        title="Registration Status Update",
        message=f"Your registration for {event['title']} has been {status_msg}.",
        link=f"/participant/events/{event['_id']}"
    )
    
    updated_reg = current_app.db.registrations.find_one({"_id": rid})
    return ok(serialize_registration(updated_reg), f"Registration marked as {new_status}")

@organizer_bp.get("/events/<event_id>/attendance")
def get_attendance(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    approved_regs = list(current_app.db.registrations.find({"eventId": str(event["_id"]), "status": "approved"}))
    
    attendees = []
    for r in approved_regs:
        try:
            pid = ObjectId(r.get("userId", r.get("participantId")))
            participant = current_app.db.users.find_one({"_id": pid})
            if participant:
                # Check actual attendance collection if it exists
                att_record = current_app.db.attendance.find_one({"eventId": str(event["_id"]), "participantId": str(participant["_id"])})
                
                attendees.append({
                    "id": str(r["_id"]),
                    "participantId": str(participant["_id"]),
                    "name": participant.get("name"),
                    "email": participant.get("email"),
                    "checkedIn": att_record is not None,
                    "checkedInAt": att_record.get("timestamp") if att_record else None
                })
        except Exception:
            pass
            
    return ok({"attendees": attendees})

@organizer_bp.post("/events/<event_id>/attendance/check-in")
def check_in_attendee(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    body = request.get_json() or {}
    participant_id = body.get("participantId")
    if not participant_id:
        return fail("Missing participantId.", status=400)
        
    reg = current_app.db.registrations.find_one({"eventId": str(event["_id"]), "userId": ObjectId(participant_id) if isinstance(participant_id, str) else participant_id, "status": "approved"})
    if not reg:
        return fail("Participant is not registered or not approved.", status=400)
        
    # Check if already checked in
    existing = current_app.db.attendance.find_one({"eventId": str(event["_id"]), "participantId": participant_id})
    if existing:
        return fail("Participant already checked in.", status=400)
        
    current_app.db.attendance.insert_one({
        "eventId": str(event["_id"]),
        "participantId": participant_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return ok(None, "Participant checked in successfully.")

@organizer_bp.post("/events/<event_id>/announcements")
def send_announcement(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    body = request.get_json() or {}
    title = body.get("title")
    message = body.get("message")
    audience = body.get("audience", "all") # "all", "approved", "waitlisted"
    
    if not title or not message:
        return fail("Title and message required.", status=400)
        
    query = {"eventId": str(event["_id"])}
    if audience in ["approved", "waitlisted"]:
        query["status"] = audience
        
    regs = current_app.db.registrations.find(query)
    
    count = 0
    for r in regs:
        create_notification(
            current_app.db,
            participant_id=r.get("userId", r.get("participantId")),
            title=title,
            message=message,
            link=f"/participant/events/{event['_id']}"
        )
        count += 1
        
    # Save announcement to DB
    current_app.db.announcements.insert_one({
        "eventId": str(event["_id"]),
        "organizerId": str(user["_id"]),
        "title": title,
        "message": message,
        "audience": audience,
        "sentCount": count,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })
        
    return ok({"sentCount": count}, f"Announcement sent to {count} participants.")

@organizer_bp.get("/events/<event_id>/analytics")
def get_analytics(event_id):
    user = current_user()
    event = _find_event_or_404(event_id, user["_id"])
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", status=404)
        
    eid_str = str(event["_id"])
    
    total_regs = current_app.db.registrations.count_documents({"eventId": eid_str})
    approved_regs = current_app.db.registrations.count_documents({"eventId": eid_str, "status": "approved"})
    pending_regs = current_app.db.registrations.count_documents({"eventId": eid_str, "status": "pending"})
    waitlisted_regs = current_app.db.registrations.count_documents({"eventId": eid_str, "status": "waitlisted"})
    rejected_regs = current_app.db.registrations.count_documents({"eventId": eid_str, "status": "rejected"})
    
    attendance_count = current_app.db.attendance.count_documents({"eventId": eid_str})
    submissions_count = current_app.db.submissions.count_documents({"eventId": eid_str})
    
    return ok({
        "registrations": {
            "total": total_regs,
            "approved": approved_regs,
            "pending": pending_regs,
            "waitlisted": waitlisted_regs,
            "rejected": rejected_regs
        },
        "attendance": {
            "expected": approved_regs,
            "checkedIn": attendance_count,
            "rate": (attendance_count / approved_regs * 100) if approved_regs > 0 else 0
        },
        "submissions": {
            "total": submissions_count,
            "rate": (submissions_count / approved_regs * 100) if approved_regs > 0 else 0
        }
    })
