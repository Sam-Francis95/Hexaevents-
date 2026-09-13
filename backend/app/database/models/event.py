import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core import Base
from .user import generate_uuid

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    mode = Column(String, nullable=False)
    venue = Column(String, default="")
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=True)
    
    capacity = Column(Integer, default=0)
    eligibility_rules = Column(JSON, default=list)
    agenda = Column(JSON, default=list)
    status = Column(String, default="draft")
    
    organizer_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    requires_submission = Column(Boolean, default=False)
    team_size_limit = Column(JSON, nullable=True)
    submission_deadline = Column(DateTime, nullable=True)
    banner_color = Column(String, default="#5B5FEE")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organizer = relationship("User", back_populates="organized_events")
    registrations = relationship("Registration", back_populates="event")
    teams = relationship("Team", back_populates="event")
    submissions = relationship("Submission", back_populates="event")
    attendance = relationship("Attendance", back_populates="event")
    certificates = relationship("Certificate", back_populates="event")
    feedback = relationship("Feedback", back_populates="event")
