import { requireAdminSession } from '@/lib/session-wrapper';
import GalleryForm from '@/components/admin/GalleryForm';

interface EditGalleryItemPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function EditGalleryItemPage({ params }: EditGalleryItemPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit Gallery Item
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update gallery item information and image
        </p>
      </div>

      {/* Gallery Form */}
      <GalleryForm itemId={params.id} />
    </div>
  );
}
