import os
import sys
import mongomock

from app import create_app

# 1. Create a mocked in-memory MongoDB client
client = mongomock.MongoClient("mongodb://localhost/smartevent")

# 2. Seed the mocked database
from scripts.seed_dummy_data import build_users, build_events, build_hackathon_events, seed_reputation_for_demo

db = client.get_database("smartevent")
users = build_users()
db.users.insert_many(users)
events = build_events() + build_hackathon_events()
db.events.insert_many(events)
seed_reputation_for_demo(db)

print("[OK] In-memory mock database seeded successfully (including reputation)!")
print("Demo login -> email: demo.participant@example.com / password: password123")
print("-" * 50)

# 3. Start the app using the mocked client instead of a real one
app = create_app(mongo_client_override=client)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
