"""
SMTP wrapper. Works interchangeably with Gmail SMTP, SendGrid, or a real
corporate SMTP relay — whatever's in the env vars. If SMTP_HOST isn't set
(the default in dev), this logs the email instead of failing, so the rest
of the app runs cleanly before real credentials exist.
"""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from flask import current_app

logger = logging.getLogger("smartevent.mailer")
TEMPLATES_DIR = Path(__file__).parent / "templates"


def _render_template(template_name, context):
    path = TEMPLATES_DIR / template_name
    html = path.read_text(encoding="utf-8")
    for key, value in (context or {}).items():
        html = html.replace("{{ " + key + " }}", str(value))
    return html


def send_email(to, subject, template, context=None):
    html = _render_template(template, context)

    if not current_app.config.get("EMAIL_ENABLED"):
        logger.info(
            "[mailer:disabled] Would send to=%s subject=%r — SMTP not configured, logging instead of sending.",
            to, subject,
        )
        return {"sent": False, "reason": "SMTP not configured"}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = current_app.config["SMTP_FROM_EMAIL"]
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(current_app.config["SMTP_HOST"], current_app.config["SMTP_PORT"]) as server:
            server.starttls()
            server.login(current_app.config["SMTP_USER"], current_app.config["SMTP_PASSWORD"])
            server.sendmail(current_app.config["SMTP_FROM_EMAIL"], [to], msg.as_string())
        return {"sent": True}
    except Exception as e:
        logger.exception("Failed to send email to %s: %s", to, e)
        return {"sent": False, "reason": str(e)}
