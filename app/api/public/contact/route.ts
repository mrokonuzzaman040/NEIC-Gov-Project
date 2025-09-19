import { NextResponse } from 'next/server';
import contactData from '@/data/contact_page/contact.json';

export async function GET() {
  try {
    // For now, return the static contact data
    // In the future, this can be enhanced to fetch from database
    // and allow admins to manage contact information
    
    return NextResponse.json(contactData);

  } catch (error) {
    console.error('Error fetching contact data:', error);
    
    // Return minimal fallback data
    const fallbackData = {
      contactPage: {
        header: {
          title: {
            en: "Contact Us",
            bn: "যোগাযোগ"
          },
          subtitle: {
            en: "Get in touch with the National Elections Inquiry Commission",
            bn: "জাতীয় নির্বাচন তদন্ত কমিশনের সাথে যোগাযোগ করুন"
          }
        },
        contactInfo: {
          office: {
            name: {
              en: "Main Office",
              bn: "প্রধান কার্যালয়"
            },
            address: {
              en: "Dhaka, Bangladesh",
              bn: "ঢাকা, বাংলাদেশ"
            },
            phone: "+880-2-XXXXXXX",
            email: "info@election-commission.gov.bd"
          }
        }
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
