import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

// Validate PDF file for uploads
function validatePdfFile(contentType: string, fileSize: number): { isValid: boolean; error?: string } {
  if (contentType !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF files are allowed.',
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 50MB.',
    };
  }

  return { isValid: true };
}

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

    const formData = await request.formData();
    
    // Extract form fields
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const gazetteNumber = formData.get('gazetteNumber') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const publishedAt = formData.get('publishedAt') as string;
    const description = formData.get('description') as string;
    const isActive = formData.get('isActive') === 'true';
    const file = formData.get('file') as File;

    // Validate required fields
    if (!titleEn || !titleBn || !gazetteNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
    }

    // Validate file
    const validation = validatePdfFile(file.type, file.size);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if gazette number already exists
    const existingGazette = await prisma.gazette.findUnique({
      where: { gazetteNumber },
    });

    if (existingGazette) {
      return NextResponse.json({ error: 'Gazette number already exists' }, { status: 400 });
    }

    // Upload file to S3 or local storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'gazettes');

    const gazette = await prisma.gazette.create({
      data: {
        titleEn,
        titleBn,
        gazetteNumber,
        category: category || 'general',
        priority: (priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'MEDIUM',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        downloadUrl: uploadResult.url,
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

    const formData = await request.formData();
    
    // Extract form fields
    const id = formData.get('id') as string;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const gazetteNumber = formData.get('gazetteNumber') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const publishedAt = formData.get('publishedAt') as string;
    const description = formData.get('description') as string;
    const isActive = formData.get('isActive') === 'true';
    const file = formData.get('file') as File;
    const existingDownloadUrl = formData.get('existingDownloadUrl') as string;

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
    if (gazetteNumber && gazetteNumber !== existingGazette.gazetteNumber) {
      const numberExists = await prisma.gazette.findUnique({
        where: { gazetteNumber },
      });

      if (numberExists) {
        return NextResponse.json({ error: 'Gazette number already exists' }, { status: 400 });
      }
    }

    let downloadUrl = existingGazette.downloadUrl;

    // Handle file upload if new file is provided
    if (file && file.size > 0) {
      // Validate file
      const validation = validatePdfFile(file.type, file.size);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Upload new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'gazettes');
      
      downloadUrl = uploadResult.url;

      // Note: We could delete the old file here if we had the S3 key
      // This would require adding a fileKey field to the Gazette model
    }

    const gazette = await prisma.gazette.update({
      where: { id },
      data: {
        titleEn,
        titleBn,
        gazetteNumber,
        category,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        downloadUrl,
        description,
        isActive,
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
