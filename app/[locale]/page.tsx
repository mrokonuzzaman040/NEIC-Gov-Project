import { Hero } from '../../components/Hero';
import { InfoGrid } from '../../components/InfoGrid';
import { Footer } from '../../components/Footer';
import GovernmentHeader from '../../components/GovernmentHeader';
import ImageSlider from '../../components/ImageSlider';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { HomePageData } from '../../types/home';

// Force dynamic rendering to ensure fresh data from APIs
export const dynamic = 'force-dynamic';

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

// Fetch data from APIs
async function fetchHomepageData() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/homepage`, {
      cache: 'no-store' // Ensure fresh data
    });
    if (!response.ok) {
      throw new Error('Failed to fetch homepage data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Fallback to static data
    const homeData = await import('../../data/homeData.json');
    return homeData.default;
  }
}

async function fetchSliderData() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/sliders`, {
      cache: 'no-store' // Ensure fresh data
    });
    if (!response.ok) {
      throw new Error('Failed to fetch slider data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching slider data:', error);
    // Fallback to static data
    const sliderData = await import('../../data/sliderData.json');
    return sliderData.default;
  }
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
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
          title={data.header.title[locale as keyof typeof data.header.title]}
          subtitle={data.header.subtitle[locale as keyof typeof data.header.subtitle]}
          portal={data.header.portal[locale as keyof typeof data.header.portal]}
          tagline={data.header.tagline[locale as keyof typeof data.header.tagline]}
          borderColor="green"
          iconColor="green"
        />

        <main id="main" className="space-y-10">
          <Hero />  
          <InfoGrid />
          <Footer />
        </main>
      </div>
    </div>
  );
}
