import { requireAdminSession } from '@/lib/session-wrapper';
import GazettesManagement from '@/components/admin/GazettesManagement';

export default async function GazettesPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gazettes Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage official gazettes and government notifications
        </p>
      </div>

      {/* Gazettes Management Component */}
      <GazettesManagement />
    </div>
  );
}
