import { requireAdminSession } from '@/lib/session-wrapper';
import UserForm from '@/components/admin/UserForm';

export default async function NewUserPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Add New User
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Create a new admin user account
        </p>
      </div>

      {/* User Form */}
      <UserForm />
    </div>
  );
}
