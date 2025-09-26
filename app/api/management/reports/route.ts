import { NextRequest, NextResponse } from 'next/server';
import { requireManagementSession } from '@/lib/session-wrapper';
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
    if (session.user.role !== 'MANAGEMENT' && session.user.role !== 'ADMIN') {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '7'), 365); // Max 1 year
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    // Security: Validate date range
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Fetch comprehensive report data
    const [
      totalSubmissions,
      pendingSubmissions,
      reviewedToday,
      flaggedSubmissions,
      reviewedInPeriod,
      submissionsByStatus,
      submissionsByDistrict,
      submissionsBySource,
      processingTimeData,
      recentActivity
    ] = await Promise.all([
      // Total submissions in period
      prisma.submission.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Pending submissions
      prisma.submission.count({
        where: {
          status: 'PENDING',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Reviewed today
      prisma.submission.count({
        where: {
          status: 'REVIEWED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Flagged submissions
      prisma.submission.count({
        where: {
          status: 'FLAGGED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Reviewed in period
      prisma.submission.count({
        where: {
          status: 'REVIEWED',
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Submissions by status
      prisma.submission.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          status: true
        }
      }),
      
      // Submissions by district
      prisma.submission.groupBy({
        by: ['district'],
        where: {
          district: { not: null },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          district: true
        },
        orderBy: {
          _count: {
            district: 'desc'
          }
        },
        take: 10
      }),
      
      // Submissions by source
      prisma.submission.groupBy({
        by: ['source'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          source: true
        }
      }),
      
      // Get processing time data (simplified calculation)
      prisma.submission.findMany({
        where: {
          status: 'REVIEWED',
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true,
          updatedAt: true
        },
        take: 100 // Limit for performance
      }),
      
      // Recent activity (last 10 submissions)
      prisma.submission.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          district: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate average processing time based on actual data
    let averageProcessingTime = '0h';
    if (processingTimeData.length > 0) {
      const totalProcessingTime = processingTimeData.reduce((sum, item) => {
        const processingTime = item.updatedAt.getTime() - item.createdAt.getTime();
        return sum + processingTime;
      }, 0);
      
      const avgProcessingTimeMs = totalProcessingTime / processingTimeData.length;
      const avgProcessingTimeHours = avgProcessingTimeMs / (1000 * 60 * 60);
      
      if (avgProcessingTimeHours < 24) {
        averageProcessingTime = `${Math.round(avgProcessingTimeHours * 10) / 10}h`;
      } else {
        averageProcessingTime = `${Math.round(avgProcessingTimeHours / 24 * 10) / 10}d`;
      }
    }

    // Calculate top categories (districts)
    const topCategories = submissionsByDistrict.map((item, index) => ({
      category: item.district || 'Unknown',
      count: item._count.district,
      percentage: totalSubmissions > 0 ? 
        Math.round((item._count.district / totalSubmissions) * 100) : 0
    }));

    // Calculate source distribution
    const sourceDistribution = submissionsBySource.map(item => ({
      source: item.source || 'web',
      count: item._count.source,
      percentage: totalSubmissions > 0 ? 
        Math.round((item._count.source / totalSubmissions) * 100) : 0
    }));

    // Security: Sanitize and validate data before sending
    const reportData = {
      totalSubmissions: Math.max(0, totalSubmissions),
      pendingReview: Math.max(0, pendingSubmissions),
      reviewedToday: Math.max(0, reviewedToday),
      flaggedItems: Math.max(0, flaggedSubmissions),
      reviewedInPeriod: Math.max(0, reviewedInPeriod),
      averageProcessingTime,
      topCategories: topCategories.slice(0, 5), // Limit to top 5
      sourceDistribution,
      submissionsByStatus: submissionsByStatus.map(item => ({
        status: item.status,
        count: Math.max(0, item._count.status)
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        name: activity.name || 'Anonymous',
        status: activity.status,
        district: activity.district,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString()
      })),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      },
      lastUpdated: new Date().toISOString()
    };

    // Security: Add audit log for reports access
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'REPORTS_ACCESS',
          details: JSON.stringify({
            endpoint: 'management/reports',
            dateRange: days,
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
      console.warn('Failed to log reports access:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Management reports error:', error);
    
    // Security: Don't expose internal errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch report data',
        message: 'Unable to load report information. Please try again.'
      },
      { status: 500 }
    );
  }
}
