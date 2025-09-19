import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireManagementSession } from '@/lib/session-wrapper';

export async function GET(req: NextRequest) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        message: true,
        locale: true,
        status: true,
        createdAt: true,
        attachmentUrl: true,
        attachmentKey: true,
        attachmentName: true,
        attachmentSize: true,
        attachmentType: true,
      }
    });

    // Get total count
    const total = await prisma.submission.count({ where });

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
