import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active notices for public display
export async function GET(request: NextRequest) {
  try {
    // Handle dynamic server usage during static generation
    let searchParams;
    try {
      searchParams = request.nextUrl.searchParams;
    } catch (error) {
      // During static generation, use default values
      if (error instanceof Error && error.message.includes('Dynamic server usage')) {
        searchParams = new URLSearchParams();
      } else {
        throw error;
      }
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true, // Only fetch active notices for public
    };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          titleEn: true,
          titleBn: true,
          contentEn: true,
          contentBn: true,
          type: true,
          priority: true,
          category: true,
          publishedAt: true,
          expiresAt: true,
          isPinned: true,
          attachments: true,
        },
      }),
      prisma.notice.count({ where }),
    ]);

    // Filter out expired notices
    const activeNotices = notices.filter(notice => {
      if (!notice.expiresAt) return true;
      return new Date(notice.expiresAt) > new Date();
    });

    return NextResponse.json({
      notices: activeNotices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching public notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
