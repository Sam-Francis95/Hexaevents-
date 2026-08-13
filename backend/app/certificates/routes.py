from flask import Blueprint, current_app

from ..common.responses import ok
from ..common.auth_guard import require_auth, current_user

certificates_bp = Blueprint("certificates", __name__)


def _serialize(c):
    c = dict(c)
    c["id"] = str(c.pop("_id"))
    c["userId"] = str(c["userId"])
    c["eventId"] = str(c["eventId"])
    return c


@certificates_bp.get("")
@require_auth
def list_certificates():
    user = current_user()
    items = list(current_app.db.certificates.find({"userId": user["_id"]}))
    return ok([_serialize(c) for c in items])
