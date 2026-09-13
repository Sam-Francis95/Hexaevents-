import sqlite3
import json

conn = sqlite3.connect('hexaevents.db')
cursor = conn.cursor()
cursor.execute("SELECT role FROM users WHERE email='demo.organizer@example.com'")
row = cursor.fetchone()
print('Role in DB:', row[0] if row else 'Not found')
conn.close()
