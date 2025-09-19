import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { uploadToS3, deleteFromS3, validateImageFile } from '@/lib/s3';

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

    const formData = await request.formData();
    
    // Extract form fields
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionBn = formData.get('descriptionBn') as string;
    const link = formData.get('link') as string;
    const buttonTextEn = formData.get('buttonTextEn') as string;
    const buttonTextBn = formData.get('buttonTextBn') as string;
    const categoryEn = formData.get('categoryEn') as string;
    const categoryBn = formData.get('categoryBn') as string;
    const featured = formData.get('featured') === 'true';
    const order = parseInt(formData.get('order') as string) || 0;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!titleEn || !titleBn || !descriptionEn || !descriptionBn || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Validate file
    const validation = validateImageFile(file.type, file.size);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload file to S3 or local storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'slider');

    // Create new slider in database
    const newSlider = await prisma.slider.create({
      data: {
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        image: uploadResult.url,
        // imageKey: uploadResult.key, // TODO: Add after migration
        link,
        buttonTextEn,
        buttonTextBn,
        categoryEn,
        categoryBn,
        date: new Date(),
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

    const formData = await request.formData();
    
    // Extract form fields
    const id = formData.get('id') as string;
    const titleEn = formData.get('titleEn') as string;
    const titleBn = formData.get('titleBn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionBn = formData.get('descriptionBn') as string;
    const link = formData.get('link') as string;
    const buttonTextEn = formData.get('buttonTextEn') as string;
    const buttonTextBn = formData.get('buttonTextBn') as string;
    const categoryEn = formData.get('categoryEn') as string;
    const categoryBn = formData.get('categoryBn') as string;
    const featured = formData.get('featured') === 'true';
    const order = parseInt(formData.get('order') as string) || 0;
    const file = formData.get('file') as File;
    const existingImage = formData.get('existingImage') as string;
    const existingImageKey = formData.get('existingImageKey') as string;

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

    let imageUrl = existingSlider.image;
    // let imageKey = existingSlider.imageKey; // TODO: Uncomment after migration

    // Handle file upload if new file is provided
    if (file && file.size > 0) {
      // Validate file
      const validation = validateImageFile(file.type, file.size);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Delete old image if it exists
      // TODO: Uncomment after migration
      // if (existingSlider.imageKey) {
      //   try {
      //     await deleteFromS3(existingSlider.imageKey);
      //   } catch (error) {
      //     console.warn('Failed to delete old image:', error);
      //   }
      // }

      // Upload new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToS3(fileBuffer, file.name, file.type, 'slider');
      
      imageUrl = uploadResult.url;
      // imageKey = uploadResult.key; // TODO: Uncomment after migration
    }
    
    // Update slider in database
    const updatedSlider = await prisma.slider.update({
      where: { id },
      data: {
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        image: imageUrl,
        // imageKey: imageKey, // TODO: Uncomment after migration
        link,
        buttonTextEn,
        buttonTextBn,
        categoryEn,
        categoryBn,
        featured,
        order,
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

    // Delete associated image from S3 if it exists
    // TODO: Uncomment after migration
    // if (existingSlider.imageKey) {
    //   try {
    //     await deleteFromS3(existingSlider.imageKey);
    //   } catch (error) {
    //     console.warn('Failed to delete image from S3:', error);
    //   }
    // }

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
