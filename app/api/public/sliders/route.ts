import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get active sliders from database
    const sliders = await prisma.slider.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform to match the expected format for the frontend
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
            en: slider.buttonTextEn || "Learn More",
            bn: slider.buttonTextBn || "আরও জানুন"
          },
          category: {
            en: slider.categoryEn || "Update",
            bn: slider.categoryBn || "আপডেট"
          },
          date: slider.date.toISOString().split('T')[0],
          featured: slider.featured
        }))
      }
    };

    return NextResponse.json(sliderData);

  } catch (error) {
    console.error('Error fetching public slider data:', error);
    
    // Return fallback data if database fails
    const fallbackData = {
      sliderData: {
        title: {
          en: "Featured Updates",
          bn: "বিশেষ আপডেট"
        },
        description: {
          en: "Stay informed with the latest news and updates",
          bn: "সর্বশেষ খবর ও আপডেটের সাথে অবগত থাকুন"
        },
        slides: []
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
