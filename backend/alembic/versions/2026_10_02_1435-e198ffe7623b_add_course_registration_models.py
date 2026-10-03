"""add_course_registration_models

Revision ID: e198ffe7623b
Revises: 254fc35e1f4b
Create Date: 2026-10-02 14:35:11.188057

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e198ffe7623b'
down_revision: Union[str, None] = '254fc35e1f4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


"""add_course_registration_models

Revision ID: e198ffe7623b
Revises: 254fc35e1f4b
Create Date: 2026-10-02 14:35:31.486269

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e198ffe7623b'
down_revision: Union[str, None] = '254fc35e1f4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create course_registration_uploads table
    op.create_table(
        'course_registration_uploads',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('hod_id', sa.Integer, nullable=False, index=True),
        sa.Column('department_id', sa.Integer, nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, index=True, server_default='PENDING'),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('record_count', sa.Integer, default=0),
        sa.Column('valid_count', sa.Integer, default=0),
        sa.Column('invalid_count', sa.Integer, default=0),
        sa.Column('upload_notes', sa.Text, nullable=True),
        sa.Column('validation_notes', sa.Text, nullable=True),
        sa.Column('rejection_reason', sa.Text, nullable=True),
        sa.Column('uploaded_at', sa.DateTime, nullable=True),
        sa.Column('validated_at', sa.DateTime, nullable=True),
        sa.Column('approved_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=True),
        sa.Column('updated_at', sa.DateTime, nullable=True)
    )
    
    # Create course_registrations table
    op.create_table(
        'course_registrations',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('upload_id', sa.Integer, nullable=False, index=True),
        sa.Column('usn', sa.String(20), nullable=False, index=True),
        sa.Column('student_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('department_code', sa.String(10), nullable=False, index=True),
        sa.Column('semester', sa.Integer, nullable=False),
        sa.Column('academic_year', sa.String(20), nullable=False, index=True),
        sa.Column('course_code', sa.String(20), nullable=False, index=True),
        sa.Column('course_name', sa.String(255), nullable=False),
        sa.Column('course_type', sa.String(20), nullable=False),
        sa.Column('credits', sa.Integer, default=3),
        sa.Column('exam_duration_minutes', sa.Integer, default=180),
        sa.Column('is_valid', sa.Boolean, default=False, index=True),
        sa.Column('validation_errors', sa.Text, nullable=True),
        sa.Column('matched_student_id', sa.Integer, nullable=True),
        sa.Column('matched_course_id', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=True),
        sa.Column('updated_at', sa.DateTime, nullable=True)
    )


def downgrade() -> None:
    op.drop_table('course_registrations')
    op.drop_table('course_registration_uploads')
