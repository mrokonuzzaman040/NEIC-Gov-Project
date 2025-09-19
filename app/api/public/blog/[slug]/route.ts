import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch a single blog post by slug for public display
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Blog post slug is required' }, { status: 400 });
    }

    // Fetch the blog post by slug
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        isActive: true, // Only fetch active blog posts for public
      },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleBn: true,
        excerptEn: true,
        excerptBn: true,
        contentEn: true,
        contentBn: true,
        authorEn: true,
        authorBn: true,
        category: true,
        image: true,
        tags: true,
        featured: true,
        readTime: true,
        publishedAt: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Also fetch related posts (same category, different slug, limit to 3)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        category: post.category,
        slug: { not: slug },
        isActive: true,
      },
      take: 3,
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
        image: true,
        category: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({
      post,
      relatedPosts,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
