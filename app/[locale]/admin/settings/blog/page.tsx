import { requireAdminSession } from '@/lib/session-wrapper';
import BlogManagement from '@/components/admin/BlogManagement';

export default async function BlogManagementPage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Blog Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage blog posts and articles
        </p>
      </div>

      {/* Blog Management Component */}
      <BlogManagement />
    </div>
  );
}
