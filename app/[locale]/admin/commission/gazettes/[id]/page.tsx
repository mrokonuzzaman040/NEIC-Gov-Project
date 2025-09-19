import { requireAdminSession } from '@/lib/session-wrapper';
import GazetteForm from '@/components/admin/GazetteForm';

interface GazetteEditPageProps {
  params: {
    id: string;
  };
}

export default async function GazetteEditPage({ params }: GazetteEditPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {params.id === 'new' ? 'Create New Gazette' : 'Edit Gazette'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {params.id === 'new' ? 'Create a new official gazette' : 'Edit existing gazette information'}
        </p>
      </div>

      {/* Gazette Form Component */}
      <GazetteForm gazetteId={params.id} />
    </div>
  );
}
