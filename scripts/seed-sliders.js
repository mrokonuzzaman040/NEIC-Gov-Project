const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sliderData = [
  {
    titleEn: "Commission Launches Digital Transparency Initiative",
    titleBn: "কমিশন ডিজিটাল স্বচ্ছতা উদ্যোগ চালু করেছে",
    descriptionEn: "The National Elections Inquiry Commission has launched a comprehensive digital transparency initiative to enhance public access to electoral information and processes.",
    descriptionBn: "জাতীয় নির্বাচন তদন্ত কমিশন নির্বাচনী তথ্য ও প্রক্রিয়ায় জনগণের অ্যাক্সেস বৃদ্ধির জন্য একটি ব্যাপক ডিজিটাল স্বচ্ছতা উদ্যোগ চালু করেছে।",
    image: "/slider-images/police.jpg",
    link: "/blog/understanding-electoral-transparency-bangladesh",
    buttonTextEn: "Learn More",
    buttonTextBn: "আরও জানুন",
    categoryEn: "Transparency",
    categoryBn: "স্বচ্ছতা",
    date: new Date("2024-01-15"),
    featured: true,
    order: 1
  },
  {
    titleEn: "Enhanced Security Measures for Electoral Systems",
    titleBn: "নির্বাচনী ব্যবস্থার জন্য উন্নত নিরাপত্তা ব্যবস্থা",
    descriptionEn: "New cybersecurity protocols and enhanced security measures have been implemented to protect electoral integrity and voter data.",
    descriptionBn: "নির্বাচনী অখণ্ডতা এবং ভোটার তথ্য রক্ষার জন্য নতুন সাইবার নিরাপত্তা প্রোটোকল এবং উন্নত নিরাপত্তা ব্যবস্থা বাস্তবায়ন করা হয়েছে।",
    image: "/slider-images/fall.avif",
    link: "/blog/digital-security-modern-elections",
    buttonTextEn: "Read Details",
    buttonTextBn: "বিস্তারিত পড়ুন",
    categoryEn: "Security",
    categoryBn: "নিরাপত্তা",
    date: new Date("2024-01-10"),
    featured: true,
    order: 2
  },
  {
    titleEn: "Citizen Engagement Portal Now Live",
    titleBn: "নাগরিক অংশগ্রহণ পোর্টাল এখন লাইভ",
    descriptionEn: "The new citizen engagement portal provides enhanced opportunities for public participation in electoral oversight and reporting.",
    descriptionBn: "নতুন নাগরিক অংশগ্রহণ পোর্টাল নির্বাচনী তদারকি এবং রিপোর্টিংয়ে জনসাধারণের অংশগ্রহণের জন্য উন্নত সুযোগ প্রদান করে।",
    image: "/slider-images/caught.webp",
    link: "/blog/citizen-engagement-electoral-oversight",
    buttonTextEn: "Get Involved",
    buttonTextBn: "জড়িত হন",
    categoryEn: "Engagement",
    categoryBn: "অংশগ্রহণ",
    date: new Date("2024-01-05"),
    featured: true,
    order: 3
  },
  {
    titleEn: "Technology Innovation in Electoral Processes",
    titleBn: "নির্বাচনী প্রক্রিয়ায় প্রযুক্তি উদ্ভাবন",
    descriptionEn: "Latest technological advancements are being integrated into electoral systems to improve efficiency, accuracy, and transparency.",
    descriptionBn: "দক্ষতা, নির্ভুলতা এবং স্বচ্ছতা উন্নত করার জন্য নির্বাচনী ব্যবস্থায় সর্বশেষ প্রযুক্তিগত অগ্রগতি একীভূত করা হচ্ছে।",
    image: "/slider-images/real/election11.png",
    link: "/blog/technology-advancements-electoral-systems",
    buttonTextEn: "Explore Tech",
    buttonTextBn: "প্রযুক্তি অন্বেষণ",
    categoryEn: "Technology",
    categoryBn: "প্রযুক্তি",
    date: new Date("2024-01-01"),
    featured: false,
    order: 4
  },
  {
    titleEn: "Public Consultation on Electoral Reforms",
    titleBn: "নির্বাচনী সংস্কার নিয়ে জনসাধারণের পরামর্শ",
    descriptionEn: "The commission invites public input on proposed electoral reforms to ensure democratic participation in the decision-making process.",
    descriptionBn: "সিদ্ধান্ত গ্রহণ প্রক্রিয়ায় গণতান্ত্রিক অংশগ্রহণ নিশ্চিত করার জন্য কমিশন প্রস্তাবিত নির্বাচনী সংস্কার নিয়ে জনসাধারণের মতামত আহ্বান করে।",
    image: "/slider-images/real/election12.jpg",
    link: "/submit",
    buttonTextEn: "Share Your Views",
    buttonTextBn: "আপনার মতামত জানান",
    categoryEn: "Consultation",
    categoryBn: "পরামর্শ",
    date: new Date("2023-12-28"),
    featured: true,
    order: 5
  }
];

async function seedSliders() {
  try {
    console.log('🌱 Seeding sliders...');
    
    // Clear existing sliders
    await prisma.slider.deleteMany({});
    console.log('✅ Cleared existing sliders');
    
    // Create new sliders
    for (const slider of sliderData) {
      await prisma.slider.create({
        data: slider
      });
    }
    
    console.log(`✅ Created ${sliderData.length} sliders`);
    console.log('🎉 Slider seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding sliders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSliders();
