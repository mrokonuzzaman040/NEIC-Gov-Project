import { requireAdminSession } from '@/lib/session-wrapper';
import ProfileSettings from '@/components/admin/ProfileSettings';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Profile Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Settings Form */}
      <ProfileSettings />
    </div>
  );
}
