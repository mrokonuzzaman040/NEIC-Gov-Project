import { NextRequest, NextResponse } from 'next/server';
import { submissionSchema } from '../../../lib/validation/submission';
import { checkRateLimit } from '../../../lib/rateLimit';
import { prisma } from '../../../lib/db';
import { hashIp } from '../../../lib/crypto/hash';
import { logSubmission } from '../../../lib/logger';
import { assessSpam } from '../../../lib/spam';
import { storeFile, validateFile, type StoredFileInfo } from '../../../lib/storage';

export const runtime = 'nodejs';

function json(data: any, init?: number | ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}


export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const reqId = req.headers.get('x-request-id') || undefined;
  const { allowed } = await checkRateLimit(`submit:${ip}`);
  if (!allowed) {
    return json({ ok: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }, 429);
  }
  let body: unknown;
  let hasFile = false;
  let fileInfo: { name: string; size: number; type: string; url?: string; key?: string } | null = null;
  const contentType = req.headers.get('content-type') || '';
  
  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        shareName: formData.get('shareName') === 'true',
        message: formData.get('message') as string,
        honeypot: formData.get('website') as string
      };
      const attachment = formData.get('attachment') as File;
      if (attachment && attachment.size > 0) {
        // Validate file
        const validation = validateFile(attachment);
        if (!validation.valid) {
          return json({
            ok: false,
            error: {
              code: 'FILE_VALIDATION_ERROR',
              message: validation.error
            }
          }, 400);
        }
        
        try {
          // Store file and get file info
          const storedFile = await storeFile(attachment);
          hasFile = true;
          fileInfo = {
            name: storedFile.originalName,
            size: storedFile.size,
            type: storedFile.mimeType,
            url: storedFile.url,
            key: storedFile.key
          };
          
          // Log file upload for audit purposes
          console.log(`File stored: ${storedFile.originalName}, size: ${(storedFile.size / (1024 * 1024)).toFixed(2)}MB, type: ${storedFile.mimeType}, url: ${storedFile.url}`);
        } catch (fileError) {
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
    } else {
      body = await req.json();
    }
  } catch {
    return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid request format' } }, 400);
  }
  
  // Basic honeypot: if client submits a hidden field with value, treat as bot
  if (body && typeof body === 'object' && ((body as any).hp_field || (body as any).honeypot)) {
    return json({ ok: false, error: { code: 'SPAM', message: 'Rejected' } }, 400);
  }
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'Validation failed', issues: parsed.error.issues } }, 422);
  }
  const locale = req.nextUrl.pathname.split('/')[1] || 'bn';
  try {
    const spam = assessSpam(parsed.data.message);
    const flagged = spam.score >= 0.5; // threshold
    const record = await prisma.submission.create({
      data: {
        name: parsed.data.shareName ? (parsed.data.name || null) : null,
        contact: parsed.data.phone,
        email: parsed.data.email || null,
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
