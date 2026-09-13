from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: Optional[str] = ""
    college: Optional[str] = ""
    employeeId: Optional[str] = ""
    phone: Optional[str] = ""
    batch: Optional[str] = ""
    accountType: Optional[str] = "participant"
