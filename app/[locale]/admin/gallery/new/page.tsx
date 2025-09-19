import { requireAdminSession } from '@/lib/session-wrapper';
import GalleryForm from '@/components/admin/GalleryForm';

export default async function NewGalleryItemPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Add New Gallery Item
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload a new image to the gallery
        </p>
      </div>

      {/* Gallery Form */}
      <GalleryForm />
    </div>
  );
}
