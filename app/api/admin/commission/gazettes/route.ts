import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all gazettes or single gazette by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single gazette
    if (id) {
      const gazette = await prisma.gazette.findUnique({
        where: { id },
      });

      if (!gazette) {
        return NextResponse.json({ error: 'Gazette not found' }, { status: 404 });
      }

      return NextResponse.json({ gazette });
    }

    // Otherwise, fetch all gazettes
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleBn: { contains: search, mode: 'insensitive' } },
        { gazetteNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gazettes, total] = await Promise.all([
      prisma.gazette.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
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
    console.error('Error fetching gazettes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new gazette
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
      gazetteNumber,
      category,
      priority,
      publishedAt,
      downloadUrl,
      description,
      isActive,
    } = body;

    // Validate required fields
    if (!titleEn || !titleBn || !gazetteNumber || !downloadUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if gazette number already exists
    const existingGazette = await prisma.gazette.findUnique({
      where: { gazetteNumber },
    });

    if (existingGazette) {
      return NextResponse.json({ error: 'Gazette number already exists' }, { status: 400 });
    }

    const gazette = await prisma.gazette.create({
      data: {
        titleEn,
        titleBn,
        gazetteNumber,
        category: category || 'general',
        priority: priority || 'MEDIUM',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        downloadUrl,
        description,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ gazette, message: 'Gazette created successfully' });
  } catch (error) {
    console.error('Error creating gazette:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update gazette
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Gazette ID is required' }, { status: 400 });
    }

    // Check if gazette exists
    const existingGazette = await prisma.gazette.findUnique({
      where: { id },
    });

    if (!existingGazette) {
      return NextResponse.json({ error: 'Gazette not found' }, { status: 404 });
    }

    // If gazette number is being updated, check for uniqueness
    if (updateData.gazetteNumber && updateData.gazetteNumber !== existingGazette.gazetteNumber) {
      const numberExists = await prisma.gazette.findUnique({
        where: { gazetteNumber: updateData.gazetteNumber },
      });

      if (numberExists) {
        return NextResponse.json({ error: 'Gazette number already exists' }, { status: 400 });
      }
    }

    const gazette = await prisma.gazette.update({
      where: { id },
      data: {
        ...updateData,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : undefined,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ gazette, message: 'Gazette updated successfully' });
  } catch (error) {
    console.error('Error updating gazette:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete gazette
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gazette ID is required' }, { status: 400 });
    }

    // Check if gazette exists
    const existingGazette = await prisma.gazette.findUnique({
      where: { id },
    });

    if (!existingGazette) {
      return NextResponse.json({ error: 'Gazette not found' }, { status: 404 });
    }

    await prisma.gazette.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gazette deleted successfully' });
  } catch (error) {
    console.error('Error deleting gazette:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
