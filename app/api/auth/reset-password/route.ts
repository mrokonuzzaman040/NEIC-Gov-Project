import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
        used: false
      },
      include: {
        user: true
      }
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id
        }
      });

      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password
    await prisma.user.update({
      where: {
        id: resetToken.userId
      },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: {
        id: resetToken.id
      },
      data: {
        used: true
      }
    });

    // Delete all other reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        id: {
          not: resetToken.id
        }
      }
    });

    // Log the password reset
    await prisma.userAuditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        details: JSON.stringify({
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json(
      { message: 'Password has been successfully reset' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
