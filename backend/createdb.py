# backend/create_tables.py
from app.core.database import engine, Base
from app.models.user import User
from app.models.transaction import Transaction

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()