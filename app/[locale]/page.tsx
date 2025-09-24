import { Hero } from '../../components/Hero';
import { InfoGrid } from '../../components/InfoGrid';
import { Footer } from '../../components/Footer';
import GovernmentHeader from '../../components/GovernmentHeader';
import ImageSlider from '../../components/ImageSlider';
import CommissionScope from '../../components/CommissionScope';
import CommissionMembers from '../../components/CommissionMembers';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { HomePageData } from '../../types/home';

// Use static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  try {
    const messages = (await import(`../../messages/${params.locale}.json`)).default as any;
    return {
      title: messages.meta?.title ?? 'National Elections Inquiry Commission',
      description: messages.meta?.description ?? 'Bangladesh National Elections Inquiry Commission public submission portal',
      openGraph: {
        title: messages.meta?.title ?? 'National Elections Inquiry Commission',
        description: messages.meta?.description ?? 'Bangladesh National Elections Inquiry Commission public submission portal'
      },
      twitter: {
        card: 'summary_large_image',
        title: messages.meta?.title ?? 'National Elections Inquiry Commission',
        description: messages.meta?.description ?? 'Bangladesh National Elections Inquiry Commission public submission portal'
      }
    };
  } catch (error) {
    // Fallback metadata if messages file is not found
    return {
      title: 'National Elections Inquiry Commission',
      description: 'Bangladesh National Elections Inquiry Commission public submission portal'
    };
  }
}

// Fetch data from APIs with fallback to static data
async function fetchHomepageData() {
  // In development, try API first, in production use static data primarily
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/homepage`, {
        cache: 'no-store'
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching homepage data from API:', error);
    }
  }
  
  // Fallback to static data
  const homeData = await import('../../data/homeData.json');
  return homeData.default;
}

async function fetchSliderData() {
  // Only use API data, no fallback
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/public/sliders`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch slider data: ${response.status}`);
  }
  
  return await response.json();
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const isEnglish = locale === 'en';
  const t = await getTranslations({ locale, namespace: 'banner' });
  
  // Fetch dynamic data from APIs
  const [homepageData, sliderData] = await Promise.all([
    fetchHomepageData(),
    fetchSliderData()
  ]);
  
  const data = (homepageData as HomePageData).homePage;
  
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <section className="mb-6 sm:mb-8">
          <ImageSlider 
            slides={sliderData.sliderData.slides} 
            locale={locale as 'en' | 'bn'} 
            autoplay={true}
            autoplayInterval={2000}
            showText={true}
          />
        </section>
        
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title="জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন"
          // title={data.header.title[locale as keyof typeof data.header.title]}
          // subtitle={data.header.subtitle[locale as keyof typeof data.header.subtitle]}
          // portal={data.header.portal[locale as keyof typeof data.header.portal]}
          // tagline={data.header.tagline[locale as keyof typeof data.header.tagline]}
          borderColor="green"
          iconColor="green"
        />

        <main id="main" className="space-y-6 sm:space-y-8 lg:space-y-10">
          <Hero /> 
          {/* Commission Scope & Members Section */}
          <section className="space-y-6 sm:space-y-8">
            {/* Horizental Line */}
            <div className="h-0.5 bg-gray-200 dark:bg-gray-700 my-6"></div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
              <div className="xl:col-span-3">
                <CommissionScope />
              </div>
              <div className="xl:col-span-1">
                <CommissionMembers />
              </div>
            </div>
          </section>
          {/* <InfoGrid />         */}
          {/* <Footer /> */}
        </main>
      </div>
    </div>
  );
}
