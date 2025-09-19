import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sliders from database
    const sliders = await prisma.slider.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform to match the expected format
    const sliderData = {
      sliderData: {
        title: {
          en: "Featured Updates",
          bn: "বিশেষ আপডেট"
        },
        description: {
          en: "Stay informed with the latest news and updates from the National Elections Inquiry Commission",
          bn: "জাতীয় নির্বাচন তদন্ত কমিশনের সর্বশেষ খবর ও আপডেটের সাথে অবগত থাকুন"
        },
        slides: sliders.map((slider: any) => ({
          id: slider.id,
          title: {
            en: slider.titleEn,
            bn: slider.titleBn
          },
          description: {
            en: slider.descriptionEn,
            bn: slider.descriptionBn
          },
          image: slider.image,
          link: slider.link,
          buttonText: {
            en: slider.buttonTextEn,
            bn: slider.buttonTextBn
          },
          category: {
            en: slider.categoryEn,
            bn: slider.categoryBn
          },
          date: slider.date.toISOString().split('T')[0],
          featured: slider.featured
        }))
      }
    };

    return NextResponse.json(sliderData);

  } catch (error) {
    console.error('Error reading slider data:', error);
    return NextResponse.json({ error: 'Failed to load slider data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      titleEn,
      titleBn,
      descriptionEn,
      descriptionBn,
      image,
      link,
      buttonTextEn,
      buttonTextBn,
      categoryEn,
      categoryBn,
      date,
      featured = false,
      order = 0
    } = await request.json();

    // Validate required fields
    if (!titleEn || !titleBn || !descriptionEn || !descriptionBn || !image || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new slider in database
    const newSlider = await prisma.slider.create({
      data: {
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        image,
        link,
        buttonTextEn,
        buttonTextBn,
        categoryEn,
        categoryBn,
        date: date ? new Date(date) : new Date(),
        featured,
        order,
        createdBy: session.user.email,
        updatedBy: session.user.email
      }
    });

    // Log the activity
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    if (user) {
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'SLIDER_CREATE',
          details: `Created new slider: ${titleEn}`,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    }

    return NextResponse.json({ 
      message: 'Slider created successfully',
      slider: newSlider 
    });

  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Slider ID is required' }, { status: 400 });
    }

    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id }
    });

    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }

    // Prepare update data with proper date conversion
    const { date, ...otherUpdateData } = updateData;
    
    // Update slider in database
    const updatedSlider = await prisma.slider.update({
      where: { id },
      data: {
        ...otherUpdateData,
        date: date ? new Date(date) : undefined,
        updatedBy: session.user.email,
        updatedAt: new Date()
      }
    });

    // Log the activity
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    if (user) {
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'SLIDER_UPDATE',
          details: `Updated slider: ${updatedSlider.titleEn}`,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    }

    return NextResponse.json({ 
      message: 'Slider updated successfully',
      slider: updatedSlider
    });

  } catch (error) {
    console.error('Error updating slider:', error);
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Slider ID is required' }, { status: 400 });
    }

    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id }
    });

    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }

    // Delete slider from database
    const deletedSlider = await prisma.slider.delete({
      where: { id }
    });

    // Log the activity
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    if (user) {
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'SLIDER_DELETE',
          details: `Deleted slider: ${deletedSlider.titleEn}`,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    }

    return NextResponse.json({ 
      message: 'Slider deleted successfully',
      slider: deletedSlider
    });

  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 });
  }
}
