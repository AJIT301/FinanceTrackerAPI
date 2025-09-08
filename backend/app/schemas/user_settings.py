# backend/app/schemas/user_settings.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class UserSettingsBase(BaseModel):
    theme: str = "light"
    extras: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsOut(UserSettingsBase):
    # NO user_id exposed! The user already knows who they are via authentication
    # Only include the actual settings fields that user can modify/see
    class Config:
        from_attributes = True  # For Pydantic v2