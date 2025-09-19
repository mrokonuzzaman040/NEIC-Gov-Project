import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all commission officials or single official by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single official
    if (id) {
      const official = await prisma.commissionOfficial.findUnique({
        where: { id },
      });

      if (!official) {
        return NextResponse.json({ error: 'Commission official not found' }, { status: 404 });
      }

      return NextResponse.json({ official });
    }

    // Otherwise, fetch all officials
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
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search, mode: 'insensitive' } },
        { positionEn: { contains: search, mode: 'insensitive' } },
        { positionBn: { contains: search, mode: 'insensitive' } },
        { departmentEn: { contains: search, mode: 'insensitive' } },
        { departmentBn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [officials, total] = await Promise.all([
      prisma.commissionOfficial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.commissionOfficial.count({ where }),
    ]);

    return NextResponse.json({
      officials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching commission officials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new commission official
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nameEn,
      nameBn,
      positionEn,
      positionBn,
      departmentEn,
      departmentBn,
      descriptionEn,
      descriptionBn,
      email,
      phone,
      experienceEn,
      experienceBn,
      qualificationEn,
      qualificationBn,
      image,
      category,
      order,
      isActive,
    } = body;

    // Validate required fields
    if (!nameEn || !nameBn || !positionEn || !positionBn || !departmentEn || !departmentBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const official = await prisma.commissionOfficial.create({
      data: {
        nameEn,
        nameBn,
        positionEn,
        positionBn,
        departmentEn,
        departmentBn,
        descriptionEn,
        descriptionBn,
        email,
        phone,
        experienceEn,
        experienceBn,
        qualificationEn,
        qualificationBn,
        image,
        category: category || 'SECRETARIAT',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ official, message: 'Commission official created successfully' });
  } catch (error) {
    console.error('Error creating commission official:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update commission official
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Official ID is required' }, { status: 400 });
    }

    // Check if official exists
    const existingOfficial = await prisma.commissionOfficial.findUnique({
      where: { id },
    });

    if (!existingOfficial) {
      return NextResponse.json({ error: 'Commission official not found' }, { status: 404 });
    }

    const official = await prisma.commissionOfficial.update({
      where: { id },
      data: {
        ...updateData,
        order: updateData.order ? parseInt(updateData.order) : undefined,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ official, message: 'Commission official updated successfully' });
  } catch (error) {
    console.error('Error updating commission official:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete commission official
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Official ID is required' }, { status: 400 });
    }

    // Check if official exists
    const existingOfficial = await prisma.commissionOfficial.findUnique({
      where: { id },
    });

    if (!existingOfficial) {
      return NextResponse.json({ error: 'Commission official not found' }, { status: 404 });
    }

    await prisma.commissionOfficial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Commission official deleted successfully' });
  } catch (error) {
    console.error('Error deleting commission official:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
