import { NextRequest, NextResponse } from 'next/server';
import { submissionSchema } from '../../../lib/validation/submission';
import { checkRateLimit } from '../../../lib/rateLimit';
import { prisma } from '../../../lib/db';
import { hashIp } from '../../../lib/crypto/hash';
import { logSubmission } from '../../../lib/logger';
import { assessSpam } from '../../../lib/spam';
import { FileValidationError, storeFile } from '../../../lib/storage';
import { isCaptchaConfigured, verifyCaptcha } from '../../../lib/security/captcha';

export const runtime = 'nodejs';

function json(data: any, init?: number | ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}


export async function POST(req: NextRequest) {
  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || req.ip || 'anonymous';
  const ip = rawIp || 'anonymous';
  const reqId = req.headers.get('x-request-id') || undefined;
  const { allowed } = await checkRateLimit(`submit:${ip}`);
  if (!allowed) {
    return json({ ok: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }, 429);
  }
  let body: Record<string, any> | null = null;
  let hasFile = false;
  let fileInfo: { name: string; size: number; type: string; url?: string; key?: string } | null = null;
  let captchaToken: string | null = null;
  let attachmentFile: File | null = null;
  const contentType = req.headers.get('content-type') || '';
  
  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const shareNameValue = formData.get('shareName');
      captchaToken = (formData.get('captchaToken') as string) || (formData.get('h-captcha-response') as string) || null;
      attachmentFile = (formData.get('attachment') as File) || null;

      body = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        district: formData.get('district') as string,
        seatName: formData.get('seatName') as string,
        shareName: shareNameValue === 'true' || shareNameValue === 'on',
        message: formData.get('message') as string,
        honeypot: formData.get('website') as string
      };
    } else {
      const jsonPayload = await req.json();
      if (!jsonPayload || typeof jsonPayload !== 'object') {
        throw new Error('Invalid JSON payload');
      }

      const { captchaToken: jsonCaptchaToken, ...rest } = jsonPayload as Record<string, any>;
      captchaToken = typeof jsonCaptchaToken === 'string' ? jsonCaptchaToken : null;
      body = rest;
    }
  } catch {
    return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid request format' } }, 400);
  }
  
  const captchaRequired = isCaptchaConfigured();
  if (captchaRequired) {
    if (!captchaToken) {
      return json({ ok: false, error: { code: 'CAPTCHA_REQUIRED', message: 'Captcha verification is required.' } }, 400);
    }

    const captchaResult = await verifyCaptcha(captchaToken, ip === 'anonymous' ? undefined : ip);
    if (!captchaResult.success) {
      logSubmission('submission.captcha_failed', {
        errorCodes: captchaResult.errorCodes,
        message: captchaResult.message
      }, reqId);
      return json({ ok: false, error: { code: 'CAPTCHA_FAILED', message: 'Captcha verification failed. Please try again.' } }, 400);
    }
  }

  // Basic honeypot: if client submits a hidden field with value, treat as bot
  if (body && typeof body === 'object' && ((body as any).hp_field || (body as any).honeypot)) {
    return json({ ok: false, error: { code: 'SPAM', message: 'Rejected' } }, 400);
  }
  console.log('Received body:', body);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    console.error('Validation failed:', parsed.error.issues);
    return json({ ok: false, error: { code: 'VALIDATION', message: 'Validation failed', issues: parsed.error.issues } }, 422);
  }
  const locale = req.nextUrl.pathname.split('/')[1] || 'bn';
  try {
    if (attachmentFile && attachmentFile.size > 0) {
      try {
        const storedFile = await storeFile(attachmentFile);
        hasFile = true;
        fileInfo = {
          name: storedFile.originalName,
          size: storedFile.size,
          type: storedFile.mimeType,
          url: storedFile.url,
          key: storedFile.key
        };

        logSubmission('submission.fileStored', {
          fileName: storedFile.originalName,
          fileSize: storedFile.size,
          mimeType: storedFile.mimeType,
          storageKey: storedFile.key
        }, reqId);
      } catch (fileError) {
        if (fileError instanceof FileValidationError) {
          return json({
            ok: false,
            error: {
              code: 'FILE_VALIDATION_ERROR',
              message: fileError.message
            }
          }, 400);
        }
        console.error('File storage error:', fileError);
        return json({
          ok: false,
          error: {
            code: 'FILE_STORAGE_ERROR',
            message: 'Failed to store file. Please try again.'
          }
        }, 500);
      }
    }

    const spam = assessSpam(parsed.data.message);
    const flagged = spam.score >= 0.5; // threshold
    const record = await prisma.submission.create({
      data: {
        name: parsed.data.shareName ? (parsed.data.name || null) : null,
        contact: parsed.data.phone || null,
        email: parsed.data.email || null,
        district: parsed.data.district,
        seatName: parsed.data.seatName,
        message: parsed.data.message,
        ipHash: hashIp(ip),
        locale,
        status: flagged ? 'FLAGGED' : undefined,
        // File attachment data
        attachmentUrl: fileInfo?.url || null,
        attachmentKey: fileInfo?.key || null,
        attachmentName: fileInfo?.name || null,
        attachmentSize: fileInfo?.size || null,
        attachmentType: fileInfo?.type || null
      },
      select: { id: true, locale: true, createdAt: true, status: true }
    });
    logSubmission('submission.created', {
      id: record.id,
      locale: record.locale,
      status: record.status,
      spamScore: spam.score,
      spamReasons: spam.reasons,
      hasFile,
      fileInfo
    }, reqId);
  } catch (e) {
    logSubmission('submission.error', { error: (e as Error).message }, reqId);
    return json({ ok: false, error: { code: 'DB_ERROR', message: 'Could not store submission' } }, 500);
  }
  return json({ ok: true });
}
