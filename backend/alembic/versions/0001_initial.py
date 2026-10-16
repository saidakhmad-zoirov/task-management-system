"""users va tasks jadvallari

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-15
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("priority", sa.String(length=10), nullable=False),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.CheckConstraint("status IN ('todo', 'in_progress', 'done')", name="ck_tasks_status"),
        sa.CheckConstraint("priority IN ('low', 'medium', 'high')", name="ck_tasks_priority"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasks_owner_id", "tasks", ["owner_id"])
    op.create_index("ix_tasks_owner_status", "tasks", ["owner_id", "status"])
    op.create_index("ix_tasks_owner_deadline", "tasks", ["owner_id", "deadline"])


def downgrade() -> None:
    op.drop_index("ix_tasks_owner_deadline", table_name="tasks")
    op.drop_index("ix_tasks_owner_status", table_name="tasks")
    op.drop_index("ix_tasks_owner_id", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
