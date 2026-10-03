"""Debug incoming login requests."""
import sys
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

# Get email from command line
if len(sys.argv) < 3:
    print("Usage: python debug_request.py <email> <password>")
    sys.exit(1)

email = sys.argv[1]
password = sys.argv[2]

print(f"\n{'='*80}")
print(f"DEBUG LOGIN ATTEMPT")
print(f"{'='*80}")
print(f"Received email: '{email}'")
print(f"Received password: '{password}'")
print(f"Email length: {len(email)}")
print(f"Password length: {len(password)}")
print(f"Email bytes: {email.encode()}")
print(f"Password bytes: {password.encode()}")

db = SessionLocal()

# Try to find user
user = db.query(User).filter(User.email == email).first()

if not user:
    print(f"\n❌ NO USER FOUND with email: '{email}'")
    print(f"\nAll users in database:")
    all_users = db.query(User).all()
    for u in all_users:
        print(f"  - {u.email} (ID: {u.id})")
else:
    print(f"\n✅ USER FOUND: {user.email}")
    print(f"   User ID: {user.id}")
    print(f"   Full Name: {user.full_name}")
    print(f"   Role: {user.role}")
    print(f"   Active: {user.is_active}")
    print(f"   Hashed Password: {user.hashed_password[:30]}...")
    
    # Test password
    print(f"\nTesting password verification...")
    is_valid = verify_password(password, user.hashed_password)
    
    if is_valid:
        print(f"✅ PASSWORD IS CORRECT!")
    else:
        print(f"❌ PASSWORD IS INCORRECT!")
        print(f"\nTrying with 'admin123' to verify hash works...")
        test_valid = verify_password("admin123", user.hashed_password)
        print(f"   Test with 'admin123': {'✅ WORKS' if test_valid else '❌ FAILS'}")

db.close()
print(f"{'='*80}\n")
