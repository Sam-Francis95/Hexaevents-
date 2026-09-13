from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.event import EventResponse

class RegistrationChangeHistoryResponse(BaseModel):
    id: str
    field_name: str = Field(alias="fieldName")
    old_value: Optional[str] = Field(alias="oldValue")
    new_value: Optional[str] = Field(alias="newValue")
    changed_at: datetime = Field(alias="changedAt")

    class Config:
        from_attributes = True
        populate_by_name = True

class RegistrationResponse(BaseModel):
    id: str
    event_id: str = Field(alias="eventId")
    participant_id: str = Field(alias="userId")
    form_responses: Dict[str, Any] = Field(alias="formResponses", default_factory=dict)
    team_members: List[Dict[str, Any]] = Field(alias="teamMembers", default_factory=list)
    status: str
    attended: bool = False
    registered_at: datetime = Field(alias="registeredAt")
    updated_at: datetime = Field(alias="updatedAt")
    participant_snapshot: Optional[Dict[str, Any]] = Field(alias="participantSnapshot", default_factory=dict)
    change_history: Optional[List[RegistrationChangeHistoryResponse]] = Field(alias="changeHistory", default_factory=list)
    event: Optional[EventResponse] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class RegistrationCreateRequest(BaseModel):
    eventId: str
    formResponses: Optional[Dict[str, Any]] = Field(default_factory=dict)
    teamMembers: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
