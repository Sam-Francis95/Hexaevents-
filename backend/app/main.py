from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.routes import router as auth_router
from app.auth.dev_routes import router as dev_router
from app.users.routes import router as users_router
from app.events.routes import router as events_router
from app.registrations.routes import router as registrations_router
from app.organizer.routes import router as organizer_router
# from app.submissions.routes import router as submissions_router
# from app.attendance.routes import router as attendance_router
# from app.certificates.routes import router as certificates_router
from app.notifications.routes import router as notifications_router
from app.reputation.routes import router as reputation_router
# from app.feedback.routes import router as feedback_router

app = FastAPI(title="HexaEvents API (PostgreSQL)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(dev_router, prefix="/api/dev", tags=["Development"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(events_router, prefix="/api/events", tags=["Events"])
app.include_router(registrations_router, prefix="/api/registrations", tags=["Registrations"])
app.include_router(organizer_router, prefix="/api/organizer", tags=["Organizer"])
# app.include_router(submissions_router, prefix="/api/submissions", tags=["Submissions"])
# app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
# app.include_router(certificates_router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(reputation_router, prefix="/api/reputation", tags=["Reputation"])
# app.include_router(feedback_router, prefix="/api/feedback", tags=["Feedback"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected error occurred.", "error": str(exc)},
    )
