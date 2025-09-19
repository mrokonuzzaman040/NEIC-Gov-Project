import { requireAdminSession } from '@/lib/session-wrapper';
import UserForm from '@/components/admin/UserForm';

interface EditUserPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit User
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update user account information
        </p>
      </div>

      {/* User Form */}
      <UserForm userId={params.id} />
    </div>
  );
}
