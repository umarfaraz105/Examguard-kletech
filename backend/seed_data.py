#!/usr/bin/env python
"""Seed initial test data for ExamGuard."""
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.department import Department
import bcrypt

db = SessionLocal()

def hash_password(password: str) -> str:
    """Hash password using bcrypt directly."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

try:
    # Create departments if they don't exist
    depts = [
        ("CSE", "Computer Science & Engineering"),
        ("ECE", "Electronics & Communication Engineering"),
        ("ME", "Mechanical Engineering"),
        ("CE", "Civil Engineering"),
    ]
    
    dept_map = {}
    for code, name in depts:
        existing = db.query(Department).filter(Department.code == code).first()
        if not existing:
            dept = Department(code=code, name=name)
            db.add(dept)
            db.flush()
            dept_map[code] = dept.id
            print(f"✓ Created department: {name} ({code})")
        else:
            dept_map[code] = existing.id
            print(f"✓ Department exists: {name} ({code})")
    
    db.commit()
    
    # Create HOD user
    hod_email = "hod@examguard.edu"
    existing_hod = db.query(User).filter(User.email == hod_email).first()
    
    if not existing_hod:
        hod = User(
            email=hod_email,
            full_name="Dr. HOD User",
            hashed_password=hash_password("hod123"),
            role=UserRole.HOD,
            is_active=True,
            department_id=dept_map["CSE"]
        )
        db.add(hod)
        db.commit()
        print(f"✓ Created HOD user: {hod_email} (password: hod123)")
    else:
        print(f"✓ HOD user exists: {hod_email}")
    
    # Create ADMIN user
    admin_email = "admin@examguard.edu"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    
    if not existing_admin:
        admin = User(
            email=admin_email,
            full_name="Admin User",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"✓ Created ADMIN user: {admin_email} (password: admin123)")
    else:
        print(f"✓ ADMIN user exists: {admin_email}")
    
    # Create STAFF (EXAM_CELL) user
    staff_email = "staff@examguard.edu"
    existing_staff = db.query(User).filter(User.email == staff_email).first()
    
    if not existing_staff:
        staff = User(
            email=staff_email,
            full_name="Staff User",
            hashed_password=hash_password("staff123"),
            role=UserRole.EXAM_CELL,
            is_active=True
        )
        db.add(staff)
        db.commit()
        print(f"✓ Created STAFF user: {staff_email} (password: staff123)")
    else:
        print(f"✓ STAFF user exists: {staff_email}")
    
    print("\n✅ Test data seeded successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
