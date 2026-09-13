"""
Hackathon submissions -- read/write for the participant's OWN submission
only. Coordinator review is a separate module's screen (out of scope here).

Applies only to events where `requiresSubmission` is True. Deliberately a
boolean field on the event, not a string-match on `category` -- category is
cosmetic/display, requiresSubmission is the actual gate, same philosophy as
eligibilityRules being evaluated server-side rather than trusting the UI.
"""
from datetime import datetime, timezone

from flask import Blueprint, request, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user
from ..storage import save_file, delete_file

submissions_bp = Blueprint("submissions", __name__)

_ALLOWED_PDF_MIMETYPES = {"application/pdf"}


def _parse_iso(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _deadline_passed(event):
    deadline = _parse_iso(event.get("submissionDeadline"))
    return bool(deadline) and deadline < datetime.now(timezone.utc)


def _compute_status(submission_doc, event):
    if submission_doc and submission_doc.get("submittedAt"):
        return "submitted"
    return "past_deadline" if _deadline_passed(event) else "not_submitted"


def _serialize(submission_doc, registration, event):
    """submission_doc may be None (no submission exists yet) -- always
    returns a consistent shape so the frontend never has to special-case
    'nothing submitted yet' vs 'submitted'."""
    pdf_path = submission_doc.get("pdfPath") if submission_doc else None
    return {
        "id": str(submission_doc["_id"]) if submission_doc else None,
        "registrationId": str(registration["_id"]),
        "eventId": str(event["_id"]),
        "userId": str(registration["userId"]),
        "githubLink": submission_doc.get("githubLink") if submission_doc else None,
        "driveVideoLink": submission_doc.get("driveVideoLink") if submission_doc else None,
        "pdfUrl": f"{request.host_url}uploads/{pdf_path}" if pdf_path else None,
        "submittedAt": submission_doc.get("submittedAt") if submission_doc else None,
        "submissionDeadline": event.get("submissionDeadline"),
        "status": _compute_status(submission_doc, event),
    }


def _get_owned_registration_and_event(registration_id, user):
    try:
        reg_oid = ObjectId(registration_id)
    except InvalidId:
        return None, None
    reg = current_app.db.registrations.find_one({"_id": reg_oid, "userId": user["_id"]})
    if not reg:
        return None, None
    event = current_app.db.events.find_one({"_id": reg["eventId"]})
    return reg, event


def _validate_link(value, label):
    """Optional fields -- only validated when non-empty. Server-side, same
    'the UI check is a courtesy' principle as eligibility and deadlines."""
    if not value:
        return None
    if not (value.startswith("http://") or value.startswith("https://")):
        return f"{label} must be a valid URL starting with http:// or https://."
    return None


@submissions_bp.get("/registration/<registration_id>")
@require_auth
def get_submission_for_registration(registration_id):
    user = current_user()
    reg, event = _get_owned_registration_and_event(registration_id, user)
    if not reg or not event:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    submission = current_app.db.submissions.find_one({"registrationId": reg["_id"]})
    return ok(_serialize(submission, reg, event))


@submissions_bp.post("")
@require_auth
def create_or_update_submission():
    """multipart/form-data: registrationId, githubLink?, driveVideoLink?, pdf
    (file). Create-or-update -- resubmitting before the deadline overwrites
    the previous submission. PDF is required on the FIRST submission; on a
    later edit it can be omitted to keep the file already on record (so
    fixing a typo in the GitHub link doesn't force a re-upload)."""
    user = current_user()
    registration_id = request.form.get("registrationId")
    reg, event = _get_owned_registration_and_event(registration_id, user)
    if not reg or not event:
        return fail("Registration not found.", "NOT_FOUND", status=404)

    if not event.get("requiresSubmission"):
        return fail("This event does not accept submissions.", "NOT_APPLICABLE", status=400)

    if _deadline_passed(event):
        return fail("The submission deadline has passed.", "SUBMISSION_CLOSED", status=403)

    github_link = (request.form.get("githubLink") or "").strip() or None
    drive_video_link = (request.form.get("driveVideoLink") or "").strip() or None

    link_error = _validate_link(github_link, "GitHub link") or _validate_link(drive_video_link, "Drive video link")
    if link_error:
        return fail(link_error, "VALIDATION_ERROR", status=400)

    existing = current_app.db.submissions.find_one({"registrationId": reg["_id"]})
    pdf_file = request.files.get("pdf")

    if not pdf_file and not (existing and existing.get("pdfPath")):
        return fail("A PDF submission is required.", "VALIDATION_ERROR", status=400)

    pdf_path = existing["pdfPath"] if existing else None
    if pdf_file and pdf_file.filename:
        is_pdf = pdf_file.mimetype in _ALLOWED_PDF_MIMETYPES or pdf_file.filename.lower().endswith(".pdf")
        if not is_pdf:
            return fail("Only PDF files are accepted.", "VALIDATION_ERROR", status=400)
        new_path = save_file(pdf_file, subfolder=f"submissions/{reg['_id']}")
        if existing and existing.get("pdfPath"):
            delete_file(existing["pdfPath"])
        pdf_path = new_path

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "registrationId": reg["_id"],
        "eventId": event["_id"],
        "userId": user["_id"],
        "githubLink": github_link,
        "driveVideoLink": drive_video_link,
        "pdfPath": pdf_path,
        "submittedAt": now,
        "updatedAt": now,
    }

    if existing:
        current_app.db.submissions.update_one({"_id": existing["_id"]}, {"$set": doc})
        doc["_id"] = existing["_id"]
        doc["createdAt"] = existing.get("createdAt", now)
    else:
        doc["createdAt"] = now
        result = current_app.db.submissions.insert_one(doc)
        doc["_id"] = result.inserted_id

    return ok(_serialize(doc, reg, event), "Submission saved.")
