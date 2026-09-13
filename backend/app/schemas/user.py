from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    name: str
    email: str
    department: Optional[str] = ""
    college: Optional[str] = ""
    employee_id: Optional[str] = ""
    phone: Optional[str] = ""
    batch: Optional[str] = ""

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    department: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    college: Optional[str] = None
    batch: Optional[str] = None

from pydantic import field_validator

class UserResponse(UserBase):
    id: str
    roles: List[str]
    auth_provider: str

    @field_validator('roles', mode='before')
    @classmethod
    def extract_role_names(cls, v):
        if not v:
            return []
        if isinstance(v[0], str):
            return v
        return [r.name for r in v]
    avatar_url: str
    skills: List[str]
    total_xp: int = Field(alias="totalXP", default=0)
    current_level: int = Field(alias="currentLevel", default=1)
    level_name: str = Field(alias="levelName", default="Novice")
    level_badge: str = Field(alias="levelBadge", default="🥉")
    created_at: datetime = Field(alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True
