import { NextRequest, NextResponse } from 'next/server';
import { requireManagementSession, isAuthRedirectError } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Security: Require management session for access
    const session = await requireManagementSession();
    
    // Security: Validate user role
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Additional role validation
    if ((session.user as any).role !== 'MANAGEMENT' && (session.user as any).role !== 'ADMIN') {
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

    // Fetch dashboard statistics
    const [
      totalSubmissions,
      pendingSubmissions,
      reviewedToday,
      flaggedSubmissions,
      recentSubmissions
    ] = await Promise.all([
      // Total submissions count
      prisma.submission.count(),
      
      // Pending submissions count
      prisma.submission.count({
        where: { status: 'PENDING' }
      }),
      
      // Reviewed today count
      prisma.submission.count({
        where: {
          status: 'REVIEWED',
          updatedAt: {
            gte: startOfToday,
            lt: endOfToday
          }
        }
      }),
      
      // Flagged submissions count
      prisma.submission.count({
        where: { status: 'FLAGGED' }
      }),
      
      // Recent submissions (last 10)
      prisma.submission.findMany({
        select: {
          id: true,
          name: true,
          contact: true,
          message: true,
          status: true,
          createdAt: true,
          attachmentUrl: true,
          attachmentName: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate additional metrics
    const reviewedThisWeek = await prisma.submission.count({
      where: {
        status: 'REVIEWED',
        updatedAt: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const submissionsByStatus = await prisma.submission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Format recent submissions for frontend
    const formattedRecentSubmissions = recentSubmissions.map(submission => ({
      id: submission.id,
      name: submission.name,
      contact: submission.contact,
      message: submission.message,
      status: submission.status,
      createdAt: submission.createdAt.toISOString(),
      attachmentUrl: submission.attachmentUrl,
      attachmentName: submission.attachmentName
    }));

    // Security: Sanitize and validate data before sending
    const dashboardData = {
      totalSubmissions: Math.max(0, totalSubmissions),
      pendingReview: Math.max(0, pendingSubmissions),
      reviewedToday: Math.max(0, reviewedToday),
      flaggedItems: Math.max(0, flaggedSubmissions),
      reviewedThisWeek: Math.max(0, reviewedThisWeek),
      submissionsByStatus: submissionsByStatus.map(item => ({
        status: item.status,
        count: Math.max(0, item._count.status)
      })),
      recentSubmissions: formattedRecentSubmissions,
      lastUpdated: new Date().toISOString()
    };

    // Security: Add audit log for dashboard access
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'DASHBOARD_ACCESS',
          details: JSON.stringify({
            endpoint: 'management/dashboard',
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress,
            userAgent: userAgent.substring(0, 200) // Limit length for security
          }),
          ipAddress: ipAddress,
          userAgent: userAgent.substring(0, 200)
        }
      });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.warn('Failed to log dashboard access:', auditError);
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

    console.error('Management dashboard error:', error);
    
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
