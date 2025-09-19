import { requireAdminSession } from '@/lib/session-wrapper';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export default async function ChangePasswordPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Change Password
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update your account password for better security
        </p>
      </div>

      {/* Change Password Form */}
      <div className="max-w-2xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
