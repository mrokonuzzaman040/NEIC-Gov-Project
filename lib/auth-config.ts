import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';

// Security configurations
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 8 * 60 * 60; // 8 hours

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: SESSION_DURATION
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const clientIp = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown';
        
        // Check rate limiting (skip in development mode)
        if (process.env.NODE_ENV !== 'development') {
          const attempts = loginAttempts.get(credentials.email);
          if (attempts) {
            if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
              const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
              if (timeSinceLastAttempt < LOCKOUT_TIME) {
                throw new Error('Too many login attempts. Please try again later.');
              } else {
                // Reset attempts after lockout period
                loginAttempts.delete(credentials.email);
              }
            }
          }
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase(),
              isActive: true
            }
          });

          if (!user) {
            // Record failed attempt (skip in development mode)
            if (process.env.NODE_ENV !== 'development') {
              const currentAttempts = loginAttempts.get(credentials.email) || { count: 0, lastAttempt: 0 };
              loginAttempts.set(credentials.email, {
                count: currentAttempts.count + 1,
                lastAttempt: Date.now()
              });
            }
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValidPassword) {
            // Record failed attempt (skip in development mode)
            if (process.env.NODE_ENV !== 'development') {
              const currentAttempts = loginAttempts.get(credentials.email) || { count: 0, lastAttempt: 0 };
              loginAttempts.set(credentials.email, {
                count: currentAttempts.count + 1,
                lastAttempt: Date.now()
              });
            }
            return null;
          }

          // Clear login attempts on successful login
          loginAttempts.delete(credentials.email);

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });

          // Log successful login
          await prisma.userAuditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN_SUCCESS',
              details: JSON.stringify({ ipAddress: clientIp }),
              ipAddress: clientIp as string,
              userAgent: req?.headers?.['user-agent'] || 'unknown'
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.isActive = (user as any).isActive;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).role = token.role;
        (session as any).isActive = token.isActive;
        (session as any).userId = token.userId;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Additional security checks can be added here
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=AuthenticationError'
  },
  events: {
    async signOut({ token }) {
      // Log logout
      if (token?.userId) {
        try {
          await prisma.userAuditLog.create({
            data: {
              userId: token.userId as string,
              action: 'LOGOUT',
              details: JSON.stringify({ timestamp: new Date().toISOString() })
            }
          });
        } catch (error) {
          console.error('Error logging logout:', error);
        }
      }
    }
  }
};

// Helper function to check user permissions
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Partial<Record<UserRole, number>> = {
    [UserRole.SUPPORT]: 1,
    [UserRole.MANAGEMENT]: 2,
    [UserRole.ADMIN]: 3
  };
  
  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];
  
  // If role is not in hierarchy, deny access
  if (userLevel === undefined || requiredLevel === undefined) {
    return false;
  }
  
  return userLevel >= requiredLevel;
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole, locale: 'en' | 'bn' = 'en'): string {
  const roleNames: Partial<Record<UserRole, { en: string; bn: string }>> = {
    [UserRole.ADMIN]: { en: 'Administrator', bn: 'প্রশাসক' },
    [UserRole.MANAGEMENT]: { en: 'Management', bn: 'ব্যবস্থাপনা' },
    [UserRole.SUPPORT]: { en: 'Support Staff', bn: 'সহায়তা কর্মী' }
  };
  
  return roleNames[role]?.[locale] || role;
}
