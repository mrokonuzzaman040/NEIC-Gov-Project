import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionMembersManagement from '@/components/admin/CommissionMembersManagement';

export default async function CommissionMembersPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Commission Members Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage commission members and their information
        </p>
      </div>

      {/* Commission Members Management Component */}
      <CommissionMembersManagement />
    </div>
  );
}
