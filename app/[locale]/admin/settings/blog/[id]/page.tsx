import { requireAdminSession } from '@/lib/session-wrapper';
import BlogForm from '@/components/admin/BlogForm';

interface BlogEditPageProps {
  params: {
    id: string;
  };
}

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {params.id === 'new' ? 'Create New Blog Post' : 'Edit Blog Post'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {params.id === 'new' ? 'Create a new blog post' : 'Edit existing blog post'}
        </p>
      </div>

      {/* Blog Form Component */}
      <BlogForm postId={params.id} />
    </div>
  );
}
