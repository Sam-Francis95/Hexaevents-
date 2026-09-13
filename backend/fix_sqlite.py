import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'hexaevents.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get participant
c.execute("SELECT id FROM users WHERE email = 'demo.participant@example.com'")
p_row = c.fetchone()
if p_row:
    p_id = p_row[0]
    # Get organizer role id
    c.execute("SELECT id FROM roles WHERE name = 'event_manager'")
    r_row = c.fetchone()
    if r_row:
        r_id = r_row[0]
        # Delete organizer role from participant
        c.execute("DELETE FROM user_roles WHERE user_id = ? AND role_id = ?", (p_id, r_id))
        conn.commit()
        print("Removed organizer role from demo.participant@example.com")

# Create a demo.both@example.com user if one doesn't exist
# We will just print instructions to the user instead of doing raw SQL inserts for a full user.

conn.close()
