import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all notices or single notice by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single notice
    if (id) {
      const notice = await prisma.notice.findUnique({
        where: { id },
      });

      if (!notice) {
        return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
      }

      return NextResponse.json({ notice });
    }

    // Otherwise, fetch all notices with pagination and filters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit to show more items
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleBn: { contains: search, mode: 'insensitive' } },
        { contentEn: { contains: search, mode: 'insensitive' } },
        { contentBn: { contains: search, mode: 'insensitive' } },
      ];
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
      }),
      prisma.notice.count({ where }),
    ]);

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new notice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      titleEn,
      titleBn,
      contentEn,
      contentBn,
      type,
      priority,
      category,
      publishedAt,
      expiresAt,
      isActive,
      isPinned,
      attachments,
    } = body;

    // Validate required fields
    if (!titleEn || !titleBn || !contentEn || !contentBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        titleEn,
        titleBn,
        contentEn,
        contentBn,
        type: type || 'INFORMATION',
        priority: priority || 'MEDIUM',
        category: category || 'general',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true,
        isPinned: isPinned || false,
        attachments: attachments || [],
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ notice, message: 'Notice created successfully' });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update notice
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.email,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : undefined,
        expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined,
      },
    });

    return NextResponse.json({ notice, message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete notice
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    await prisma.notice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
