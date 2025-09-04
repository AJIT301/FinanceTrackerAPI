from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import List, Union
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # --- Server Configuration ---
    HOST: str = "192.168.0.10"
    PORT: int = 5000
    RELOAD: bool = True
    LOG_LEVEL: str = "info"

    # --- Security Configuration ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Database Configuration ---
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # --- CORS Configuration ---
    # Accept both string and list, convert to list in validator
    ALLOWED_ORIGINS: Union[str, List[str]] = os.getenv(
        "ALLOWED_ORIGINS", "http://192.168.0.10:5173"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v) -> List[str]:
        """Convert comma-separated string to list of strings."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            if not v.strip():  # Handle empty string
                return ["http://192.168.0.10:5173"]  # Default fallback
            # Handle both comma-separated and JSON array formats
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                # JSON array format
                import json

                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Comma-separated format
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return ["http://192.168.0.10:5173"]  # Default fallback

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def build_database_url(cls, v, values) -> str:
        """Build DATABASE_URL from individual components if not provided."""
        if v:
            return v

        # Build DATABASE_URL from individual environment variables
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME")

        if all([db_user, db_password, db_name]):
            return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

        raise ValueError(
            "Either DATABASE_URL or all individual DB_* environment variables must be set"
        )

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
