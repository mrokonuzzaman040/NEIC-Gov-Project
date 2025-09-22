import { requireAdminSession } from '@/lib/session-wrapper';
import CommissionOfficialForm from '@/components/admin/CommissionOfficialForm';

interface EditCommissionOfficialPageProps {
  params: { id: string };
}

export default async function EditCommissionOfficialPage({ params }: EditCommissionOfficialPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit Commission Official
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update commission official information
        </p>
      </div>

      {/* Commission Official Form */}
      <CommissionOfficialForm officialId={params.id} />
    </div>
  );
}
