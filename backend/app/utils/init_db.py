"""Database initialization utilities."""
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.base import Base
from app.core.database import engine
from app.utils.seed_rules import seed_default_rules


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


def create_default_admin(db: Session, email: str = "admin@examguard.edu", password: str = "admin123"):
    """
    Create default admin user if it doesn't exist.
    
    Args:
        db: Database session
        email: Admin email address
        password: Admin password (should be changed after first login)
    """
    existing_admin = db.query(User).filter(User.email == email).first()
    
    if existing_admin:
        print(f"Admin user '{email}' already exists.")
        return existing_admin
    
    admin_user = User(
        email=email,
        full_name="System Administrator",
        hashed_password=get_password_hash(password),
        role=UserRole.ADMIN,
        is_active=True,
        employee_id="ADMIN001"
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"Default admin user created: {email}")
    print(f"Default password: {password}")
    print("⚠️  IMPORTANT: Change this password immediately after first login!")
    
    return admin_user


def initialize_database(db: Session):
    """
    Initialize database with default data.
    
    Args:
        db: Database session
    """
    print("Initializing database...")
    
    # Create default admin
    create_default_admin(db)
    
    # Seed default rules
    seed_default_rules(db)
    
    print("Database initialization complete!")


if __name__ == "__main__":
    from app.core.database import SessionLocal
    
    # Create tables
    create_tables()
    
    # Initialize with default data
    db = SessionLocal()
    try:
        initialize_database(db)
    finally:
        db.close()
