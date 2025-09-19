import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
