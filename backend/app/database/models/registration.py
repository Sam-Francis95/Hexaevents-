import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from ..core import Base
from .user import generate_uuid

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(String, primary_key=True, default=generate_uuid)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    
    status = Column(String, default="pending", nullable=False) # pending, approved, rejected, waitlisted
    
    form_responses = Column(JSON, default=dict)
    team_members = Column(JSON, default=list)
    participant_snapshot = Column(JSON, default=dict)
    attended = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('participant_id', 'event_id', name='uq_participant_event_registration'),
    )

    participant = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
    change_history = relationship("RegistrationChangeHistory", back_populates="registration", cascade="all, delete")

class RegistrationChangeHistory(Base):
    __tablename__ = "registration_change_history"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    registration_id = Column(String, ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String, nullable=False)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    changed_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    registration = relationship("Registration", back_populates="change_history")

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    leader_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    event = relationship("Event", back_populates="teams")
    leader = relationship("User")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete")
    submission = relationship("Submission", back_populates="team", uselist=False)

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String, primary_key=True, default=generate_uuid)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    participant_id = Column(String, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('team_id', 'participant_id', name='uq_team_participant'),
    )

    team = relationship("Team", back_populates="members")
    participant = relationship("User")
