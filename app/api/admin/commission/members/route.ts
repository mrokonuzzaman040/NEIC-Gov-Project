import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all commission members or single member by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single member
    if (id) {
      const member = await prisma.commissionMember.findUnique({
        where: { id },
      });

      if (!member) {
        return NextResponse.json({ error: 'Commission member not found' }, { status: 404 });
      }

      return NextResponse.json({ member });
    }

    // Otherwise, fetch all members
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name_english: { contains: search, mode: 'insensitive' } },
        { name_bengali: { contains: search, mode: 'insensitive' } },
        { designation_english: { contains: search, mode: 'insensitive' } },
        { designation_bengali: { contains: search, mode: 'insensitive' } },
        { department_english: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.commissionMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { serial_no: 'asc' },
      }),
      prisma.commissionMember.count({ where }),
    ]);

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching commission members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new commission member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serial_no,
      name_english,
      name_bengali,
      role_type,
      designation_english,
      designation_bengali,
      department_english,
      department_bengali,
      image,
      email,
      phone,
      description_english,
      description_bengali,
      isActive,
    } = body;

    // Validate required fields
    if (!name_english || !name_bengali || !designation_english || !designation_bengali || !serial_no) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if serial number already exists for the same role type
    const existingMember = await prisma.commissionMember.findFirst({
      where: { 
        serial_no: parseInt(serial_no),
        role_type: role_type || 'commission_member'
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Serial number already exists for this role type' }, { status: 400 });
    }

    const member = await prisma.commissionMember.create({
      data: {
        serial_no: serial_no || 1,
        name_english,
        name_bengali,
        role_type: role_type || 'commission_member',
        designation_english,
        designation_bengali,
        department_english,
        department_bengali,
        image,
        email,
        phone,
        description_english,
        description_bengali,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ member, message: 'Commission member created successfully' });
  } catch (error) {
    console.error('Error creating commission member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update commission member
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Check if member exists
    const existingMember = await prisma.commissionMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Commission member not found' }, { status: 404 });
    }

    // If serial number is being updated, check for uniqueness
    if (updateData.serial_no && updateData.serial_no !== existingMember.serial_no) {
      const serialExists = await prisma.commissionMember.findFirst({
        where: { 
          serial_no: parseInt(updateData.serial_no),
          role_type: updateData.role_type || existingMember.role_type
        },
      });

      if (serialExists) {
        return NextResponse.json({ error: 'Serial number already exists for this role type' }, { status: 400 });
      }
    }

    const member = await prisma.commissionMember.update({
      where: { id },
      data: {
        ...updateData,
        serial_no: updateData.serial_no ? parseInt(updateData.serial_no) : undefined,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ member, message: 'Commission member updated successfully' });
  } catch (error) {
    console.error('Error updating commission member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete commission member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Check if member exists
    const existingMember = await prisma.commissionMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Commission member not found' }, { status: 404 });
    }

    await prisma.commissionMember.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Commission member deleted successfully' });
  } catch (error) {
    console.error('Error deleting commission member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
