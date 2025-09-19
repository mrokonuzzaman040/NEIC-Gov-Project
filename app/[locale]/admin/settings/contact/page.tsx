import { requireAdminSession } from '@/lib/session-wrapper';
import ContactManagement from '@/components/admin/ContactManagement';

export default async function ContactManagementPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Contact Information Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage contact information and office details
        </p>
      </div>

      {/* Contact Management Component */}
      <ContactManagement />
    </div>
  );
}
