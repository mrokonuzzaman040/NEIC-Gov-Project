import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { uploadToS3, deleteFromS3, validateImageFile } from '@/lib/s3';

// GET - Fetch all gallery items (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !['ADMIN', 'MANAGEMENT'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { descriptionBn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { publishedAt: 'desc' },
        ],
      }),
      prisma.gallery.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new gallery item with image upload (admin/management only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !['ADMIN', 'MANAGEMENT'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionBn = formData.get('descriptionBn') as string;
    const category = formData.get('category') as string || 'general';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const featured = formData.get('featured') === 'true';
    const order = parseInt(formData.get('order') as string || '0');

    // Validation
    if (!file || !titleEn || !titleBn) {
      return NextResponse.json({ 
        error: 'File, English title, and Bengali title are required' 
      }, { status: 400 });
    }

    // Validate file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const validation = validateImageFile(file.type, fileBuffer.length);
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload to S3
    const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'gallery');

    // Save to database
    const newItem = await prisma.gallery.create({
      data: {
        titleEn,
        titleBn,
        descriptionEn: descriptionEn || null,
        descriptionBn: descriptionBn || null,
        imageUrl: uploadResult.url,
        imageKey: uploadResult.key,
        category,
        tags,
        featured,
        order,
        createdBy: session.user.email,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update gallery item (admin/management only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !['ADMIN', 'MANAGEMENT'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const file = formData.get('file') as File | null;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionBn = formData.get('descriptionBn') as string;
    const category = formData.get('category') as string || 'general';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const featured = formData.get('featured') === 'true';
    const order = parseInt(formData.get('order') as string || '0');

    if (!id || !titleEn || !titleBn) {
      return NextResponse.json({ 
        error: 'ID, English title, and Bengali title are required' 
      }, { status: 400 });
    }

    // Check if item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    let imageUrl = existingItem.imageUrl;
    let imageKey = existingItem.imageKey;

    // Handle new file upload
    if (file && file.size > 0) {
      // Validate new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const validation = validateImageFile(file.type, fileBuffer.length);
      
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Delete old file from S3
      try {
        await deleteFromS3(existingItem.imageKey);
      } catch (error) {
        console.warn('Could not delete old file from S3:', error);
      }

      // Upload new file
      const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'gallery');
      imageUrl = uploadResult.url;
      imageKey = uploadResult.key;
    }

    // Update database
    const updatedItem = await prisma.gallery.update({
      where: { id },
      data: {
        titleEn,
        titleBn,
        descriptionEn: descriptionEn || null,
        descriptionBn: descriptionBn || null,
        imageUrl,
        imageKey,
        category,
        tags,
        featured,
        order,
        updatedBy: session.user.email,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete gallery item (admin/management only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !['ADMIN', 'MANAGEMENT'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    // Check if item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Delete file from S3
    try {
      await deleteFromS3(existingItem.imageKey);
    } catch (error) {
      console.warn('Could not delete file from S3:', error);
    }

    // Delete from database
    await prisma.gallery.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
