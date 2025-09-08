# backend/app/models/user_settings.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        String(36), ForeignKey("users.public_id"), primary_key=True
    )  # ← CHANGED TO String(36)

    theme = Column(String(20), default="light")
    notifications_enabled = Column(Boolean, default=True)
    extras = Column(JSON, default=dict)

    user = relationship("User", back_populates="settings")
