from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class EventBase(BaseModel):
    title: str
    description: str
    category: str
    mode: str
    venue: Optional[str] = ""
    start_date: datetime = Field(alias="startDate")
    end_date: datetime = Field(alias="endDate")
    registration_deadline: Optional[datetime] = Field(alias="registrationDeadline", default=None)
    capacity: int = 0
    eligibility_rules: List[Dict[str, Any]] = Field(alias="eligibilityRules", default_factory=list)
    agenda: List[Dict[str, Any]] = Field(default_factory=list)
    status: str = "draft"
    requires_submission: bool = Field(alias="requiresSubmission", default=False)
    team_size_limit: Optional[Dict[str, int]] = Field(alias="teamSizeLimit", default=None)
    submission_deadline: Optional[datetime] = Field(alias="submissionDeadline", default=None)
    banner_color: str = Field(alias="bannerColor", default="#5B5FEE")

class EventResponse(EventBase):
    id: str
    organizer_id: str = Field(alias="organizerId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    registered_count: int = Field(alias="registeredCount", default=0)

    class Config:
        from_attributes = True
        populate_by_name = True
