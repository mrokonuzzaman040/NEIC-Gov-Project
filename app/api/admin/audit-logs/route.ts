import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, isAuthRedirectError } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Require admin session
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    // Fetch audit logs with user information
    const [auditLogs, totalCount] = await Promise.all([
      prisma.userAuditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.userAuditLog.count({ where })
    ]);

    // Transform the data to match the expected interface
    const transformedLogs = auditLogs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.name || 'Unknown User',
      userEmail: log.user.email,
      userRole: log.user.role,
      action: log.action,
      details: log.details || '',
      ipAddress: log.ipAddress || 'Unknown',
      userAgent: log.userAgent || 'Unknown',
      createdAt: log.createdAt.toISOString()
    }));

    return NextResponse.json({
      auditLogs: transformedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    if (isAuthRedirectError(error)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
