# backend/scripts/populate_public_ids.py
import uuid
import sys
import os
from sqlalchemy import create_engine, text

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings


def populate_public_ids():
    # Create engine directly to avoid ORM issues
    engine = create_engine(settings.DATABASE_URL)

    with engine.begin() as connection:  # Use begin() for automatic transaction handling
        # Check if there are users without public_id
        result = connection.execute(
            text("SELECT COUNT(*) FROM users WHERE public_id IS NULL")
        )
        count = result.scalar_one()  # Use scalar_one() instead of scalar()
        print(f"Found {count} users without public_id")

        if count > 0:
            # Get all user IDs that need updating
            user_result = connection.execute(
                text("SELECT id FROM users WHERE public_id IS NULL")
            )
            users = user_result.fetchall()

            # Update each user
            for user in users:
                user_id = user[0]
                public_id = str(uuid.uuid4())
                connection.execute(
                    text("UPDATE users SET public_id = :public_id WHERE id = :user_id"),
                    {"public_id": public_id, "user_id": user_id},
                )
                print(f"Updated user {user_id} with public_id: {public_id}")

            print(f"Successfully updated {len(users)} users")
        else:
            print("No users need updating")


if __name__ == "__main__":
    populate_public_ids()
