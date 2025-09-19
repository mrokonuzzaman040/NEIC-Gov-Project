import { requireAdminSession } from '@/lib/session-wrapper';
import NoticeManagement from '@/components/admin/NoticeManagement';

export default async function NoticeManagementPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Notice Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage public notices and announcements
        </p>
      </div>

      {/* Notice Management Component */}
      <NoticeManagement />
    </div>
  );
}
