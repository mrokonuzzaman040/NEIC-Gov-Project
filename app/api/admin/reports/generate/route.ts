import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireManagementSession } from '@/lib/session-wrapper';

export async function GET(req: NextRequest) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch submissions data
    const submissions = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        message: true,
        status: true,
        locale: true,
        createdAt: true,
        attachmentName: true,
        attachmentSize: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      // Generate CSV content
      const headers = [
        'ID',
        'Name',
        'Contact',
        'Email',
        'Message',
        'Status',
        'Language',
        'Submitted Date',
        'Has Attachment',
        'Attachment Size'
      ];

      const csvRows = [
        headers.join(','),
        ...submissions.map(submission => [
          `"${submission.id}"`,
          `"${submission.name || 'Anonymous'}"`,
          `"${submission.contact}"`,
          `"${submission.email || ''}"`,
          `"${submission.message.replace(/"/g, '""')}"`, // Escape quotes
          `"${submission.status}"`,
          `"${submission.locale}"`,
          `"${submission.createdAt.toISOString()}"`,
          `"${submission.attachmentName ? 'Yes' : 'No'}"`,
          `"${submission.attachmentSize ? `${(submission.attachmentSize / 1024).toFixed(2)} KB` : ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const filename = `management-report-${days}days-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // For now, only CSV is supported
    return NextResponse.json(
      { error: 'Unsupported format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
