import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionOfficialForm from '@/components/admin/CommissionOfficialForm';

export default async function NewCommissionOfficialPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Add New Commission Official
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Add a new commission official or staff member to the directory
        </p>
      </div>

      {/* Commission Official Form */}
      <CommissionOfficialForm />
    </div>
  );
}
