import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="enhanced-card p-8 shadow-2xl border-0 text-center">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Invalid Reset Link
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The password reset link is invalid or has expired.
              </p>
              <a
                href="/en/forgot-password"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                Request a new reset link
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
