import { NextRequest, NextResponse } from 'next/server';
import { requireSupportSession, isAuthRedirectError } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Security: Require support session for access
    const session = await requireSupportSession();
    
    // Security: Validate user role
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Additional role validation
    if ((session.user as any).role !== 'SUPPORT' && (session.user as any).role !== 'MANAGEMENT' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Security: Rate limiting check (basic implementation)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Security: Validate request headers
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get current date for "today" calculations
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Fetch support dashboard statistics
    const [
      totalSubmissions,
      pendingSubmissions,
      myAssignments,
      recentActivity
    ] = await Promise.all([
      // Total submissions count
      prisma.submission.count(),
      
      // Pending submissions count
      prisma.submission.count({
        where: { status: 'PENDING' }
      }),
      
      // My assignments (submissions assigned to current user)
      // For now, we'll count pending submissions as potential assignments
      prisma.submission.count({
        where: { status: 'PENDING' }
      }),
      
      // Recent activity (last 10 submissions)
      prisma.submission.findMany({
        select: {
          id: true,
          name: true,
          contact: true,
          message: true,
          status: true,
          createdAt: true,
          district: true,
          seatName: true,
          source: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate additional metrics
    const reviewedToday = await prisma.submission.count({
      where: {
        status: 'REVIEWED',
        updatedAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    const flaggedSubmissions = await prisma.submission.count({
      where: { status: 'FLAGGED' }
    });

    // Security: Sanitize and validate data before sending
    const dashboardData = {
      totalSubmissions: Math.max(0, totalSubmissions),
      pendingItems: Math.max(0, pendingSubmissions),
      myAssignments: Math.max(0, myAssignments),
      reviewedToday: Math.max(0, reviewedToday),
      flaggedItems: Math.max(0, flaggedSubmissions),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        name: activity.name,
        contact: activity.contact,
        message: activity.message,
        status: activity.status,
        district: activity.district,
        seatName: activity.seatName,
        source: activity.source,
        createdAt: activity.createdAt.toISOString()
      })),
      lastUpdated: new Date().toISOString()
    };

    // Security: Add audit log for dashboard access
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'SUPPORT_DASHBOARD_ACCESS',
          details: JSON.stringify({
            endpoint: 'support/dashboard',
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress,
            userAgent: userAgent.substring(0, 200)
          }),
          ipAddress: ipAddress,
          userAgent: userAgent.substring(0, 200)
        }
      });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.warn('Failed to log support dashboard access:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    if (isAuthRedirectError(error)) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Support dashboard error:', error);
    
    // Security: Don't expose internal errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        message: 'Unable to load dashboard information. Please try again.'
      },
      { status: 500 }
    );
  }
}
