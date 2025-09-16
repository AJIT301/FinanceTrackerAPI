# app/models/user_settings.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.public_id"), primary_key=True)
    theme = Column(String(20), default="light")
    currency_code = Column(String(3), default="USD")  # ← SIMPLE VERSION
    extras = Column(JSON, default=dict)

    user = relationship("User", back_populates="settings")