import { logger } from '../logger';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export interface CaptchaVerificationResult {
  success: boolean;
  errorCodes?: string[];
  message?: string;
  status: 'verified' | 'skipped' | 'error';
}

let configurationWarningLogged = false;

function getSecretKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_KEY_SECRET;
}

function getSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_KEY;
}

export function isCaptchaConfigured() {
  return Boolean(getSecretKey() && getSiteKey());
}

export async function verifyCaptcha(
  token: string,
  remoteIp?: string | null
): Promise<CaptchaVerificationResult> {
  const secret = getSecretKey();

  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      if (!configurationWarningLogged) {
        logger.warn('NEXT_PUBLIC_RECAPTCHA_KEY_SECRET missing. Skipping captcha verification in non-production environment.');
        configurationWarningLogged = true;
      }
      return { success: true, status: 'skipped', message: 'Captcha verification skipped (secret not configured).' };
    }

    logger.error('reCAPTCHA secret key is not configured. Failing verification.');
    return {
      success: false,
      status: 'error',
      message: 'reCAPTCHA secret key is not configured.'
    };
  }

  if (!token) {
    return { success: false, status: 'error', message: 'Captcha token is missing.' };
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      logger.error({ status: response.status }, 'Captcha verification request failed');
      return {
        success: false,
        status: 'error',
        message: 'Captcha verification failed due to network error.'
      };
    }

    const data = await response.json() as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      return {
        success: false,
        status: 'error',
        errorCodes: data['error-codes'],
        message: 'Captcha verification failed.'
      };
    }

    return { success: true, status: 'verified' };
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : error }, 'Captcha verification exception');
    return {
      success: false,
      status: 'error',
      message: 'Captcha verification encountered an unexpected error.'
    };
  }
}
