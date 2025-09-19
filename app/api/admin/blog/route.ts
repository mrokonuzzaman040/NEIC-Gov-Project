import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { uploadToS3, deleteFromS3, validateImageFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

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

    const formData = await request.formData();
    
    // Extract form fields
    const slug = formData.get('slug') as string;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const excerptEn = formData.get('excerptEn') as string;
    const excerptBn = formData.get('excerptBn') as string;
    const contentEn = formData.get('contentEn') as string;
    const contentBn = formData.get('contentBn') as string;
    const authorEn = formData.get('authorEn') as string;
    const authorBn = formData.get('authorBn') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const featured = formData.get('featured') === 'true';
    const isActive = formData.get('isActive') === 'true';
    const readTime = parseInt(formData.get('readTime') as string) || 5;
    const publishedAt = formData.get('publishedAt') as string;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!slug || !titleEn || !titleBn || !excerptEn || !excerptBn || !contentEn || !contentBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Validate file
    const validation = validateImageFile(file.type, file.size);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Upload file to S3 or local storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'blog');

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
        image: uploadResult.url,
        // imageKey: uploadResult.key, // TODO: Add after migration
        tags: tags || [],
        featured: featured || false,
        isActive: isActive !== undefined ? isActive : true,
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

    const formData = await request.formData();
    
    // Extract form fields
    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const excerptEn = formData.get('excerptEn') as string;
    const excerptBn = formData.get('excerptBn') as string;
    const contentEn = formData.get('contentEn') as string;
    const contentBn = formData.get('contentBn') as string;
    const authorEn = formData.get('authorEn') as string;
    const authorBn = formData.get('authorBn') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const featured = formData.get('featured') === 'true';
    const isActive = formData.get('isActive') === 'true';
    const readTime = parseInt(formData.get('readTime') as string) || 5;
    const publishedAt = formData.get('publishedAt') as string;
    const file = formData.get('file') as File;
    const existingImage = formData.get('existingImage') as string;
    const existingImageKey = formData.get('existingImageKey') as string;

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
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    let imageUrl = existingPost.image;
    // let imageKey = existingPost.imageKey; // TODO: Uncomment after migration

    // Handle file upload if new file is provided
    if (file && file.size > 0) {
      // Validate file
      const validation = validateImageFile(file.type, file.size);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Delete old image if it exists
      // TODO: Uncomment after migration
      // if (existingPost.imageKey) {
      //   try {
      //     await deleteFromS3(existingPost.imageKey);
      //   } catch (error) {
      //     console.warn('Failed to delete old image:', error);
      //   }
      // }

      // Upload new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'blog');
      
      imageUrl = uploadResult.url;
      // imageKey = uploadResult.key; // TODO: Uncomment after migration
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
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
        image: imageUrl,
        // imageKey: imageKey, // TODO: Uncomment after migration
        tags,
        featured,
        isActive,
        readTime,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        updatedBy: session.user.email,
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
