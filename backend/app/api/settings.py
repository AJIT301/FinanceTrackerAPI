# backend/app/api/settings.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsUpdate, UserSettingsOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=UserSettingsOut)
def get_settings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return (
        db.query(UserSettings)
        .filter(UserSettings.user_id == current_user.public_id)
        .first()
    )


@router.patch("/", response_model=UserSettingsOut)
def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.public_id).first()
    )
    if not settings:
        settings = UserSettings(user_id=current_user.public_id)
        db.add(settings)

    # Update only the provided fields
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
