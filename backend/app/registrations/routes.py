from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from app.database.core import get_db
from app.database.models.registration import Registration
from app.database.models.event import Event
from app.database.models.user import User
from app.schemas.core import ok, fail
from app.schemas.registration import RegistrationResponse, RegistrationCreateRequest
from app.auth.dependencies import get_current_user
from app.events.eligibility import evaluate_eligibility
from app.events.routes import serialize_event

router = APIRouter()

def _serialize(r: Registration, event: Optional[Event] = None):
    reg_dict = RegistrationResponse.model_validate(r).model_dump(by_alias=True)
    if event:
        reg_dict["event"] = serialize_event(event)
    return reg_dict

@router.get("/event/{event_id}")
def get_registration_for_event(event_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reg = db.query(Registration).filter(Registration.participant_id == current_user.id, Registration.event_id == event_id).first()
    if reg:
        return ok(_serialize(reg))
    return ok(None)

@router.get("/{registration_id}")
def get_registration_by_id(registration_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reg = db.query(Registration).filter(Registration.id == registration_id, Registration.participant_id == current_user.id).first()
    if not reg:
        return fail("Registration not found.", "NOT_FOUND", 404)
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    return ok(_serialize(reg, event))

@router.get("")
def list_my_registrations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    regs = db.query(Registration).filter(Registration.participant_id == current_user.id).all()
    result = []
    for r in regs:
        event = db.query(Event).filter(Event.id == r.event_id).first()
        result.append(_serialize(r, event))
    return ok(result)

@router.post("")
def create_registration(body: RegistrationCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == body.eventId).first()
    if not event:
        return fail("Event not found.", "NOT_FOUND", 404)

    eligible, reasons = evaluate_eligibility(current_user, event)
    if not eligible:
        return fail("You are not eligible for this event.", "NOT_ELIGIBLE", 403)

    if db.query(Registration).filter(Registration.participant_id == current_user.id, Registration.event_id == event.id).first():
        return fail("You are already registered for this event.", "ALREADY_REGISTERED", 409)

    team_members = body.teamMembers or []
    if event.requires_submission:
        for member in team_members:
            name = str(member.get("name", "")).strip()
            email = str(member.get("email", "")).strip()
            if not name or not email:
                return fail("Each team member needs a name and an email.", "VALIDATION_ERROR", 400)
            member["name"] = name
            member["email"] = email

        limit = event.team_size_limit or {}
        min_size = limit.get("min", 0)
        max_size = limit.get("max", min_size)
        if not (min_size <= len(team_members) <= max_size):
            return fail(
                f"This event requires between {min_size} and {max_size} additional team members (you listed {len(team_members)}).",
                "TEAM_SIZE_INVALID", 400
            )

    active_regs = db.query(Registration).filter(Registration.event_id == event.id, Registration.status != "rejected").count()
    is_full = event.capacity > 0 and active_regs >= event.capacity
    status = "waitlisted" if is_full else "registered"

    # Build participant snapshot
    participant_snapshot = {
        "department": current_user.department,
        "college": current_user.college,
        "phone": current_user.phone,
        "batch": current_user.batch,
        "skills": current_user.skills,
    }

    reg = Registration(
        event_id=event.id,
        participant_id=current_user.id, # Note: using participant_id mapped to user_id
        form_responses=body.formResponses,
        team_members=team_members,
        participant_snapshot=participant_snapshot,
        status=status,
        attended=False
    )
    # The models/registration.py defines it as `participant_id`
    # Let me ensure I use `participant_id` in the Registration Response
    # Or in _serialize we map it correctly. Wait, I used user_id in _serialize?
    # Let's fix that.
    
    db.add(reg)
    try:
        db.commit()
        db.refresh(reg)
    except IntegrityError:
        db.rollback()
        return fail("You are already registered for this event.", "ALREADY_REGISTERED", 409)

    message = "Added to the waitlist." if is_full else "Registration submitted."
    return ok(_serialize(reg, event), message)

@router.delete("/{registration_id}")
def cancel_registration(registration_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reg = db.query(Registration).filter(Registration.id == registration_id, Registration.participant_id == current_user.id).first()
    if not reg:
        return fail("Registration not found.", "NOT_FOUND", 404)
    db.delete(reg)
    db.commit()
    return ok(None, "Registration cancelled.")
