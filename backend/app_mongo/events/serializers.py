"""
Shared event serialization so registeredCount is computed the same way
everywhere an event gets sent to the frontend -- events list/detail AND
events embedded inside registrations. Without this, the two call sites
would drift (exactly what happened before this file existed: the events
routes had no registeredCount at all, and the frontend's seat-count
formatter rendered "NaN seats open").
"""


def serialize_event(db, event):
    event = dict(event)
    event_id = event["_id"]
    event["id"] = str(event.pop("_id"))
    event["registeredCount"] = db.registrations.count_documents({
        "eventId": event_id,
        "status": {"$ne": "rejected"},
    })
    return event
