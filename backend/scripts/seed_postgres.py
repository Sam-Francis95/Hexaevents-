import sys
import os
import random
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv(override=True)

from sqlalchemy.orm import Session
from app.database.core import engine, Base
from app.database.models.user import User, Role
from app.database.models.event import Event
from app.database.models.registration import Registration
from app.database.models.execution import Submission, Attendance, Certificate, Notification, Feedback
from app.database.models.reputation import XPTransaction, ParticipantAchievement
from app.auth.security import hash_password

def seed_db():
    print("Connecting to DB...")
    
    with Session(engine) as db:
        print("Creating roles...")
        role_participant = db.query(Role).filter(Role.name == "participant").first()
        if not role_participant:
            role_participant = Role(name="participant")
            db.add(role_participant)
        
        role_organizer = db.query(Role).filter(Role.name == "event_manager").first()
        if not role_organizer:
            role_organizer = Role(name="event_manager")
            db.add(role_organizer)
            
        db.commit()

        print("Creating demo users...")
        organizer = db.query(User).filter(User.email == "demo.organizer@example.com").first()
        if not organizer:
            organizer = User(
                name="Demo Organizer",
                email="demo.organizer@example.com",
                password_hash=hash_password("password123"),
                department="Computer Science",
                college="Engineering College"
            )
            organizer.roles.append(role_organizer)
            db.add(organizer)
            
        participant = db.query(User).filter(User.email == "demo.participant@example.com").first()
        if not participant:
            participant = User(
                name="Demo Participant",
                email="demo.participant@example.com",
                password_hash=hash_password("password123"),
                department="Information Technology",
                college="Engineering College",
                batch="2025"
            )
            participant.roles.append(role_participant)
            db.add(participant)
            
        # Specific user with BOTH roles for testing
        eventmanager = db.query(User).filter(User.email == "eventmanager@test.com").first()
        if not eventmanager:
            eventmanager = User(
                name="Test Event Manager",
                email="eventmanager@test.com",
                password_hash=hash_password("password123"),
                department="Management",
                college="Engineering College",
                batch="2025"
            )
            eventmanager.roles.append(role_participant)
            eventmanager.roles.append(role_organizer)
            db.add(eventmanager)
            
        db.commit()

        print("Creating demo events...")
        now = datetime.now(timezone.utc)
        
        event1 = db.query(Event).filter(Event.title == "Global Hackathon 2026").first()
        if not event1:
            event1 = Event(
                title="Global Hackathon 2026",
                description="A 48-hour hackathon to build the future.",
                category="Hackathon",
                mode="In-person",
                venue="Main Auditorium",
                start_date=now + timedelta(days=5),
                end_date=now + timedelta(days=7),
                registration_deadline=now + timedelta(days=4),
                capacity=100,
                status="published",
                organizer_id=organizer.id,
                requires_submission=True,
                team_size_limit={"min": 1, "max": 4},
                submission_deadline=now + timedelta(days=7)
            )
            db.add(event1)
            
        event2 = db.query(Event).filter(Event.title == "Tech Talk: AI").first()
        if not event2:
            event2 = Event(
                title="Tech Talk: AI",
                description="A talk on the future of AI.",
                category="Workshop",
                mode="Online",
                venue="Zoom",
                start_date=now + timedelta(days=2),
                end_date=now + timedelta(days=2, hours=2),
                capacity=500,
                status="published",
                organizer_id=organizer.id
            )
            db.add(event2)
            
        db.commit()
        
        print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
