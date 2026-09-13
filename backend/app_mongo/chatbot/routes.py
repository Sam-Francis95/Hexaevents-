from flask import Blueprint, request, current_app

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth
from . import llm_client

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.post("/message")
@require_auth
def send_message():
    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()
    if not message:
        return fail("Message is required.", "VALIDATION_ERROR", status=400)

    reply = llm_client.ask(message, context=body.get("context"))
    return ok({"reply": reply, "provider": current_app.config.get("LLM_PROVIDER", "none")})
