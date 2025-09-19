import { NextResponse } from 'next/server';
import homeData from '@/data/homeData.json';

export async function GET() {
  try {
    // For now, return the static data, but this can be enhanced to fetch from database
    // In the future, you can create a "homepage_content" table in the database
    // and manage this content through the admin panel
    
    return NextResponse.json(homeData);

  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Return minimal fallback data
    const fallbackData = {
      homePage: {
        header: {
          title: {
            en: "National Elections Inquiry Commission",
            bn: "জাতীয় নির্বাচন তদন্ত কমিশন"
          },
          subtitle: {
            en: "Government of the People's Republic of Bangladesh",
            bn: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
          },
          portal: {
            en: "Official Portal",
            bn: "অফিসিয়াল পোর্টাল"
          },
          tagline: {
            en: "Transparency • Accountability • Democracy",
            bn: "স্বচ্ছতা • জবাবদিহিতা • গণতন্ত্র"
          }
        }
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
