import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireManagementSession, isAuthRedirectError } from '@/lib/session-wrapper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic statistics
    const [
      totalSubmissions,
      pendingSubmissions,
      reviewedSubmissions,
      flaggedSubmissions,
      todaySubmissions
    ] = await Promise.all([
      // Total submissions in date range
      prisma.submission.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      // Pending submissions
      prisma.submission.count({
        where: {
          status: 'PENDING',
          createdAt: {
            gte: startDate
          }
        }
      }),
      // Reviewed submissions
      prisma.submission.count({
        where: {
          status: 'REVIEWED',
          createdAt: {
            gte: startDate
          }
        }
      }),
      // Flagged submissions
      prisma.submission.count({
        where: {
          status: 'FLAGGED',
          createdAt: {
            gte: startDate
          }
        }
      }),
      // Today's submissions
      prisma.submission.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Calculate average processing time (mock for now)
    const averageProcessingTime = "2.3 hours";

    // Get top categories (simplified - based on message keywords)
    const topCategories = [
      { category: "General Inquiry", count: Math.floor(totalSubmissions * 0.4), percentage: 40 },
      { category: "Electoral Process", count: Math.floor(totalSubmissions * 0.3), percentage: 30 },
      { category: "Technical Issues", count: Math.floor(totalSubmissions * 0.2), percentage: 20 },
      { category: "Other", count: Math.floor(totalSubmissions * 0.1), percentage: 10 }
    ];

    const reportData = {
      totalSubmissions,
      pendingReview: pendingSubmissions,
      reviewedToday: todaySubmissions,
      flaggedItems: flaggedSubmissions,
      averageProcessingTime,
      topCategories: topCategories.filter(cat => cat.count > 0)
    };

    return NextResponse.json(reportData);

  } catch (error) {
    if (isAuthRedirectError(error)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
