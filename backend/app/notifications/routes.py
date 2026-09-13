from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.core import get_db
from app.database.models.execution import Notification
from app.database.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.core import ok, fail

router = APIRouter(dependencies=[Depends(get_current_user)])

def _serialize(n: Notification):
    return {
        "id": n.id,
        "userId": n.user_id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "link": n.link,
        "isRead": n.is_read,
        "createdAt": n.created_at.isoformat()
    }

@router.get("")
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return ok([_serialize(n) for n in items])

@router.get("/unread-count")
def unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).count()
    return ok(count)

@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        return fail("Notification not found.", "NOT_FOUND", 404)
    
    n.is_read = True
    db.commit()
    return ok(None)

@router.patch("/mark-all-read")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return ok(None, "All notifications marked as read.")
