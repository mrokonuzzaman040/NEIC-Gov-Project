import { requireAdminSession } from '@/lib/session-wrapper';
import SliderManagement from '@/components/admin/SliderManagement';

export default async function SliderManagementPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Slider Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage homepage slider content and featured updates
        </p>
      </div>

      {/* Slider Management Component */}
      <SliderManagement />
    </div>
  );
}
