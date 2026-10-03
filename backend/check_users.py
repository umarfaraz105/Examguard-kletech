"""Check users in database."""
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text('SELECT id, email, full_name, role, is_active FROM users'))
    print("\nUsers in database:")
    print("-" * 80)
    for row in result:
        print(f"ID: {row[0]}, Email: {row[1]}, Name: {row[2]}, Role: {row[3]}, Active: {row[4]}")
    print("-" * 80)
