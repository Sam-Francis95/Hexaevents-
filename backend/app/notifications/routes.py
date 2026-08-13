from flask import Blueprint, current_app
from bson import ObjectId
from bson.errors import InvalidId

from ..common.responses import ok, fail
from ..common.auth_guard import require_auth, current_user

notifications_bp = Blueprint("notifications", __name__)


def _serialize(n):
    n = dict(n)
    n["id"] = str(n.pop("_id"))
    n["userId"] = str(n["userId"])
    return n


@notifications_bp.get("")
@require_auth
def list_notifications():
    user = current_user()
    items = list(current_app.db.notifications.find({"userId": user["_id"]}).sort("createdAt", -1))
    return ok([_serialize(n) for n in items])


@notifications_bp.get("/unread-count")
@require_auth
def unread_count():
    user = current_user()
    count = current_app.db.notifications.count_documents({"userId": user["_id"], "isRead": False})
    return ok(count)


@notifications_bp.patch("/<notification_id>/read")
@require_auth
def mark_read(notification_id):
    user = current_user()
    try:
        oid = ObjectId(notification_id)
    except InvalidId:
        return fail("Notification not found.", "NOT_FOUND", status=404)

    result = current_app.db.notifications.update_one(
        {"_id": oid, "userId": user["_id"]}, {"$set": {"isRead": True}}
    )
    if result.matched_count == 0:
        return fail("Notification not found.", "NOT_FOUND", status=404)
    return ok(None)


@notifications_bp.patch("/mark-all-read")
@require_auth
def mark_all_read():
    user = current_user()
    current_app.db.notifications.update_many({"userId": user["_id"]}, {"$set": {"isRead": True}})
    return ok(None, "All notifications marked as read.")
