import { requireAdminSession } from '@/lib/session-wrapper';
import FAQForm from '@/components/admin/FAQForm';

interface FAQEditPageProps {
  params: {
    id: string;
  };
}

export default async function FAQEditPage({ params }: FAQEditPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {params.id === 'new' ? 'Create New FAQ' : 'Edit FAQ'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {params.id === 'new' ? 'Create a new frequently asked question' : 'Edit existing FAQ'}
        </p>
      </div>

      {/* FAQ Form Component */}
      <FAQForm faqId={params.id} />
    </div>
  );
}
