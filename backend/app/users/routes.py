from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.core import get_db
from app.database.models.user import User
from app.database.models.registration import Registration, RegistrationChangeHistory
from app.auth.dependencies import get_current_user
from app.schemas.core import ok, fail
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return ok(UserResponse.model_validate(current_user).model_dump(by_alias=True))

@router.patch("/me")
def update_me(body: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        return ok(UserResponse.model_validate(current_user).model_dump(by_alias=True), "No changes made")
        
    # Get active registrations for this user to track history
    active_regs = db.query(Registration).filter(
        Registration.participant_id == current_user.id
    ).all()

    for field, new_value in update_data.items():
        old_value = getattr(current_user, field, None)
        
        # Compare logic (handling lists and strings)
        changed = False
        if isinstance(old_value, list) and isinstance(new_value, list):
            if set(old_value) != set(new_value):
                changed = True
        elif old_value != new_value:
            changed = True
            
        if changed:
            # Update user profile
            setattr(current_user, field, new_value)
            
            # Record change history for each active registration
            for reg in active_regs:
                history_entry = RegistrationChangeHistory(
                    registration_id=reg.id,
                    field_name=field,
                    old_value=str(old_value) if old_value is not None else "",
                    new_value=str(new_value) if new_value is not None else "",
                    changed_by=current_user.id
                )
                db.add(history_entry)

    db.commit()
    db.refresh(current_user)
    
    return ok(UserResponse.model_validate(current_user).model_dump(by_alias=True), "Profile updated")
