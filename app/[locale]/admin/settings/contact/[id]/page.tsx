import { requireAdminSession } from '@/lib/session-wrapper';
import ContactForm from '@/components/admin/ContactForm';

interface ContactEditPageProps {
  params: {
    id: string;
  };
}

export default async function ContactEditPage({ params }: ContactEditPageProps) {
  await requireAdminSession();
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {params.id === 'new' ? 'Create New Contact' : 'Edit Contact'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {params.id === 'new' ? 'Create a new contact information entry' : 'Edit existing contact information'}
        </p>
      </div>

      {/* Contact Form Component */}
      <ContactForm contactId={params.id} />
    </div>
  );
}
