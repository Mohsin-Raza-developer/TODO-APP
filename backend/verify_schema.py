"""
Script to verify database schema was created successfully.

This script connects to the Neon database and checks for:
- users and tasks tables exist
- Index on tasks.user_id exists
- Trigger on tasks.updated_at exists
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set in .env file")
    exit(1)

engine = create_engine(DATABASE_URL)

print("🔍 Verifying database schema...\n")

# Check tables exist
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    """))
    tables = [row[0] for row in result]

    print("📋 Tables found:")
    for table in tables:
        print(f"  ✅ {table}")

    if "users" not in tables or "tasks" not in tables:
        print("\n❌ Missing required tables (users, tasks)")
        exit(1)

# Check index exists
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'tasks'
        AND schemaname = 'public'
    """))
    indexes = [row[0] for row in result]

    print("\n📊 Indexes on tasks table:")
    for index in indexes:
        print(f"  ✅ {index}")

    if "ix_tasks_user_id" not in indexes:
        print("\n❌ Missing required index (ix_tasks_user_id)")
        exit(1)

# Check trigger exists
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT trigger_name FROM information_schema.triggers
        WHERE event_object_table = 'tasks'
        AND event_object_schema = 'public'
    """))
    triggers = [row[0] for row in result]

    print("\n⚡ Triggers on tasks table:")
    for trigger in triggers:
        print(f"  ✅ {trigger}")

    if "update_tasks_updated_at" not in triggers:
        print("\n❌ Missing required trigger (update_tasks_updated_at)")
        exit(1)

# Check task table schema
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'tasks'
        AND table_schema = 'public'
        ORDER BY ordinal_position
    """))

    print("\n📝 Tasks table schema:")
    for row in result:
        nullable = "NULL" if row[2] == "YES" else "NOT NULL"
        print(f"  {row[0]:15} {row[1]:20} {nullable}")

print("\n✅ Database schema verification PASSED")
print("   - users and tasks tables created")
print("   - ix_tasks_user_id index created")
print("   - update_tasks_updated_at trigger created")
