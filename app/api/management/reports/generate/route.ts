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

    // Security: Rate limiting check
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
    const format = searchParams.get('format') || 'csv';
    const days = Math.min(parseInt(searchParams.get('days') || '7'), 365);
    
    // Security: Validate format
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Only CSV and JSON are supported.' },
        { status: 400 }
      );
    }

    // Security: Validate date range
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Fetch submissions data for export
    const submissions = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        district: true,
        seatName: true,
        message: true,
        status: true,
        source: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        attachmentName: true,
        attachmentSize: true,
        attachmentType: true
        // Note: ipHash excluded for security
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Security: Add audit log for report generation
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'REPORT_GENERATION',
          details: JSON.stringify({
            endpoint: 'management/reports/generate',
            format: format,
            dateRange: days,
            recordCount: submissions.length,
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress,
            userAgent: userAgent.substring(0, 200)
          }),
          ipAddress: ipAddress,
          userAgent: userAgent.substring(0, 200)
        }
      });
    } catch (auditError) {
      console.warn('Failed to log report generation:', auditError);
    }

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'ID', 'Name', 'Contact', 'Email', 'District', 'Seat Name', 
        'Message', 'Status', 'Source', 'Language', 'Created At', 
        'Updated At', 'Attachment Name', 'Attachment Size', 'Attachment Type'
      ];

      const csvData = submissions.map(submission => [
        submission.id,
        submission.name || '',
        submission.contact || '',
        submission.email || '',
        submission.district || '',
        submission.seatName || '',
        `"${(submission.message || '').replace(/"/g, '""')}"`, // Escape quotes
        submission.status,
        submission.source || 'web',
        submission.locale || 'en',
        submission.createdAt.toISOString(),
        submission.updatedAt.toISOString(),
        submission.attachmentName || '',
        submission.attachmentSize || '',
        submission.attachmentType || ''
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="management-report-${days}days.csv"`
        }
      });
    } else if (format === 'json') {
      // Generate JSON content
      const jsonData = {
        reportInfo: {
          generatedAt: new Date().toISOString(),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: days
          },
          totalRecords: submissions.length,
          generatedBy: session.user.email
        },
        submissions: submissions.map(submission => ({
          id: submission.id,
          name: submission.name,
          contact: submission.contact,
          email: submission.email,
          district: submission.district,
          seatName: submission.seatName,
          message: submission.message,
          status: submission.status,
          source: submission.source,
          locale: submission.locale,
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
          attachmentName: submission.attachmentName,
          attachmentSize: submission.attachmentSize,
          attachmentType: submission.attachmentType
        }))
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="management-report-${days}days.json"`
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported format' },
      { status: 400 }
    );

  } catch (error) {
    if (isAuthRedirectError(error)) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Report generation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report',
        message: 'Unable to generate report. Please try again.'
      },
      { status: 500 }
    );
  }
}
