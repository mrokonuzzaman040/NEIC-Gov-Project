import LoginForm from '@/components/admin/LoginForm';

export default async function LoginPage() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
