import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active blog posts for public display
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
    const featured = searchParams.get('featured');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true, // Only fetch active blog posts for public
    };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleBn: true,
          excerptEn: true,
          excerptBn: true,
          authorEn: true,
          authorBn: true,
          category: true,
          image: true,
          tags: true,
          featured: true,
          readTime: true,
          publishedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching public blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
