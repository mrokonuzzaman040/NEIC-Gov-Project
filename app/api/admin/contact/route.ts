import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all contact information or single contact by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single contact
    if (id) {
      const contact = await prisma.contactInfo.findUnique({
        where: { id },
      });

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      return NextResponse.json({ contact });
    }

    // Otherwise, fetch all contacts with pagination and filters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { descriptionBn: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contactInfo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.contactInfo.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new contact information
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      nameEn,
      nameBn,
      descriptionEn,
      descriptionBn,
      addressEn,
      addressBn,
      phone,
      email,
      website,
      hoursEn,
      hoursBn,
      order,
      isActive,
    } = body;

    // Validate required fields
    if (!nameEn || !nameBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contact = await prisma.contactInfo.create({
      data: {
        type: type || 'OFFICE',
        nameEn,
        nameBn,
        descriptionEn,
        descriptionBn,
        addressEn,
        addressBn,
        phone,
        email,
        website,
        hoursEn,
        hoursBn,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ contact, message: 'Contact information created successfully' });
  } catch (error) {
    console.error('Error creating contact information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update contact information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // Check if contact exists
    const existingContact = await prisma.contactInfo.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact information not found' }, { status: 404 });
    }

    const contact = await prisma.contactInfo.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ contact, message: 'Contact information updated successfully' });
  } catch (error) {
    console.error('Error updating contact information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete contact information
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // Check if contact exists
    const existingContact = await prisma.contactInfo.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact information not found' }, { status: 404 });
    }

    await prisma.contactInfo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contact information deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
