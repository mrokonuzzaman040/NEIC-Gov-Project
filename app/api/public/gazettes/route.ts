import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active gazettes for public display
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
      isActive: true, // Only fetch active gazettes for public
    };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    const [gazettes, total] = await Promise.all([
      prisma.gazette.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          titleBn: true,
          gazetteNumber: true,
          category: true,
          priority: true,
          publishedAt: true,
          downloadUrl: true,
          description: true,
        },
      }),
      prisma.gazette.count({ where }),
    ]);

    return NextResponse.json({
      gazettes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching public gazettes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
