from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_flows():
    print("--- STARTING API VERIFICATION ---")

    # 1. Login as Participant
    res = client.post("/api/auth/login", json={"email": "demo.participant@example.com", "password": "password123"})
    assert res.status_code == 200
    data = res.json()["data"]
    p_token = data["token"]
    p_roles = data["user"]["roles"]
    p_user_id = data["user"]["id"]
    print(f"[OK] Participant Login: roles={p_roles}")
    assert "participant" in p_roles
    assert "event_manager" not in p_roles

    # 2. Login as Organizer
    res = client.post("/api/auth/login", json={"email": "demo.organizer@example.com", "password": "password123"})
    assert res.status_code == 200
    data = res.json()["data"]
    o_token = data["token"]
    o_roles = data["user"]["roles"]
    print(f"[OK] Organizer Login: roles={o_roles}")
    assert "event_manager" in o_roles
    assert "participant" not in o_roles

    # 3. Login as Multi-Role User
    res = client.post("/api/auth/login", json={"email": "eventmanager@test.com", "password": "password123"})
    assert res.status_code == 200
    data = res.json()["data"]
    m_token = data["token"]
    m_roles = data["user"]["roles"]
    print(f"[OK] Multi-Role User Login: roles={m_roles}")
    assert "event_manager" in m_roles and "participant" in m_roles

    # 4. Overlap Check: Participant accessing Organizer Route
    # /api/organizer/events is an organizer route
    res = client.get("/api/organizer/events", headers={"Authorization": f"Bearer {p_token}"})
    print(f"[OK] Participant accessing Organizer Route: status={res.status_code}")
    assert res.status_code in [401, 403], "Participant should not access organizer routes!"

    # 5. Overlap Check: Organizer accessing Participant Route
    # /api/events is typically a participant route. Let's see if it's restricted.
    # It might be open. If it's open, then status is 200.
    res = client.get("/api/events", headers={"Authorization": f"Bearer {o_token}"})
    print(f"[OK] Organizer accessing General/Participant Route: status={res.status_code}")

    # 6. Dev Roles Route Check
    # Add 'event_manager' to participant
    res = client.post(f"/api/dev/users/{p_user_id}/roles?action=add&role_name=event_manager")
    print(f"[OK] Dev Route Add Role: status={res.status_code}, roles={res.json().get('data', {}).get('roles')}")
    
    # Verify participant now has event_manager
    res = client.post("/api/auth/login", json={"email": "demo.participant@example.com", "password": "password123"})
    assert "event_manager" in res.json()["data"]["user"]["roles"]
    print("[OK] Participant successfully granted event_manager role.")

    print("--- API VERIFICATION SUCCESSFUL ---")

if __name__ == "__main__":
    test_flows()
