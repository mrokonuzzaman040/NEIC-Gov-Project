import { requireAdminSession } from '@/lib/session-wrapper';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Audit Logs
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View system audit trail and user activities
        </p>
      </div>

      {/* Audit Logs Viewer */}
      <AuditLogsViewer />
    </div>
  );
}
