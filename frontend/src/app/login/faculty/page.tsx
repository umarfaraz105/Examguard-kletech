import RoleLoginForm from '@/components/auth/RoleLoginForm';

export default function FacultyLoginPage() {
  return (
    <RoleLoginForm
      role="FACULTY"
      title="Faculty"
      description="Faculty members - Invigilation duties and teaching"
      icon="👨‍🏫"
      placeholderEmail="faculty@kle.edu"
      demoCredentials={{
        email: "faculty@examguard.edu",
        password: "faculty123"
      }}
    />
  );
}
