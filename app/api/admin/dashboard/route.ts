import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session-wrapper';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminSession();

    // Return mock dashboard data
    const dashboardData = {
      stats: {
        totalSubmissions: {
          value: '3',
          change: '+2 from last week',
          changeType: 'positive' as const
        },
        pendingReview: {
          value: '3',
          change: 'No change',
          changeType: 'neutral' as const
        },
        approved: {
          value: '0',
          change: 'No change',
          changeType: 'neutral' as const
        },
        activeUsers: {
          value: '3',
          change: '+1 new user',
          changeType: 'positive' as const
        }
      },
      activities: [
        {
          id: '1',
          type: 'submission',
          action: 'New Submission',
          description: 'John Doe submitted a new form with attachment',
          timestamp: new Date().toLocaleString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'user',
          action: 'User Login',
          description: 'Manager logged in successfully',
          timestamp: new Date(Date.now() - 3600000).toLocaleString(),
          status: 'success'
        }
      ]
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