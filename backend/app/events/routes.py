from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.database.core import get_db
from app.database.models.event import Event
from app.database.models.user import User
from app.schemas.core import ok, fail
from app.schemas.event import EventResponse
from app.auth.dependencies import get_current_user
from app.events.eligibility import evaluate_eligibility

router = APIRouter()

def serialize_event(event: Event):
    event_dict = EventResponse.model_validate(event).model_dump(by_alias=True)
    # the registered_count comes from a subquery or python loop. 
    # Since we need to mimic `registeredCount`, we can just query it or load it via relationship
    active_registrations = [r for r in event.registrations if r.status != "rejected"]
    event_dict["registeredCount"] = len(active_registrations)
    return event_dict

@router.get("")
def list_events(
    category: Optional[str] = None,
    mode: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    if category:
        query = query.filter(Event.category == category)
    if mode:
        query = query.filter(Event.mode == mode)
    if status:
        query = query.filter(Event.status == status)
    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )
        
    events = query.all()
    return ok([serialize_event(e) for e in events])

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Event.category).distinct().all()
    return ok([c[0] for c in categories])

@router.get("/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return fail("Event not found.", "NOT_FOUND", 404)
    return ok(serialize_event(event))

@router.get("/{event_id}/eligibility")
def check_eligibility(event_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return fail("Event not found.", "NOT_FOUND", 404)

    eligible, reasons = evaluate_eligibility(current_user, event)
    return ok({"eligible": eligible, "reasons": reasons, "rules": event.eligibility_rules})
