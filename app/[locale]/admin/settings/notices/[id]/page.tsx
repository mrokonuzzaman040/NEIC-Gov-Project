import { requireAdminSession } from '@/lib/session-wrapper';
import NoticeForm from '@/components/admin/NoticeForm';

interface NoticeEditPageProps {
  params: {
    id: string;
  };
}

export default async function NoticeEditPage({ params }: NoticeEditPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {params.id === 'new' ? 'Create New Notice' : 'Edit Notice'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {params.id === 'new' ? 'Create a new public notice or announcement' : 'Edit existing notice'}
        </p>
      </div>

      {/* Notice Form Component */}
      <NoticeForm noticeId={params.id} />
    </div>
  );
}
