import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { redirect } from 'next/navigation';

function isRedirectErrorDigest(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('NEXT_REDIRECT');
}

/**
 * Wrapper for getServerSession that handles JWT decryption errors gracefully
 * This prevents the application from crashing when NEXTAUTH_SECRET changes
 */
export async function getServerSessionSafe() {
  try {
    return await getServerSession(authOptions);
  } catch (error: any) {
    // Check if it's a dynamic server usage error during static generation
    if (error?.message?.includes('Dynamic server usage')) {
      // During static generation, return null instead of throwing
      return null;
    }
    
    // Log the error for debugging
    console.error('JWT session error caught by wrapper:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines only
    });
    
    // Check if it's a JWT decryption error
    if (error?.name === 'JWEDecryptionFailed' || 
        error?.message?.includes('decryption operation failed') ||
        error?.message?.includes('JWT')) {
      // Clear session cookies and redirect to signin
      redirect('/api/auth/clear-session?redirect=/bn/login');
    }
    
    // For other errors, re-throw
    throw error;
  }
}

/**
 * Check if user has admin role safely
 */
export async function requireAdminSession() {
  const session = await getServerSessionSafe();
  
  // CRITICAL: Immediate redirect for unauthenticated users
  if (!session) {
    redirect('/bn/login?error=AuthenticationRequired');
  }
  
  // Check if user is active
  if (!(session as any).user?.isActive) {
    redirect('/bn/login?error=AccountDeactivated');
  }
  
  // Check admin role
  if ((session as any).user?.role !== 'ADMIN') {
    redirect('/admin/unauthorized');
  }
  
  return session;
}

/**
 * Type guard for redirect errors thrown by Next's redirect() helper
 */
export function isAuthRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;
  return isRedirectErrorDigest(digest);
}

/**
 * Check if user has management or admin role safely
 */
export async function requireManagementSession() {
  const session = await getServerSessionSafe();
  
  // CRITICAL: Immediate redirect for unauthenticated users
  if (!session) {
    redirect('/bn/login?error=AuthenticationRequired');
  }
  
  // Check if user is active
  if (!(session as any).user?.isActive) {
    redirect('/bn/login?error=AccountDeactivated');
  }
  
  // Check management or admin role
  if (!['ADMIN', 'MANAGEMENT'].includes((session as any).user?.role)) {
    redirect('/admin/unauthorized');
  }
  
  return session;
}

/**
 * Check if user has support role or higher
 */
export async function requireSupportSession() {
  const session = await getServerSessionSafe();
  
  // CRITICAL: Immediate redirect for unauthenticated users
  if (!session) {
    redirect('/bn/login?error=AuthenticationRequired');
  }
  
  // Check if user is active
  if (!(session as any).user?.isActive) {
    redirect('/bn/login?error=AccountDeactivated');
  }
  
  // Check support, management, or admin role
  if (!['ADMIN', 'MANAGEMENT', 'SUPPORT'].includes((session as any).user?.role)) {
    redirect('/admin/unauthorized');
  }
  
  return session;
}

/**
 * Check if user has any authenticated role
 */
export async function requireAuthenticatedSession() {
  const session = await getServerSessionSafe();
  
  // CRITICAL: Immediate redirect for unauthenticated users
  if (!session) {
    redirect('/bn/login?error=AuthenticationRequired');
  }
  
  // Check if user is active
  if (!(session as any).user?.isActive) {
    redirect('/bn/login?error=AccountDeactivated');
  }
  
  // Check any authenticated role
  if (!['ADMIN', 'MANAGEMENT', 'SUPPORT'].includes((session as any).user?.role)) {
    redirect('/admin/unauthorized');
  }
  
  return session;
}

/**
 * Get session without throwing errors - returns null if session is invalid
 */
export async function getSessionOrNull() {
  try {
    return await getServerSession(authOptions);
  } catch (error: any) {
    // During static generation, just return null silently
    if (error?.message?.includes('Dynamic server usage')) {
      return null;
    }
    
    console.error('Session error (returning null):', error?.name || error?.message);
    return null;
  }
}
