# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import List
import os

class Settings(BaseSettings):
    # --- Server Configuration ---
    HOST: str = "127.0.0.1"
    PORT: int = 5000
    RELOAD: bool = True
    LOG_LEVEL: str = "info"

    # --- Security Configuration ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Database Configuration ---
    DATABASE_URL: str

    # --- CORS Configuration ---
    # Use a string type here and convert to list in validator
    ALLOWED_ORIGINS: str

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Convert comma-separated string to list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

# --- Global Settings Instance ---
try:
    settings = Settings()  # type: ignore
except ValidationError as e:
    print("Error loading configuration from .env file:")
    for error in e.errors():
        print(f"  - Field: {error['loc'][0]}, Error: {error['msg']}")
    raise e
except Exception as e:
    print(f"An unexpected error occurred while loading settings: {e}")
    raise e