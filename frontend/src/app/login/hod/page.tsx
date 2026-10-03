import RoleLoginForm from '@/components/auth/RoleLoginForm';

export default function HODLoginPage() {
  return (
    <RoleLoginForm
      role="HOD"
      title="HOD"
      description="Head of Department - Course management and approval"
      icon="👨‍💼"
      placeholderEmail="hod@kle.edu"
      demoCredentials={{
        email: "hod@examguard.edu",
        password: "hod123"
      }}
    />
  );
}