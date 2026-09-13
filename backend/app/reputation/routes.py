from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database.core import get_db
from app.database.models.reputation import XPTransaction, ParticipantAchievement
from app.database.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.core import ok, fail

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/me")
def get_my_reputation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_xp = db.query(func.sum(XPTransaction.xp_amount)).filter(XPTransaction.participant_id == current_user.id).scalar() or 0
    current_level = (total_xp // 100) + 1
    
    xp_to_next_level = 100
    next_level_xp = current_level * 100
    
    # Very basic static badge/name mapping for now
    level_name = "Novice Innovator" if current_level < 5 else "Expert Builder"
    level_badge = "🚀" if current_level < 5 else "🔥"
    
    transactions = db.query(XPTransaction).filter(XPTransaction.participant_id == current_user.id).order_by(XPTransaction.created_at.desc()).limit(10).all()
    
    return ok({
        "totalXP": total_xp,
        "currentLevel": current_level,
        "levelName": level_name,
        "levelBadge": level_badge,
        "nextLevelXP": next_level_xp,
        "xpToNextLevel": xp_to_next_level,
        "recentActivity": [{
            "id": t.id,
            "amount": t.xp_amount,
            "description": t.description,
            "date": t.created_at.isoformat(),
            "sourceType": t.source_type
        } for t in transactions]
    })

@router.get("/me/achievements")
def get_my_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    achievements = db.query(ParticipantAchievement).filter(ParticipantAchievement.participant_id == current_user.id).all()
    
    return ok({
        "earned": [{
            "id": a.id,
            "achievementId": a.achievement_id,
            "earnedAt": a.earned_at.isoformat()
        } for a in achievements],
        "inProgress": []
    })

@router.post("/me/award-xp")
def manual_award_xp(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    source_type = body.get("sourceType")
    source_id = body.get("sourceId")
    amount = body.get("amount")
    description = body.get("description", "Activity completed")

    if not all([source_type, source_id, amount]):
        return fail("Missing required fields: sourceType, sourceId, amount", "BAD_REQUEST", 400)

    # Check if already awarded for this specific source
    existing = db.query(XPTransaction).filter(
        XPTransaction.participant_id == current_user.id,
        XPTransaction.source_type == source_type,
        XPTransaction.source_id == source_id
    ).first()
    
    if existing:
        return fail("XP already awarded for this activity.", "BAD_REQUEST", 400)
        
    tx = XPTransaction(
        participant_id=current_user.id,
        xp_amount=int(amount),
        description=description,
        source_type=source_type,
        source_id=source_id
    )
    db.add(tx)
    db.commit()
    
    return ok({"awarded": amount}, "XP awarded successfully.")
