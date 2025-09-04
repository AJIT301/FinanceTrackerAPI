# backend/check_tables.py
from sqlalchemy import inspect, create_engine
from app.core.config import settings

# Create engine
engine = create_engine(settings.DATABASE_URL)

# Inspect the database
inspector = inspect(engine)
tables = inspector.get_table_names()

print("Tables in database:")
for table in tables:
    print(f"  - {table}")

# Also show which database we're connected to
with engine.connect() as conn:
    result = conn.execute("SELECT current_database(), current_schema()")
    db_name, schema_name = result.fetchone()
    print(f"\nConnected to database: {db_name}")
    print(f"Current schema: {schema_name}")
