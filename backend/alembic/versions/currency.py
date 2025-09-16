"""Add currency_code to user_settings

Revision ID: currency_migration
Revises: 092d61d626d1
Create Date: 2024-01-xx xx:xx:xx.xxxxxx

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "abc123def456"  # Use a new unique ID
down_revision = "092d61d626d1"
branch_labels = None
depends_on = None


def upgrade():
    # Add the column
    op.add_column(
        "user_settings", sa.Column("currency_code", sa.String(3), nullable=True)
    )

    # Update existing rows to have default value
    op.execute(
        "UPDATE user_settings SET currency_code = 'USD' WHERE currency_code IS NULL"
    )

    # Make the column non-nullable if needed
    op.alter_column("user_settings", "currency_code", nullable=False)


def downgrade():
    op.drop_column("user_settings", "currency_code")
