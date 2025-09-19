import { requireAdminSession } from '@/lib/session-wrapper';
import FAQManagement from '@/components/admin/FAQManagement';

export default async function FAQManagementPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          FAQ Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage frequently asked questions and answers
        </p>
      </div>

      {/* FAQ Management Component */}
      <FAQManagement />
    </div>
  );
}
