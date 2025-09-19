import { requireAdminSession } from '@/lib/session-wrapper';
import GalleryManagement from '@/components/admin/GalleryManagement';

export default async function AdminGalleryPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gallery Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage gallery images and media content
        </p>
      </div>

      {/* Gallery Management Component */}
      <GalleryManagement />
    </div>
  );
}
