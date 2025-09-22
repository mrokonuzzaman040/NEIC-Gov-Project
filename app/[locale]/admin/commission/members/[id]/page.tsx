import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionMemberForm from '@/components/admin/CommissionMemberForm';

interface EditCommissionMemberPageProps {
  params: { id: string };
}

export default async function EditCommissionMemberPage({ params }: EditCommissionMemberPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit Commission Member
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update commission member information
        </p>
      </div>

      {/* Commission Member Form */}
      <CommissionMemberForm memberId={params.id} />
    </div>
  );
}
