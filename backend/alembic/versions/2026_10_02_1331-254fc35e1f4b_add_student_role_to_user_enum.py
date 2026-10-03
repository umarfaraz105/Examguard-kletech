"""add_student_role_to_user_enum

Revision ID: 254fc35e1f4b
Revises: c5b28f965547
Create Date: 2026-10-02 13:31:45.134784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '254fc35e1f4b'
down_revision: Union[str, None] = 'c5b28f965547'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite doesn't support ALTER TYPE, but SQLAlchemy handles enum changes automatically
    # when the model is updated. The STUDENT value will be available when new users are created.
    # No explicit migration needed for SQLite enum changes.
    pass


def downgrade() -> None:
    # No action needed for SQLite
    pass
