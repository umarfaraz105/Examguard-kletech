import RoleLoginForm from '@/components/auth/RoleLoginForm';

export default function StudentLoginPage() {
  return (
    <RoleLoginForm
      role="STUDENT"
      title="Student"
      description="View timetable, hall tickets, and examination details"
      icon="🎓"
      placeholderEmail="1KS21CS001@student.kle.edu"
      demoCredentials={{
        email: "student@examguard.edu",
        password: "student123"
      }}
    />
  );
}