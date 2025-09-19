import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all blog posts or single post by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single post
    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id },
      });

      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      return NextResponse.json({ post });
    }

    // Otherwise, fetch all posts with pagination and filters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleBn: { contains: search, mode: 'insensitive' } },
        { excerptEn: { contains: search, mode: 'insensitive' } },
        { excerptBn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
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
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      titleEn,
      titleBn,
      excerptEn,
      excerptBn,
      contentEn,
      contentBn,
      authorEn,
      authorBn,
      category,
      image,
      tags,
      featured,
      readTime,
      publishedAt,
    } = body;

    // Validate required fields
    if (!slug || !titleEn || !titleBn || !excerptEn || !excerptBn || !contentEn || !contentBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        titleEn,
        titleBn,
        excerptEn,
        excerptBn,
        contentEn,
        contentBn,
        authorEn: authorEn || 'Election Commission',
        authorBn: authorBn || 'নির্বাচন কমিশন',
        category: category || 'general',
        image: image || '/blog-images/placeholder.svg',
        tags: tags || [],
        featured: featured || false,
        readTime: readTime || 5,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ post, message: 'Blog post created successfully' });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update blog post
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // If slug is being updated, check for uniqueness
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.email,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : undefined,
      },
    });

    return NextResponse.json({ post, message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
