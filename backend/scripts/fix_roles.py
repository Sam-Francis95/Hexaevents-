import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.core import SessionLocal
from app.database.models.user import User, Role
from app.database.models.event import Event
from app.database.models.registration import Registration
from app.database.models.execution import Submission, Attendance, Certificate, Notification, Feedback
from app.database.models.reputation import XPTransaction, ParticipantAchievement

db = SessionLocal()

participant_role = db.query(Role).filter(Role.name == "participant").first()
organizer_role = db.query(Role).filter(Role.name == "event_manager").first()

# 1. Fix demo.participant@example.com (Participant ONLY)
p_user = db.query(User).filter(User.email == "demo.participant@example.com").first()
if p_user:
    p_user.roles = [participant_role]
    db.commit()
    print("Fixed demo participant roles.")

# 2. Fix demo.organizer@example.com (Organizer ONLY)
o_user = db.query(User).filter(User.email == "demo.organizer@example.com").first()
if o_user:
    o_user.roles = [organizer_role]
    db.commit()
    print("Fixed demo organizer roles.")

# 3. Create demo.both@example.com (Both)
from app.auth.security import hash_password
b_user = db.query(User).filter(User.email == "demo.both@example.com").first()
if not b_user:
    b_user = User(
        name="Demo Both Roles",
        email="demo.both@example.com",
        password_hash=hash_password("password123"),
        department="Dual Role testing"
    )
    b_user.roles = [participant_role, organizer_role]
    db.add(b_user)
    db.commit()
    print("Created demo.both account.")
else:
    b_user.roles = [participant_role, organizer_role]
    db.commit()
    print("Fixed demo.both account.")

db.close()
