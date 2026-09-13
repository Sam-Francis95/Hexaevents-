"""multi_role

Revision ID: a1b2c3d4e5f6
Revises: cd22666d7155
Create Date: 2026-09-09 17:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'cd22666d7155'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)

    # Insert default roles
    role1 = str(uuid.uuid4())
    role2 = str(uuid.uuid4())
    op.execute(f"INSERT INTO roles (id, name) VALUES ('{role1}', 'participant'), ('{role2}', 'event_manager')")

    # Create user_roles table
    op.create_table('user_roles',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'role_id')
    )

    # Add new columns to users
    op.add_column('users', sa.Column('organization_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('status', sa.String(), server_default='active', nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))

    # Migrate existing users roles
    op.execute("""
        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u
        JOIN roles r ON u.role = r.name
    """)

    # Drop old role column
    op.drop_column('users', 'role')

def downgrade() -> None:
    op.add_column('users', sa.Column('role', sa.String(), server_default='participant', nullable=False))
    
    # Restore roles
    op.execute("""
        UPDATE users u
        SET role = (
            SELECT r.name 
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = u.id
            LIMIT 1
        )
    """)

    op.drop_column('users', 'last_login')
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'status')
    op.drop_column('users', 'organization_id')
    op.drop_table('user_roles')
    op.drop_index(op.f('ix_roles_name'), table_name='roles')
    op.drop_table('roles')
