"""Fix foreign key to point to Better Auth user table

Revision ID: fix_user_fk_20260120
Revises: db201faec95e
Create Date: 2026-01-20 11:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_user_fk_20260120'
down_revision: Union[str, None] = 'db201faec95e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop old foreign key constraint pointing to 'users' table
    op.drop_constraint('tasks_user_id_fkey', 'tasks', type_='foreignkey')

    # Add new foreign key constraint pointing to Better Auth 'user' table
    op.create_foreign_key(
        'tasks_user_id_fkey',
        'tasks', 'user',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Revert to old foreign key pointing to 'users' table
    op.drop_constraint('tasks_user_id_fkey', 'tasks', type_='foreignkey')
    op.create_foreign_key(
        'tasks_user_id_fkey',
        'tasks', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )
