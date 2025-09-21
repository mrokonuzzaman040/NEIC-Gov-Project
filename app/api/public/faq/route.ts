import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get FAQ data from database
    const faqs = await prisma.fAQ.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform to match the expected format
    const faqData = {
      faqPage: {
        header: {
          title: {
            en: "Frequently Asked Questions",
            bn: "প্রায়শই জিজ্ঞাসিত প্রশ্ন"
          },
          subtitle: {
            en: "National Elections (2014, 2018, 2024) Inquiry Commission",
            bn: "জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন"
          },
          documentType: {
            en: "Official FAQ",
            bn: "সরকারি FAQ"
          },
          tagline: {
            en: "Your Questions, Our Answers",
            bn: "আপনার প্রশ্ন, আমাদের উত্তর"
          }
        },
        navigation: {
          backToHome: {
            en: "Back to Home",
            bn: "হোমে ফিরুন"
          }
        },
        faqs: faqs.map((faq, index) => ({
          id: faq.id,
          questionKey: `dynamic.q${index + 1}.question`,
          answerKey: `dynamic.q${index + 1}.answer`,
          icon: getIconForCategory(faq.category || 'general'),
          color: getColorForCategory(faq.category || 'general'),
          questionEn: faq.questionEn,
          questionBn: faq.questionBn,
          answerEn: faq.answerEn,
          answerBn: faq.answerBn
        })),
        contact: {
          titleKey: "contact.title",
          descriptionKey: "contact.description",
          buttonKey: "contact.button",
          buttonHref: "/reporting",
          icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        },
        footer: {
          importantNotice: {
            title: {
              en: "Need More Help?",
              bn: "আরও সাহায্য প্রয়োজন?"
            },
            description: {
              en: "If you have additional questions not covered in this FAQ, please contact our support team or visit our reporting page for more detailed information.",
              bn: "যদি এই FAQ-এ আপনার প্রশ্নের উত্তর না থাকে, তাহলে আমাদের সহায়তা দলের সাথে যোগাযোগ করুন বা আরও বিস্তারিত তথ্যের জন্য আমাদের রিপোর্টিং পেজ দেখুন।"
            }
          }
        }
      }
    };

// Helper functions to get icon and color based on category
function getIconForCategory(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('general')) {
    return "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  } else if (lowerCategory.includes('service')) {
    return "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z";
  } else if (lowerCategory.includes('technical')) {
    return "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z";
  } else if (lowerCategory.includes('security')) {
    return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z";
  }
  return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
}

function getColorForCategory(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('general')) return 'blue';
  if (lowerCategory.includes('service')) return 'green';
  if (lowerCategory.includes('technical')) return 'purple';
  if (lowerCategory.includes('security')) return 'orange';
  return 'red';
}

    return NextResponse.json(faqData);

  } catch (error) {
    console.error('Error fetching public FAQ data:', error);
    
    // Return fallback data if database fails
    const fallbackData = {
      faqPage: {
        header: {
          title: {
            en: "Frequently Asked Questions",
            bn: "প্রায়শই জিজ্ঞাসিত প্রশ্ন"
          },
          subtitle: {
            en: "National Elections (2014, 2018, 2024) Inquiry Commission",
            bn: "জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন"
          },
          documentType: {
            en: "Official FAQ",
            bn: "সরকারি FAQ"
          },
          tagline: {
            en: "Your Questions, Our Answers",
            bn: "আপনার প্রশ্ন, আমাদের উত্তর"
          }
        },
        navigation: {
          backToHome: {
            en: "Back to Home",
            bn: "হোমে ফিরুন"
          }
        },
        faqs: [],
        contact: {
          titleKey: "contact.title",
          descriptionKey: "contact.description",
          buttonKey: "contact.button",
          buttonHref: "/reporting",
          icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        },
        footer: {
          importantNotice: {
            title: {
              en: "Need More Help?",
              bn: "আরও সাহায্য প্রয়োজন?"
            },
            description: {
              en: "If you have additional questions not covered in this FAQ, please contact our support team or visit our reporting page for more detailed information.",
              bn: "যদি এই FAQ-এ আপনার প্রশ্নের উত্তর না থাকে, তাহলে আমাদের সহায়তা দলের সাথে যোগাযোগ করুন বা আরও বিস্তারিত তথ্যের জন্য আমাদের রিপোর্টিং পেজ দেখুন।"
            }
          }
        }
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
