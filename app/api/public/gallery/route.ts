import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active gallery items for public display (no authentication required)
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
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true, // Only fetch active gallery items for public
    };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    const [items, total, categories] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          titleEn: true,
          titleBn: true,
          descriptionEn: true,
          descriptionBn: true,
          imageUrl: true,
          category: true,
          tags: true,
          featured: true,
          publishedAt: true,
        },
      }),
      prisma.gallery.count({ where }),
      // Get unique categories for filtering
      prisma.gallery.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    return NextResponse.json({
      items,
      categories: categories.map(c => c.category),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching public gallery items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
