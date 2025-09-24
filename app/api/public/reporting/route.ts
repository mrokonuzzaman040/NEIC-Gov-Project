import { NextResponse } from 'next/server';
import reportingData from '@/data/reportingData.json';

export async function GET() {
  try {
    // For now, return the static data, but this can be enhanced to fetch from database
    // In the future, you can create a "page_content" table in the database
    // and manage this content through the admin panel
    
    return NextResponse.json(reportingData);

  } catch (error) {
    console.error('Error fetching reporting data:', error);
    
    // Return minimal fallback data
    const fallbackData = {
      reportingPage: {
        header: {
          title: {
            en: "Service Process",
            bn: "সেবা গ্রহণের প্রক্রিয়া"
          },
          subtitle: {
            en: "National Elections (2014, 2018, 2024) Inquiry Commission",
            bn: "জাতীয়  নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন"
          },
          description: {
            en: "Learn about our comprehensive service delivery process and how citizens can access various services provided by the National Elections Inquiry Commission.",
            bn: "জাতীয় জাতীয়  নির্বাচন তদন্ত কমিশন কর্তৃক প্রদত্ত বিভিন্ন সেবা এবং নাগরিকরা কীভাবে এই সেবাগুলো পেতে পারেন সে সম্পর্কে বিস্তারিত জানুন।"
          }
        },
        sections: [],
        guidelines: []
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
