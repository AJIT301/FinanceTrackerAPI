# backend/app/core/init_db.py
import os
import logging
from dotenv import load_dotenv

# Force load .env
env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path=env_path)

from app.core.database import engine, Base
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    logger.info("DROPPING AND RECREATING ALL TABLES...")

    # DROP ALL TABLES FIRST (WARNING: DELETES EXISTING DATA)
    Base.metadata.drop_all(bind=engine)
    logger.info("All existing tables dropped")

    # CREATE ALL TABLES
    Base.metadata.create_all(bind=engine)

    # VERIFY what was created
    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    logger.info("TABLES ACTUALLY CREATED:")
    for table in tables:
        logger.info(f"  - {table}")

    if not tables:
        logger.error("NO TABLES WERE CREATED!")
    else:
        logger.info(f"Successfully created {len(tables)} tables")


if __name__ == "__main__":
    init_db()
