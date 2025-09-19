import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionTermsManagement from '@/components/admin/CommissionTermsManagement';

export default async function CommissionTermsPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Commission Terms of Reference
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage commission&apos;s terms of reference and mandate
        </p>
      </div>

      {/* Commission Terms Management Component */}
      <CommissionTermsManagement />
    </div>
  );
}
