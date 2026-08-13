"""
Covers the hackathon submission feature end to end against the real Flask
routes (via the test client) and a mongomock-backed db -- registration with
a team roster, team size validation, PDF-required submissions, submission
deadline enforcement, and confirmation that ordinary (non-Hackathon /
requiresSubmission=False) events are completely unaffected.
"""


def _register_for_event(client, headers, event_id, team_members=None):
    payload = {"eventId": event_id, "formResponses": {"experience": "1-3 years"}}
    if team_members is not None:
        payload["teamMembers"] = team_members
    return client.post("/api/registrations", json=payload, headers=headers)


# ---- Registration + team size validation ----

def test_non_hackathon_event_registration_unaffected(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=False)

    res = _register_for_event(client, headers, event_id)
    body = res.get_json()

    assert res.status_code == 200
    assert body["success"] is True
    assert body["data"]["teamMembers"] == []


def test_hackathon_registration_rejects_team_under_min(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=True, teamSizeLimit={"min": 2, "max": 4})

    res = _register_for_event(client, headers, event_id, team_members=[{"name": "Virat Kohli", "email": "virat@example.com"}])
    body = res.get_json()

    assert res.status_code == 400
    assert body["success"] is False
    assert body["error"]["code"] == "TEAM_SIZE_INVALID"


def test_hackathon_registration_rejects_team_over_max(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=True, teamSizeLimit={"min": 1, "max": 2})

    over_limit_team = [
        {"name": "Virat Kohli", "email": "virat@example.com"},
        {"name": "Kane Williamson", "email": "kane@example.com"},
        {"name": "Lionel Messi", "email": "messi@example.com"},
    ]
    res = _register_for_event(client, headers, event_id, team_members=over_limit_team)
    body = res.get_json()

    assert res.status_code == 400
    assert body["error"]["code"] == "TEAM_SIZE_INVALID"


def test_hackathon_registration_accepts_team_within_limit(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=True, teamSizeLimit={"min": 1, "max": 3})

    team = [
        {"name": "Kane Williamson", "email": "kane@example.com"},
        {"name": "Erling Haaland", "email": "erling@example.com"},
    ]
    res = _register_for_event(client, headers, event_id, team_members=team)
    body = res.get_json()

    assert res.status_code == 200
    assert len(body["data"]["teamMembers"]) == 2
    assert body["data"]["teamMembers"][0]["name"] == "Kane Williamson"


def test_hackathon_registration_rejects_incomplete_team_member(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=True, teamSizeLimit={"min": 1, "max": 3})

    res = _register_for_event(client, headers, event_id, team_members=[{"name": "Ben Stokes", "email": ""}])
    body = res.get_json()

    assert res.status_code == 400
    assert body["error"]["code"] == "VALIDATION_ERROR"


# ---- Submissions ----

def test_submission_requires_pdf(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    res = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "githubLink": "https://github.com/example/repo"},
        headers=headers,
        content_type="multipart/form-data",
    )
    body = res.get_json()

    assert res.status_code == 400
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_submission_accepted_before_deadline_with_optional_fields_omitted(client, register_user, make_event, fake_pdf):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    pdf_stream, pdf_name = fake_pdf()
    res = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "pdf": (pdf_stream, pdf_name)},
        headers=headers,
        content_type="multipart/form-data",
    )
    body = res.get_json()

    assert res.status_code == 200, body
    assert body["data"]["status"] == "submitted"
    assert body["data"]["githubLink"] is None
    assert body["data"]["driveVideoLink"] is None
    assert body["data"]["pdfUrl"] is not None


def test_submission_rejects_invalid_url(client, register_user, make_event, fake_pdf):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    pdf_stream, pdf_name = fake_pdf()
    res = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "githubLink": "not-a-url", "pdf": (pdf_stream, pdf_name)},
        headers=headers,
        content_type="multipart/form-data",
    )
    body = res.get_json()

    assert res.status_code == 400
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_submission_rejected_after_deadline(client, register_user, make_event, fake_pdf):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2000-01-01T00:00:00+00:00",  # long past
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    pdf_stream, pdf_name = fake_pdf()
    res = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "pdf": (pdf_stream, pdf_name)},
        headers=headers,
        content_type="multipart/form-data",
    )
    body = res.get_json()

    assert res.status_code == 403
    assert body["error"]["code"] == "SUBMISSION_CLOSED"


def test_submission_status_past_deadline_when_nothing_submitted(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2000-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    res = client.get(f"/api/submissions/registration/{reg_id}", headers=headers)
    body = res.get_json()

    assert res.status_code == 200
    assert body["data"]["status"] == "past_deadline"
    assert body["data"]["pdfUrl"] is None


def test_submission_status_not_submitted_before_deadline(client, register_user, make_event):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    res = client.get(f"/api/submissions/registration/{reg_id}", headers=headers)
    body = res.get_json()

    assert res.status_code == 200
    assert body["data"]["status"] == "not_submitted"


def test_non_hackathon_registration_rejects_submission_attempt(client, register_user, make_event, fake_pdf):
    headers, _ = register_user()
    event_id = make_event(requiresSubmission=False)
    reg_id = _register_for_event(client, headers, event_id).get_json()["data"]["id"]

    pdf_stream, pdf_name = fake_pdf()
    res = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "pdf": (pdf_stream, pdf_name)},
        headers=headers,
        content_type="multipart/form-data",
    )
    body = res.get_json()

    assert res.status_code == 400
    assert body["error"]["code"] == "NOT_APPLICABLE"


def test_resubmission_without_new_pdf_keeps_existing_file(client, register_user, make_event, fake_pdf):
    headers, _ = register_user()
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers, event_id, team_members=[]).get_json()["data"]["id"]

    pdf_stream, pdf_name = fake_pdf()
    first = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "pdf": (pdf_stream, pdf_name)},
        headers=headers,
        content_type="multipart/form-data",
    ).get_json()
    first_pdf_url = first["data"]["pdfUrl"]

    # Edit just the GitHub link, no new PDF attached.
    second = client.post(
        "/api/submissions",
        data={"registrationId": reg_id, "githubLink": "https://github.com/example/repo"},
        headers=headers,
        content_type="multipart/form-data",
    ).get_json()

    assert second["data"]["pdfUrl"] == first_pdf_url
    assert second["data"]["githubLink"] == "https://github.com/example/repo"
    assert second["data"]["status"] == "submitted"


def test_cannot_access_another_users_registration_submission(client, register_user, make_event, fake_pdf):
    headers_a, _ = register_user(name="Rohit Sharma")
    headers_b, _ = register_user(name="Jasprit Bumrah")
    event_id = make_event(
        requiresSubmission=True,
        teamSizeLimit={"min": 0, "max": 2},
        submissionDeadline="2099-01-01T00:00:00+00:00",
    )
    reg_id = _register_for_event(client, headers_a, event_id, team_members=[]).get_json()["data"]["id"]

    res = client.get(f"/api/submissions/registration/{reg_id}", headers=headers_b)
    body = res.get_json()

    assert res.status_code == 404
    assert body["error"]["code"] == "NOT_FOUND"
