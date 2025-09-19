import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionOfficialsManagement from '@/components/admin/CommissionOfficialsManagement';

export default async function CommissionOfficialsPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Commission Officials Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage commission officials and staff members
        </p>
      </div>

      {/* Commission Officials Management Component */}
      <CommissionOfficialsManagement />
    </div>
  );
}
