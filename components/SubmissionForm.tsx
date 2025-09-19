"use client";
import { useState } from 'react';
import { submissionSchema } from '../lib/validation/submission';
import { useTranslations } from 'next-intl';

export function SubmissionForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    const values = {
      name: String(formData.get('name') || ''),
      contact: String(formData.get('contact') || ''),
      message: String(formData.get('message') || '')
    };
    const parsed = submissionSchema.safeParse(values);
    if (!parsed.success) {
      setStatus('error');
  setErrorMsg(t('error.validation'));
      return;
    }
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (res.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else if (res.status === 429) {
        setStatus('error');
  setErrorMsg(t('error.tooMany'));
      } else {
        setStatus('error');
  setErrorMsg(t('error.generic'));
      }
    } catch (err) {
      setStatus('error');
  setErrorMsg(t('error.generic'));
    }
  }

  return (
    <section id="opinion-form" className="card mt-8">
  <h3 className="text-xl font-semibold m-0">{t('form.title')}</h3>
      <p className="text-muted text-sm mt-1 mb-4 max-w-prose">{t('form.desc')}</p>
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="opinion form">
        {/* Honeypot field (bots may fill). Hidden from users via CSS */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="hp_field">Do not fill</label>
          <input id="hp_field" name="hp_field" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">{t('form.name')}</label>
          <input id="name" name="name" maxLength={120} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact" className="text-sm font-medium">{t('form.contact')}</label>
          <input id="contact" name="contact" maxLength={120} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium">{t('form.message')}</label>
          <textarea id="message" name="message" required maxLength={500} className="border rounded-lg px-3 py-2 text-sm min-h-40" placeholder={t('form.placeholder')}></textarea>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={status === 'submitting'} className="bg-accent text-white px-5 py-2 rounded-lg font-semibold text-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed" type="submit">
            {status === 'submitting' ? '...' : t('form.submit')}
          </button>
          <button type="reset" className="text-sm font-medium px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">{t('form.reset')}</button>
          <small className="text-muted text-xs">{t('form.privacy')}</small>
        </div>
  {status === 'success' && <p className="text-green-600 text-sm" role="status">{t('success.submitted')}</p>}
        {status === 'error' && errorMsg && <p className="text-red-600 text-sm" role="alert">{errorMsg}</p>}
      </form>
    </section>
  );
}
