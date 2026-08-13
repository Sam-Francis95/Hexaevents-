"""
Seeds MongoDB with fully synthetic dummy data — random names, emails,
departments, colleges, events. NEVER put real Hexaware employee data in
here (per the 13 Jul MoM). Swap this for the real data feed once mam
provides it, following the agreed process (mock data first, real data
later, feature by feature).

Usage:
    python scripts/seed_dummy_data.py
"""
import os
import sys
from datetime import datetime, timedelta, timezone
from random import choice, randint, sample

from faker import Faker
from pymongo import MongoClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.auth.security import hash_password  # noqa: E402

fake = Faker()

DEPARTMENTS = ["Product Engineering", "Automation", "Analytics", "Digital", "Innovation"]
BATCHES = ["2025", "2026"]
CATEGORIES = ["Workshop", "Town Hall", "Training", "Orientation", "Compliance"]
MODES = ["online", "offline", "hybrid"]
BANNER_COLORS = ["#5B5FEE", "#2E7DD1", "#1FA971", "#D89614"]
SKILLS_POOL = ["React", "Python", "SQL", "Figma", "Public Speaking", "Cloud", "Data Viz"]


def build_eligibility_rules():
    # Roughly a third of events carry a restriction — the rest are open to everyone.
    if choice([True, False, False]):
        return [choice([
            {"ruleType": "department", "ruleValue": choice(DEPARTMENTS)},
            {"ruleType": "batch", "ruleValue": choice(BATCHES)},
        ])]
    return []


def build_users(n=25):
    users = []
    for _ in range(n):
        users.append({
            "name": fake.name(),
            "email": fake.unique.email(),
            "passwordHash": hash_password("password123"),
            "role": "participant",
            "authProvider": "local",
            "avatarUrl": "",
            "department": choice(DEPARTMENTS),
            "college": fake.company() + " College",
            "employeeId": f"EMP-{randint(1000, 9999)}",
            "phone": fake.phone_number(),
            "batch": choice(BATCHES),
            "skills": sample(SKILLS_POOL, k=2),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })
    # One predictable demo login, on top of the random set, for convenience.
    users[0]["email"] = "demo.participant@example.com"
    users[0]["passwordHash"] = hash_password("password123")
    users[0]["department"] = "Product Engineering"
    users[0]["batch"] = "2026"
    return users


def build_events(n=8):
    events = []
    now = datetime.now(timezone.utc)
    for _ in range(n):
        start = now + timedelta(days=randint(-10, 30))
        events.append({
            "title": fake.catch_phrase(),
            "description": fake.paragraph(nb_sentences=4),
            "category": choice(CATEGORIES),
            "mode": choice(MODES),
            "venue": (fake.city() + " Campus") if choice([True, False]) else "Microsoft Teams",
            "startDate": start.isoformat(),
            "endDate": (start + timedelta(hours=3)).isoformat(),
            "registrationDeadline": (start - timedelta(days=2)).isoformat(),
            "capacity": randint(20, 200),
            "eligibilityRules": build_eligibility_rules(),
            "agenda": [
                {"time": "10:00", "title": "Kickoff"},
                {"time": "11:00", "title": "Main session"},
            ],
            "status": "published",
            "organizerId": "seed-organizer",  # Organizer module owns real organizer accounts
            "requiresSubmission": False,
            "teamSizeLimit": None,
            "submissionDeadline": None,
            "bannerColor": choice(BANNER_COLORS),
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
        })
    return events


def build_hackathon_events():
    """
    Two hand-authored Hackathon events (not part of the random pool above)
    so the submission feature has deliberate, realistic data to demo against
    rather than leaving it to chance whether a random event lands on the
    Hackathon category. requiresSubmission is the real gate -- category is
    just the display label.

    One is upcoming (submission window still open) and one already closed
    (submission deadline in the past) so both states -- open and
    past_deadline -- are visible in a fresh seed without waiting for time to
    pass.
    """
    now = datetime.now(timezone.utc)

    upcoming_start = now + timedelta(days=14)
    upcoming_end = upcoming_start + timedelta(days=2)

    closed_start = now - timedelta(days=20)
    closed_end = closed_start + timedelta(days=2)

    return [
        {
            "title": "CodeSprint 48 — Internal Hackathon",
            "description": (
                "A 48-hour team hackathon for original internal tooling ideas. "
                "Teams submit a GitHub repo, an optional demo video, and a "
                "required PDF writeup before the submission deadline."
            ),
            "category": "Hackathon",
            "mode": "offline",
            "venue": "Innovation Hub, Siruseri Campus, Block C",
            "startDate": upcoming_start.isoformat(),
            "endDate": upcoming_end.isoformat(),
            "registrationDeadline": (upcoming_start - timedelta(days=4)).isoformat(),
            "capacity": 60,
            "eligibilityRules": [],
            "agenda": [
                {"time": "Day 1, 09:00", "title": "Kickoff & team check-in"},
                {"time": "Day 1, 10:00", "title": "Hacking begins"},
                {"time": "Day 2, 09:00", "title": "Submissions close"},
                {"time": "Day 2, 11:00", "title": "Demos & judging"},
            ],
            "status": "published",
            "organizerId": "seed-organizer",
            "requiresSubmission": True,
            "teamSizeLimit": {"min": 1, "max": 3},
            "submissionDeadline": upcoming_end.isoformat(),
            "bannerColor": "#8B5CF6",
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
        },
        {
            "title": "AI Builders Challenge",
            "description": (
                "A closed hackathon kept in the seed data specifically to "
                "demo the 'past deadline' state -- submissions are no longer "
                "accepted for this one."
            ),
            "category": "Hackathon",
            "mode": "hybrid",
            "venue": "Microsoft Teams",
            "startDate": closed_start.isoformat(),
            "endDate": closed_end.isoformat(),
            "registrationDeadline": (closed_start - timedelta(days=4)).isoformat(),
            "capacity": 40,
            "eligibilityRules": [],
            "agenda": [
                {"time": "Day 1, 09:00", "title": "Kickoff & team check-in"},
                {"time": "Day 2, 09:00", "title": "Submissions close"},
            ],
            "status": "closed",
            "organizerId": "seed-organizer",
            "requiresSubmission": True,
            "teamSizeLimit": {"min": 1, "max": 4},
            "submissionDeadline": closed_end.isoformat(),
            "bannerColor": "#8B5CF6",
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
        },
    ]


def run():
    uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/smartevent")
    client = MongoClient(uri)
    db = client.get_default_database()

    for name in ["users", "events", "registrations", "notifications", "certificates", "feedback"]:
        db[name].delete_many({})

    users = build_users()
    db.users.insert_many(users)
    print(f"Seeded {len(users)} users (dummy data only).")
    print("Demo login -> email: demo.participant@example.com / password: password123")

    events = build_events() + build_hackathon_events()
    db.events.insert_many(events)
    hackathon_count = sum(1 for e in events if e.get("requiresSubmission"))
    print(f"Seeded {len(events)} events ({sum(1 for e in events if e['eligibilityRules'])} with eligibility restrictions, {hackathon_count} Hackathon/requiresSubmission).")

    client.close()


if __name__ == "__main__":
    run()
