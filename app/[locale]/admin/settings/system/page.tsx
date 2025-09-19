import { requireAdminSession } from '@/lib/session-wrapper';
import SystemSettings from '@/components/admin/SystemSettings';

export default async function SystemSettingsPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* System Settings Component */}
      <SystemSettings />
    </div>
  );
}
