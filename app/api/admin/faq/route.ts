import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch all FAQs or single FAQ by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch single FAQ
    if (id) {
      const faq = await prisma.fAQ.findUnique({
        where: { id },
      });

      if (!faq) {
        return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
      }

      return NextResponse.json({ faq });
    }

    // Otherwise, fetch all FAQs with pagination and filters
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
        { questionEn: { contains: search, mode: 'insensitive' } },
        { questionBn: { contains: search, mode: 'insensitive' } },
        { answerEn: { contains: search, mode: 'insensitive' } },
        { answerBn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.fAQ.count({ where }),
    ]);

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      questionEn,
      questionBn,
      answerEn,
      answerBn,
      category,
      order,
      isActive,
    } = body;

    // Validate required fields
    if (!questionEn || !questionBn || !answerEn || !answerBn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        questionEn,
        questionBn,
        answerEn,
        answerBn,
        category: category || 'general',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ faq, message: 'FAQ created successfully' });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    // Check if FAQ exists
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({ faq, message: 'FAQ updated successfully' });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    // Check if FAQ exists
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
