import { requireAdminSession } from '@/lib/session-wrapper';
import UserManagement from '@/components/admin/UserManagement';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          User Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage admin users and their permissions
        </p>
      </div>

      {/* User Management Component */}
      <UserManagement />
    </div>
  );
}
