import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedSession } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/crypto/hash';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthenticatedSession();
    
    const user = await prisma.user.findUnique({
      where: { id: (session as any).user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthenticatedSession();
    
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const userId = (session as any).user.id;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 400 });
    }

    // If changing password, verify current password
    let updateData: any = {
      name,
      email,
      updatedAt: new Date(),
    };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set new password' }, { status: 400 });
      }

      // Get current user to verify password
      const currentUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Log the activity
    await prisma.userAuditLog.create({
      data: {
        userId: userId,
        action: 'PROFILE_UPDATE',
        details: `Updated profile information: name=${name}, email=${email}${newPassword ? ', password changed' : ''}`,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
