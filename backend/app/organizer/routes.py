from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database.core import get_db
from app.database.models.user import User
from app.database.models.event import Event
from app.database.models.registration import Registration
from app.database.models.execution import Attendance
from app.auth.dependencies import get_current_organizer
from app.schemas.core import ok, fail
from app.schemas.event import EventResponse, EventBase
from app.events.routes import serialize_event

router = APIRouter(dependencies=[Depends(get_current_organizer)])

@router.get("/events")
def list_managed_events(current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.organizer_id == current_user.id).all()
    
    result = []
    for e in events:
        e_dict = serialize_event(e)
        
        # Add basic stats
        total_regs = db.query(Registration).filter(Registration.event_id == e.id).count()
        approved_regs = db.query(Registration).filter(Registration.event_id == e.id, Registration.status == "approved").count()
        pending_regs = db.query(Registration).filter(Registration.event_id == e.id, Registration.status == "pending").count()
        
        e_dict["stats"] = {
            "registrations": total_regs,
            "approved": approved_regs,
            "pending": pending_regs
        }
        result.append(e_dict)
        
    return ok(result)

@router.post("/events")
def create_event(body: EventBase, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    event = Event(
        **body.model_dump(by_alias=False, exclude_unset=True),
        organizer_id=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return ok(serialize_event(event), "Event created successfully")

@router.get("/events/{event_id}")
def get_event(event_id: str, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.organizer_id == current_user.id).first()
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", 404)
    return ok(serialize_event(event))

@router.put("/events/{event_id}")
def update_event(event_id: str, body: dict, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.organizer_id == current_user.id).first()
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", 404)
        
    update_data = {k: v for k, v in body.items() if k not in ["id", "organizerId", "createdAt"]}
    
    field_map = {
        "startDate": "start_date",
        "endDate": "end_date",
        "registrationDeadline": "registration_deadline",
        "eligibilityRules": "eligibility_rules",
        "requiresSubmission": "requires_submission",
        "teamSizeLimit": "team_size_limit",
        "submissionDeadline": "submission_deadline",
        "bannerColor": "banner_color"
    }
    
    for key, value in update_data.items():
        attr_name = field_map.get(key, key)
        if hasattr(event, attr_name):
            setattr(event, attr_name, value)
            
    db.commit()
    db.refresh(event)
    
    return ok(serialize_event(event), "Event updated successfully")

@router.get("/events/{event_id}/registrations")
def get_event_registrations(event_id: str, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.organizer_id == current_user.id).first()
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", 404)
        
    registrations = db.query(Registration).filter(Registration.event_id == event.id).all()
    
    result = []
    from app.registrations.routes import _serialize as serialize_registration
    
    for r in registrations:
        reg_dict = serialize_registration(r)
        participant = db.query(User).filter(User.id == r.participant_id).first()
        if participant:
            reg_dict["participant"] = {
                "id": participant.id,
                "name": participant.name,
                "email": participant.email,
                "department": participant.department,
                "college": participant.college,
                "phone": participant.phone,
                "batch": participant.batch,
                "skills": participant.skills
            }
        else:
            reg_dict["participant"] = None
            
        result.append(reg_dict)
        
    return ok(result)

@router.put("/registrations/{reg_id}/status")
def update_registration_status(reg_id: str, body: dict, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    reg = db.query(Registration).filter(Registration.id == reg_id).first()
    if not reg:
        return fail("Registration not found", "NOT_FOUND", 404)
        
    event = db.query(Event).filter(Event.id == reg.event_id, Event.organizer_id == current_user.id).first()
    if not event:
        return fail("Unauthorized.", "UNAUTHORIZED", 403)
        
    new_status = body.get("status")
    if new_status not in ["approved", "rejected", "waitlisted"]:
        return fail("Invalid status.", "VALIDATION_ERROR", 400)
        
    reg.status = new_status
    db.commit()
    db.refresh(reg)
    
    from app.registrations.routes import _serialize as serialize_registration
    return ok(serialize_registration(reg), f"Registration marked as {new_status}")

@router.get("/events/{event_id}/analytics")
def get_analytics(event_id: str, current_user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.organizer_id == current_user.id).first()
    if not event:
        return fail("Event not found or unauthorized.", "NOT_FOUND", 404)
        
    total_regs = db.query(Registration).filter(Registration.event_id == event.id).count()
    approved_regs = db.query(Registration).filter(Registration.event_id == event.id, Registration.status == "approved").count()
    pending_regs = db.query(Registration).filter(Registration.event_id == event.id, Registration.status == "pending").count()
    waitlisted_regs = db.query(Registration).filter(Registration.event_id == event.id, Registration.status == "waitlisted").count()
    rejected_regs = db.query(Registration).filter(Registration.event_id == event.id, Registration.status == "rejected").count()
    
    attendance_count = db.query(Attendance).filter(Attendance.event_id == event.id).count()
    
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
            "total": 0,
            "rate": 0
        }
    })
