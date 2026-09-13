from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.core import get_db
from app.database.models.user import User
from app.schemas.core import ok, fail
from app.schemas.auth import LoginRequest, RegisterRequest, GoogleLoginRequest
from app.schemas.user import UserResponse
from app.auth.security import hash_password, verify_password, issue_token
from app.auth.google_oauth import verify_google_token
from app.database.models.user import Role

router = APIRouter()

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if not body.name or not email or not body.password:
        return fail("Name, email, and password are all required.", "VALIDATION_ERROR", 400)
    if len(body.password) < 8:
        return fail("Password must be at least 8 characters.", "VALIDATION_ERROR", 400)

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return fail("An account with this email already exists.", "EMAIL_TAKEN", 409)

    user = User(
        name=body.name.strip(),
        email=email,
        password_hash=hash_password(body.password),
        department=body.department,
        college=body.college,
        employee_id=body.employeeId,
        phone=body.phone,
        batch=body.batch,
        auth_provider="local"
    )
    participant_role = db.query(Role).filter(Role.name == "participant").first()
    organizer_role = db.query(Role).filter(Role.name == "event_manager").first()
    
    account_type = body.accountType or "participant"
    
    if account_type == "participant" and participant_role:
        user.roles.append(participant_role)
    elif account_type == "organizer" and organizer_role:
        user.roles.append(organizer_role)
    elif account_type == "both":
        if participant_role: user.roles.append(participant_role)
        if organizer_role: user.roles.append(organizer_role)
        
    db.add(user)
    db.commit()
    db.refresh(user)

    token = issue_token(user.id, [r.name for r in user.roles], user.email)
    return ok({"token": token, "user": UserResponse.model_validate(user).model_dump(by_alias=True)}, "Account created.")

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user or user.auth_provider != "local":
        return fail("Invalid email or password.", "INVALID_CREDENTIALS", 401)
    if not verify_password(body.password, user.password_hash):
        return fail("Invalid email or password.", "INVALID_CREDENTIALS", 401)

    token = issue_token(user.id, [r.name for r in user.roles], user.email)
    return ok({"token": token, "user": UserResponse.model_validate(user).model_dump(by_alias=True)}, "Logged in successfully.")

@router.post("/google")
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not body.credential:
        return fail("Missing Google credential.", "VALIDATION_ERROR", 400)
    
    try:
        payload = verify_google_token(body.credential)
    except ValueError as e:
        return fail(str(e), "INVALID_GOOGLE_TOKEN", 401)

    email = payload["email"].lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            name=payload.get("name", email.split("@")[0]),
            email=email,
            password_hash=None,
            auth_provider="google",
            avatar_url=payload.get("picture", "")
        )
        participant_role = db.query(Role).filter(Role.name == "participant").first()
        if participant_role:
            user.roles.append(participant_role)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = issue_token(user.id, [r.name for r in user.roles], user.email)
    return ok({"token": token, "user": UserResponse.model_validate(user).model_dump(by_alias=True)}, "Logged in with Google.")
