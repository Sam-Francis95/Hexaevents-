from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.core import get_db
from app.database.models.user import User, Role
from app.schemas.core import ok, fail

router = APIRouter()

@router.post("/users/{user_id}/roles")
def manage_user_roles(user_id: str, action: str, role_name: str, db: Session = Depends(get_db)):
    """
    Development-only endpoint to add or remove roles from a user.
    action: 'add' or 'remove'
    role_name: 'participant' or 'event_manager'
    """
    # Restrict available roles to prevent abuse
    if role_name not in ["participant", "event_manager"]:
        return fail("Invalid role name.", "INVALID_ROLE", 400)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return fail("User not found.", "NOT_FOUND", 404)
        
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        # Create role if it doesn't exist just in case
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)

    user_role_names = [r.name for r in user.roles]

    if action == "add":
        if role_name in user_role_names:
            return fail("User already has this role.", "CONFLICT", 409)
        user.roles.append(role)
        db.commit()
        return ok({"user_id": user.id, "roles": [r.name for r in user.roles]}, f"Role '{role_name}' added successfully.")
        
    elif action == "remove":
        if role_name not in user_role_names:
            return fail("User does not have this role.", "NOT_FOUND", 404)
        if role_name == "participant" and len(user.roles) == 1:
            return fail("Cannot remove the last role.", "CONFLICT", 409)
            
        user.roles.remove(role)
        db.commit()
        return ok({"user_id": user.id, "roles": [r.name for r in user.roles]}, f"Role '{role_name}' removed successfully.")
    
    else:
        return fail("Invalid action. Use 'add' or 'remove'.", "INVALID_ACTION", 400)
