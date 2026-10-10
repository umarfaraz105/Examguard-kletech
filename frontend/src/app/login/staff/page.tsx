import RoleLoginForm from '@/components/auth/RoleLoginForm';

export default function StaffLoginPage() {
  return (
    <RoleLoginForm
      role="STAFF"
      title="Staff"
      description="Exam planning and operational management"
      icon="🏢"
      placeholderEmail="staff@kle.edu"
      demoCredentials={{
        email: "admin@examguard.edu",
        password: "admin123"
      }}
    />
  );
}
