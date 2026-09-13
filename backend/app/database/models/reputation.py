import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..core import Base
from .user import generate_uuid

class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    source_type = Column(String, nullable=False) # event_registration, event_completion, certificate, achievement
    source_id = Column(String, nullable=False)
    xp_amount = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="xp_transactions")

class ParticipantAchievement(Base):
    __tablename__ = "participant_achievements"

    id = Column(String, primary_key=True, default=generate_uuid)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(String, nullable=False) # Maps to hardcoded ACHIEVEMENTS_REGISTRY
    
    progress = Column(Integer, default=0)
    unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint('participant_id', 'achievement_id', name='uq_participant_achievement'),
    )

    user = relationship("User", back_populates="achievements")
