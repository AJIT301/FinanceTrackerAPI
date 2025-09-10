import os
from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import List, Union
from dotenv import load_dotenv

load_dotenv()
from app.core.debugger import debugger

class Settings(BaseSettings):
    # Server
    HOST: str = "192.168.0.10"
    PORT: int = 5000
    RELOAD: bool = True
    LOG_LEVEL: str = "info"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = os.getenv("ALLOWED_ORIGINS", "http://192.168.0.10:5173")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v) -> List[str]:
        fallback = ["http://192.168.0.10:5173"]
        debugger.validator_input("ALLOWED_ORIGINS", v, level=4)

        if isinstance(v, list):
            debugger.validator_result("ALLOWED_ORIGINS", v, "already list", level=3)
            return v

        if isinstance(v, str):
            v = v.strip()
            if not v:
                debugger.validator_result("ALLOWED_ORIGINS", fallback, "empty string fallback", level=2)
                return fallback

            if v.startswith("[") and v.endswith("]"):
                import json
                v_json = v.replace("'", '"')
                try:
                    result = json.loads(v_json)
                    debugger.json_parsing(v, v_json, True, result=result, level=4)
                    debugger.validator_result("ALLOWED_ORIGINS", result, "JSON parsing", level=3)
                    return result
                except json.JSONDecodeError as e:
                    debugger.json_parsing(v, v_json, False, error=e, level=2)
                    debugger.validator_result("ALLOWED_ORIGINS", fallback, "JSON fallback", level=2)
                    return fallback

            result = [x.strip() for x in v.split(",") if x.strip()]
            debugger.validator_result("ALLOWED_ORIGINS", result, "comma-separated parsing", level=3)
            return result

        debugger.validator_result("ALLOWED_ORIGINS", fallback, "default fallback", level=2)
        return fallback

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def build_database_url(cls, v, values) -> str:
        if v:
            debugger.print(f"DATABASE_URL provided directly: {v}", level=3, category="db")
            return v

        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME")

        debugger.print(f"Fetched DB components: user={db_user}, host={db_host}, port={db_port}, name={db_name}", level=4, category="db")

        if all([db_user, db_password, db_name]):
            url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            debugger.print(f"Database URL successfully built: {url}", level=3, category="db")
            return url

        missing = [k for k, v in {"DB_USER": db_user, "DB_PASSWORD": db_password, "DB_NAME": db_name}.items() if not v]
        debugger.print(f"Missing DB environment variables: {', '.join(missing)}", level=1, category="db")
        raise ValueError("Either DATABASE_URL or all individual DB_* environment variables must be set")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Global settings instance
try:
    settings = Settings()
    debugger.settings_loaded(settings, level=3)
except ValidationError as e:
    print("Error loading configuration:")
    for err in e.errors():
        print(f"  - Field: {err['loc'][0]}, Error: {err['msg']}")
    raise
except Exception as e:
    print(f"Unexpected error loading settings: {e}")
    raise
