from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import List, Union
import os
#dotnenv must be loaded before importing debugger. Nepamirstam.
from dotenv import load_dotenv
load_dotenv()

from app.core.debugger import debugger

# Load environment variables from .env file



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
        """Convert comma-separated string or JSON-style array into list of strings."""
        debugger.validator_input("ALLOWED_ORIGINS", v)

        if isinstance(v, list):
            debugger.validator_result("ALLOWED_ORIGINS", v, "already list")
            return v

        if isinstance(v, str):
            v = v.strip()

            if not v:  # Handle empty string
                fallback = ["http://192.168.0.10:5173"]
                debugger.validator_result(
                    "ALLOWED_ORIGINS", fallback, "empty string fallback"
                )
                return fallback

            # Handle JSON array format
            if v.startswith("[") and v.endswith("]"):
                import json

                v_json = v.replace("'", '"')  # always defined before try
                try:
                    result = json.loads(v_json)
                    debugger.json_parsing(v, v_json, True)
                    debugger.validator_result("ALLOWED_ORIGINS", result, "JSON parsing")
                    return result
                except json.JSONDecodeError as e:
                    debugger.json_parsing(v, v_json, False, error=e)

            # Handle comma-separated string
            result = [origin.strip() for origin in v.split(",") if origin.strip()]
            debugger.validator_result(
                "ALLOWED_ORIGINS", result, "comma-separated parsing"
            )
            return result

        fallback = ["http://192.168.0.10:5173"]
        debugger.validator_result("ALLOWED_ORIGINS", fallback, "default fallback")
        return fallback

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
    debugger.settings_loaded(settings)
except ValidationError as e:
    print("Error loading configuration from .env file:")
    for error in e.errors():
        print(f"  - Field: {error['loc'][0]}, Error: {error['msg']}")
    raise e
except Exception as e:
    print(f"An unexpected error occurred while loading settings: {e}")
    raise e
