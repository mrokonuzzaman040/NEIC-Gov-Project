import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/crypto/hash';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: (session as any).userId },
      select: {
        id: true,
        passwordHash: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: (session as any).userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
        updatedBy: (session as any).userId,
      }
    });

    // Log the activity
    await prisma.userAuditLog.create({
      data: {
        userId: (session as any).userId,
        action: 'PASSWORD_CHANGE',
        details: 'Password changed successfully',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
