import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { UserRole } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  createdBy: string;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
  updatedBy: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: string;
}

// Password requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function createUser(userData: CreateUserData): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Validate password
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        name: userData.name,
        passwordHash,
        role: userData.role,
        createdBy: userData.createdBy
      }
    });

    // Log user creation
    await prisma.userAuditLog.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        details: JSON.stringify({
          createdBy: userData.createdBy,
          role: userData.role,
          email: userData.email
        })
      }
    });

    return {
      success: true,
      userId: user.id
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user'
    };
  }
}

export async function updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        role: updateData.role,
        isActive: updateData.isActive,
        updatedBy: updateData.updatedBy,
        updatedAt: new Date()
      }
    });

    // Log user update
    await prisma.userAuditLog.create({
      data: {
        userId,
        action: 'USER_UPDATED',
        details: JSON.stringify({
          updatedBy: updateData.updatedBy,
          changes: updateData
        })
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: 'Failed to update user'
    };
  }
}

export async function changePassword(changeData: ChangePasswordData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: changeData.userId }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changeData.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }

    // Validate new password
    const passwordValidation = validatePassword(changeData.newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: `New password validation failed: ${passwordValidation.errors.join(', ')}`
      };
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(changeData.newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: changeData.userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });

    // Log password change
    await prisma.userAuditLog.create({
      data: {
        userId: changeData.userId,
        action: 'PASSWORD_CHANGED',
        details: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: 'Failed to change password'
    };
  }
}

export async function deactivateUser(userId: string, deactivatedBy: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedBy: deactivatedBy,
        updatedAt: new Date()
      }
    });

    // Log user deactivation
    await prisma.userAuditLog.create({
      data: {
        userId,
        action: 'USER_DEACTIVATED',
        details: JSON.stringify({
          deactivatedBy,
          timestamp: new Date().toISOString()
        })
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deactivating user:', error);
    return {
      success: false,
      error: 'Failed to deactivate user'
    };
  }
}

export async function getUsers(page: number = 1, limit: number = 20, role?: UserRole) {
  const skip = (page - 1) * limit;
  
  const where = role ? { role } : {};
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true
    }
  });
}

export async function getUserAuditLogs(userId: string, page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    prisma.userAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.userAuditLog.count({ where: { userId } })
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
