import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core import Base

def generate_uuid():
    return str(uuid.uuid4())

class Role(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(String, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    avatar_url = Column(String, default="")
    
    # Organization and Status
    organization_id = Column(String, nullable=True)
    status = Column(String, default="active")
    
    # Profile details
    department = Column(String, default="")
    college = Column(String, default="")
    employee_id = Column(String, default="")
    phone = Column(String, default="")
    batch = Column(String, default="")
    skills = Column(JSON, default=list)
    
    # Reputation
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    level_name = Column(String, default="Novice")
    level_badge = Column(String, default="🥉")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

    # Relationships
    roles = relationship("Role", secondary="user_roles")
    registrations = relationship("Registration", back_populates="participant")
    organized_events = relationship("Event", back_populates="organizer")
    xp_transactions = relationship("XPTransaction", back_populates="user")
    achievements = relationship("ParticipantAchievement", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("Feedback", back_populates="user")
