# backend/app/core/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# Create PostgreSQL engine with fallback to settings
def get_database_url():
    # Try to get from environment variables first
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME")

    # If all environment variables are set, use them
    if all([db_user, db_password, db_name]):
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    # Fall back to settings.DATABASE_URL
    return settings.DATABASE_URL


DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Check connection before using
    echo=False,  # Set to False in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
import app.models

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
