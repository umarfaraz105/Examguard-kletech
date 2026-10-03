"""Test login functionality."""
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()

# Find the admin user
user = db.query(User).filter(User.email == "admin@examguard.edu").first()

if user:
    print(f"User found: {user.email}")
    print(f"User active: {user.is_active}")
    print(f"User role: {user.role}")
    print(f"Hashed password in DB: {user.hashed_password[:50]}...")
    
    # Test password verification
    test_password = "admin123"
    print(f"\nTesting password: {test_password}")
    
    is_valid = verify_password(test_password, user.hashed_password)
    print(f"Password verification result: {is_valid}")
    
    # Try hashing the password again to compare
    new_hash = get_password_hash(test_password)
    print(f"\nNew hash would be: {new_hash[:50]}...")
else:
    print("User not found!")

db.close()
