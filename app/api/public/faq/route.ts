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
            en: "Find answers to common questions about our services and processes",
            bn: "আমাদের সেবা এবং প্রক্রিয়া সম্পর্কে সাধারণ প্রশ্নের উত্তর খুঁজুন"
          }
        },
        categories: [
          {
            id: "general",
            name: {
              en: "General Information",
              bn: "সাধারণ তথ্য"
            },
            color: "blue",
            faqs: faqs.filter(faq => faq.category?.toLowerCase().includes('general')).map(faq => ({
              id: faq.id,
              question: {
                en: faq.questionEn,
                bn: faq.questionBn
              },
              answer: {
                en: faq.answerEn,
                bn: faq.answerBn
              }
            }))
          },
          {
            id: "services",
            name: {
              en: "Services",
              bn: "সেবা সমূহ"
            },
            color: "green",
            faqs: faqs.filter(faq => faq.category?.toLowerCase().includes('service')).map(faq => ({
              id: faq.id,
              question: {
                en: faq.questionEn,
                bn: faq.questionBn
              },
              answer: {
                en: faq.answerEn,
                bn: faq.answerBn
              }
            }))
          },
          {
            id: "technical",
            name: {
              en: "Technical Support",
              bn: "প্রযুক্তিগত সহায়তা"
            },
            color: "purple",
            faqs: faqs.filter(faq => faq.category?.toLowerCase().includes('technical')).map(faq => ({
              id: faq.id,
              question: {
                en: faq.questionEn,
                bn: faq.questionBn
              },
              answer: {
                en: faq.answerEn,
                bn: faq.answerBn
              }
            }))
          }
        ]
      }
    };

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
            en: "Find answers to common questions",
            bn: "সাধারণ প্রশ্নের উত্তর খুঁজুন"
          }
        },
        categories: []
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}
