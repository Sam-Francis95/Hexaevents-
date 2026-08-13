"""
File storage abstraction for participant submissions (hackathon PDFs).

No Azure Blob Storage / S3 credentials exist yet (pending from IT), so this
saves to local disk under UPLOAD_FOLDER — same graceful-degradation pattern
already used for SMTP (mailer.py) and the LLM provider (chatbot/llm_client.py):
fully functional today, and swapping to real cloud storage later means
rewriting the inside of save_file() only. No route or frontend changes
needed either way.
"""
import os
import uuid

from flask import current_app
from werkzeug.utils import secure_filename


def save_file(file_storage, subfolder=""):
    """
    Saves an uploaded werkzeug FileStorage to disk under
    UPLOAD_FOLDER/<subfolder>/ using a randomly generated filename (never
    trust the client-supplied filename for the path — avoids collisions and
    directory traversal).

    Returns the path *relative to UPLOAD_FOLDER*, forward-slash separated.
    This relative path is what gets stored on the Mongo document; the public
    URL is built at serialization time as f"{request.host_url}uploads/{relative_path}"
    so it's correct regardless of which host/port is actually serving the app.
    """
    upload_root = current_app.config["UPLOAD_FOLDER"]
    target_dir = os.path.join(upload_root, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    original_name = secure_filename(file_storage.filename or "submission.pdf")
    ext = os.path.splitext(original_name)[1].lower() or ".pdf"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    file_storage.save(os.path.join(target_dir, unique_name))

    relative_path = f"{subfolder}/{unique_name}" if subfolder else unique_name
    return relative_path.replace(os.sep, "/")


def delete_file(relative_path):
    """Best-effort delete, used when a submission's PDF is replaced. Never
    raises -- a leftover orphaned file on disk is a cheap problem, a crash
    on re-submission is not."""
    if not relative_path:
        return
    upload_root = current_app.config["UPLOAD_FOLDER"]
    full_path = os.path.join(upload_root, relative_path)
    try:
        if os.path.isfile(full_path):
            os.remove(full_path)
    except OSError:
        current_app.logger.warning(f"Could not delete old submission file: {full_path}")
