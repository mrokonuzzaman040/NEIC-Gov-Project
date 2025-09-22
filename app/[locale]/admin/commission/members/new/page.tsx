import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionMemberForm from '@/components/admin/CommissionMemberForm';

export default async function NewCommissionMemberPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Add New Commission Member
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Add a new commission member or support staff to the directory
        </p>
      </div>

      {/* Commission Member Form */}
      <CommissionMemberForm />
    </div>
  );
}
