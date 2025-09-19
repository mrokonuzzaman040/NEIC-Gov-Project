import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all commission terms or single term by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single term
    if (id) {
      const term = await prisma.commissionTerm.findUnique({
        where: { id },
      });

      if (!term) {
        return NextResponse.json({ error: 'Commission term not found' }, { status: 404 });
      }

      return NextResponse.json({ term });
    }

    // Otherwise, fetch all terms
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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
        { section: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [terms, total] = await Promise.all([
      prisma.commissionTerm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.commissionTerm.count({ where }),
    ]);

    return NextResponse.json({
      terms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching commission terms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new commission term
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
      descriptionEn,
      descriptionBn,
      category,
      section,
      order,
      effectiveFrom,
      effectiveTo,
      isActive,
    } = body;

    // Validate required fields
    if (!titleEn || !titleBn || !descriptionEn || !descriptionBn || !section || !effectiveFrom) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const term = await prisma.commissionTerm.create({
      data: {
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        category: category || 'general',
        section,
        order: order || 0,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ term, message: 'Commission term created successfully' });
  } catch (error) {
    console.error('Error creating commission term:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update commission term
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Term ID is required' }, { status: 400 });
    }

    // Check if term exists
    const existingTerm = await prisma.commissionTerm.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      return NextResponse.json({ error: 'Commission term not found' }, { status: 404 });
    }

    const term = await prisma.commissionTerm.update({
      where: { id },
      data: {
        ...updateData,
        order: updateData.order ? parseInt(updateData.order) : undefined,
        effectiveFrom: updateData.effectiveFrom ? new Date(updateData.effectiveFrom) : undefined,
        effectiveTo: updateData.effectiveTo ? new Date(updateData.effectiveTo) : undefined,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ term, message: 'Commission term updated successfully' });
  } catch (error) {
    console.error('Error updating commission term:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete commission term
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Term ID is required' }, { status: 400 });
    }

    // Check if term exists
    const existingTerm = await prisma.commissionTerm.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      return NextResponse.json({ error: 'Commission term not found' }, { status: 404 });
    }

    await prisma.commissionTerm.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Commission term deleted successfully' });
  } catch (error) {
    console.error('Error deleting commission term:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
