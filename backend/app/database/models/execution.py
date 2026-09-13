import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core import Base
from .user import generate_uuid

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True) # Optional for individual events
    participant_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    repository_url = Column(String, nullable=True)
    demo_video_url = Column(String, nullable=True)
    presentation_url = Column(String, nullable=True)
    
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    event = relationship("Event", back_populates="submissions")
    team = relationship("Team", back_populates="submission")
    participant = relationship("User")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime, nullable=True)
    
    event = relationship("Event", back_populates="attendance")
    participant = relationship("User")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, default=generate_uuid)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    
    issue_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    credential_url = Column(String, nullable=True)
    status = Column(String, default="issued")
    
    event = relationship("Event", back_populates="certificates")
    user = relationship("User", back_populates="certificates")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False) # system, event_update, achievement
    link = Column(String, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="notifications")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=generate_uuid)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    event = relationship("Event", back_populates="feedback")
    user = relationship("User", back_populates="feedback")
