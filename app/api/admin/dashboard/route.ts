import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminSession();

    // Get real data from database
    const [
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      activeUsers,
      recentSubmissions,
      recentUserLogins
    ] = await Promise.all([
      // Total submissions count
      prisma.submission.count(),
      
      // Pending submissions count
      prisma.submission.count({
        where: { status: 'PENDING' }
      }),
      
      // Approved submissions count
      prisma.submission.count({
        where: { status: 'APPROVED' }
      }),
      
      // Active users count
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Recent submissions (last 5)
      prisma.submission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true
        }
      }),
      
      // Recent user logins (last 5)
      prisma.userAuditLog.findMany({
        take: 5,
        where: { action: 'LOGIN_SUCCESS' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    // Calculate changes (comparing with last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [lastWeekSubmissions, lastWeekUsers] = await Promise.all([
      prisma.submission.count({
        where: {
          createdAt: {
            gte: oneWeekAgo,
            lt: new Date()
          }
        }
      }),
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: {
            gte: oneWeekAgo,
            lt: new Date()
          }
        }
      })
    ]);

    const submissionChange = lastWeekSubmissions > 0 ? `+${lastWeekSubmissions} from last week` : 'No change';
    const userChange = lastWeekUsers > 0 ? `+${lastWeekUsers} new user${lastWeekUsers > 1 ? 's' : ''}` : 'No change';

    // Build activities from real data
    const activities = [
      ...recentSubmissions.map(submission => ({
        id: submission.id,
        type: 'submission',
        action: 'New Submission',
        description: `${submission.name || 'Anonymous'} submitted a new form`,
        timestamp: submission.createdAt.toLocaleString(),
        status: 'success'
      })),
      ...recentUserLogins.map(login => ({
        id: login.id,
        type: 'user',
        action: 'User Login',
        description: `${login.user?.name || 'User'} logged in successfully`,
        timestamp: login.createdAt.toLocaleString(),
        status: 'success'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    const dashboardData = {
      stats: {
        totalSubmissions: {
          value: totalSubmissions.toString(),
          change: submissionChange,
          changeType: lastWeekSubmissions > 0 ? 'positive' as const : 'neutral' as const
        },
        pendingReview: {
          value: pendingSubmissions.toString(),
          change: 'No change',
          changeType: 'neutral' as const
        },
        approved: {
          value: approvedSubmissions.toString(),
          change: 'No change',
          changeType: 'neutral' as const
        },
        activeUsers: {
          value: activeUsers.toString(),
          change: userChange,
          changeType: lastWeekUsers > 0 ? 'positive' as const : 'neutral' as const
        }
      },
      activities
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}