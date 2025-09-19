import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { redirect } from 'next/navigation';

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
      redirect('/api/auth/clear-session?redirect=/admin/login');
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
  
  if (!session || (session as any).user?.role !== 'ADMIN') {
    redirect('/api/auth/signin');
  }
  
  return session;
}

/**
 * Check if user has management or admin role safely
 */
export async function requireManagementSession() {
  const session = await getServerSessionSafe();
  
  if (!session || 
      !['ADMIN', 'MANAGEMENT'].includes((session as any).user?.role)) {
    redirect('/api/auth/signin');
  }
  
  return session;
}

/**
 * Check if user has any authenticated role
 */
export async function requireAuthenticatedSession() {
  const session = await getServerSessionSafe();
  
  if (!session || 
      !['ADMIN', 'MANAGEMENT', 'SUPPORT'].includes((session as any).user?.role)) {
    redirect('/api/auth/signin');
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
