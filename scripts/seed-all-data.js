const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedBlogData() {
  try {
    console.log('📝 Seeding blog data...');
    
    const blogDataPath = path.join(__dirname, '../data/blogData.json');
    const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
    
    const posts = blogData.blogPage.posts;
    
    for (const post of posts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          titleEn: post.title.en,
          titleBn: post.title.bn,
          excerptEn: post.excerpt.en,
          excerptBn: post.excerpt.bn,
          contentEn: post.content.en,
          contentBn: post.content.bn,
          authorEn: post.author.en,
          authorBn: post.author.bn,
          category: post.category,
          image: post.image,
          tags: post.tags,
          featured: post.featured,
          readTime: parseInt(post.readTime.en.split(' ')[0]) || 5,
          publishedAt: new Date(post.date),
        },
        create: {
          slug: post.slug,
          titleEn: post.title.en,
          titleBn: post.title.bn,
          excerptEn: post.excerpt.en,
          excerptBn: post.excerpt.bn,
          contentEn: post.content.en,
          contentBn: post.content.bn,
          authorEn: post.author.en,
          authorBn: post.author.bn,
          category: post.category,
          image: post.image,
          tags: post.tags,
          featured: post.featured,
          readTime: parseInt(post.readTime.en.split(' ')[0]) || 5,
          publishedAt: new Date(post.date),
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${posts.length} blog posts`);
  } catch (error) {
    console.error('❌ Error seeding blog data:', error);
  }
}

async function seedFAQData() {
  try {
    console.log('❓ Seeding FAQ data...');
    
    // Create sample FAQs based on the structure
    const sampleFAQs = [
      {
        id: 'faq-1',
        questionEn: 'How can I submit a complaint about electoral irregularities?',
        questionBn: 'নির্বাচনী অনিয়ম সম্পর্কে আমি কীভাবে অভিযোগ দাখিল করতে পারি?',
        answerEn: 'You can submit complaints through our online portal, by email, or by visiting our office. All complaints are reviewed by our investigation team.',
        answerBn: 'আপনি আমাদের অনলাইন পোর্টাল, ইমেইলের মাধ্যমে বা আমাদের অফিসে গিয়ে অভিযোগ দাখিল করতে পারেন। সমস্ত অভিযোগ আমাদের তদন্ত দল পর্যালোচনা করে।',
        category: 'complaints',
        order: 1
      },
      {
        id: 'faq-2',
        questionEn: 'What is the process for investigating electoral complaints?',
        questionBn: 'নির্বাচনী অভিযোগ তদন্তের প্রক্রিয়া কী?',
        answerEn: 'Our investigation process includes initial review, evidence collection, witness interviews, and final report preparation. The entire process typically takes 30-60 days.',
        answerBn: 'আমাদের তদন্ত প্রক্রিয়ায় প্রাথমিক পর্যালোচনা, প্রমাণ সংগ্রহ, সাক্ষী সাক্ষাৎকার এবং চূড়ান্ত প্রতিবেদন প্রস্তুত করা অন্তর্ভুক্ত। পুরো প্রক্রিয়াটি সাধারণত ৩০-৬০ দিন সময় নেয়।',
        category: 'process',
        order: 2
      },
      {
        id: 'faq-3',
        questionEn: 'How can I track the status of my complaint?',
        questionBn: 'আমি কীভাবে আমার অভিযোগের অবস্থা ট্র্যাক করতে পারি?',
        answerEn: 'You can track your complaint status by logging into your account on our portal or by contacting our support team with your complaint reference number.',
        answerBn: 'আপনি আমাদের পোর্টালে আপনার অ্যাকাউন্টে লগ ইন করে বা আপনার অভিযোগের রেফারেন্স নম্বর দিয়ে আমাদের সহায়তা দলের সাথে যোগাযোগ করে আপনার অভিযোগের অবস্থা ট্র্যাক করতে পারেন।',
        category: 'support',
        order: 3
      },
      {
        id: 'faq-4',
        questionEn: 'What types of electoral issues can I report?',
        questionBn: 'আমি কী ধরনের নির্বাচনী সমস্যা রিপোর্ট করতে পারি?',
        answerEn: 'You can report various issues including voter intimidation, ballot box tampering, campaign violations, polling station problems, and other electoral irregularities.',
        answerBn: 'আপনি ভোটার ভীতি প্রদর্শন, ব্যালট বক্সে কারচুপি, প্রচারণা লঙ্ঘন, ভোটকেন্দ্রের সমস্যা এবং অন্যান্য নির্বাচনী অনিয়ম সহ বিভিন্ন সমস্যা রিপোর্ট করতে পারেন।',
        category: 'reporting',
        order: 4
      },
      {
        id: 'faq-5',
        questionEn: 'What is the commission\'s mandate?',
        questionBn: 'কমিশনের ম্যান্ডেট কী?',
        answerEn: 'The commission is mandated to investigate the conduct of national elections held in 2014, 2018, and 2024, and examine allegations of irregularities.',
        answerBn: 'কমিশনের ম্যান্ডেট হল ২০১৪, ২০১৮ এবং ২০২৪ সালে অনুষ্ঠিত জাতীয় নির্বাচনের আচরণ তদন্ত করা এবং অনিয়মের অভিযোগ পরীক্ষা করা।',
        category: 'general',
        order: 5
      }
    ];

    for (const faq of sampleFAQs) {
      await prisma.fAQ.upsert({
        where: { id: faq.id },
        update: {
          questionEn: faq.questionEn,
          questionBn: faq.questionBn,
          answerEn: faq.answerEn,
          answerBn: faq.answerBn,
          category: faq.category,
          order: faq.order,
        },
        create: {
          id: faq.id,
          questionEn: faq.questionEn,
          questionBn: faq.questionBn,
          answerEn: faq.answerEn,
          answerBn: faq.answerBn,
          category: faq.category,
          order: faq.order,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${sampleFAQs.length} FAQs`);
  } catch (error) {
    console.error('❌ Error seeding FAQ data:', error);
  }
}

async function seedNoticeData() {
  try {
    console.log('📢 Seeding notice data...');
    
    const noticeDataPath = path.join(__dirname, '../data/notices.json');
    const noticeData = JSON.parse(fs.readFileSync(noticeDataPath, 'utf8'));
    
    const notices = noticeData.notices;
    
    for (const notice of notices) {
      const priorityMap = {
        'low': 'LOW',
        'medium': 'MEDIUM', 
        'high': 'HIGH',
        'critical': 'CRITICAL'
      };

      await prisma.notice.upsert({
        where: { id: `notice-${notice.id}` },
        update: {
          titleEn: notice.title.en,
          titleBn: notice.title.bn,
          contentEn: `Detailed content for ${notice.title.en}. This notice provides important information regarding ${notice.category} matters. Please review the attached document for complete details.`,
          contentBn: `${notice.title.bn} এর বিস্তারিত বিষয়বস্তু। এই বিজ্ঞপ্তি ${notice.category} বিষয়ে গুরুত্বপূর্ণ তথ্য প্রদান করে। সম্পূর্ণ বিবরণের জন্য সংযুক্ত নথি পর্যালোচনা করুন।`,
          type: notice.priority === 'high' ? 'URGENT' : 'INFORMATION',
          priority: priorityMap[notice.priority] || 'MEDIUM',
          category: notice.category,
          publishedAt: new Date(notice.publishedAt),
          isPinned: notice.priority === 'high',
          attachments: notice.downloadUrl ? [notice.downloadUrl] : [],
        },
        create: {
          id: `notice-${notice.id}`,
          titleEn: notice.title.en,
          titleBn: notice.title.bn,
          contentEn: `Detailed content for ${notice.title.en}. This notice provides important information regarding ${notice.category} matters. Please review the attached document for complete details.`,
          contentBn: `${notice.title.bn} এর বিস্তারিত বিষয়বস্তু। এই বিজ্ঞপ্তি ${notice.category} বিষয়ে গুরুত্বপূর্ণ তথ্য প্রদান করে। সম্পূর্ণ বিবরণের জন্য সংযুক্ত নথি পর্যালোচনা করুন।`,
          type: notice.priority === 'high' ? 'URGENT' : 'INFORMATION',
          priority: priorityMap[notice.priority] || 'MEDIUM',
          category: notice.category,
          publishedAt: new Date(notice.publishedAt),
          isPinned: notice.priority === 'high',
          attachments: notice.downloadUrl ? [notice.downloadUrl] : [],
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${notices.length} notices`);
  } catch (error) {
    console.error('❌ Error seeding notice data:', error);
  }
}

async function seedContactData() {
  try {
    console.log('📞 Seeding contact data...');
    
    const contactDataPath = path.join(__dirname, '../data/contact_info.json');
    const contactData = JSON.parse(fs.readFileSync(contactDataPath, 'utf8'));
    
    const contactInfo = contactData.contactInfo;
    
    await prisma.contactInfo.upsert({
      where: { id: 'main-office' },
      update: {
        type: 'OFFICE',
        nameEn: contactInfo.address.en.organization,
        nameBn: contactInfo.address.bn.organization,
        descriptionEn: 'Main administrative office of the Election Commission',
        descriptionBn: 'নির্বাচন কমিশনের প্রধান প্রশাসনিক অফিস',
        addressEn: `${contactInfo.address.en.location}, ${contactInfo.address.en.area}, ${contactInfo.address.en.city}`,
        addressBn: `${contactInfo.address.bn.location}, ${contactInfo.address.bn.area}, ${contactInfo.address.bn.city}`,
        email: contactInfo.email,
        order: 1,
      },
      create: {
        id: 'main-office',
        type: 'OFFICE',
        nameEn: contactInfo.address.en.organization,
        nameBn: contactInfo.address.bn.organization,
        descriptionEn: 'Main administrative office of the Election Commission',
        descriptionBn: 'নির্বাচন কমিশনের প্রধান প্রশাসনিক অফিস',
        addressEn: `${contactInfo.address.en.location}, ${contactInfo.address.en.area}, ${contactInfo.address.en.city}`,
        addressBn: `${contactInfo.address.bn.location}, ${contactInfo.address.bn.area}, ${contactInfo.address.bn.city}`,
        email: contactInfo.email,
        order: 1,
        createdBy: 'system-seed',
      },
    });
    
    console.log('✅ Seeded contact information');
  } catch (error) {
    console.error('❌ Error seeding contact data:', error);
  }
}

async function seedCommissionMembers() {
  try {
    console.log('👥 Seeding commission members...');
    
    const commissionDataPath = path.join(__dirname, '../data/commisson_data.json');
    const commissionData = JSON.parse(fs.readFileSync(commissionDataPath, 'utf8'));
    
    const members = commissionData.personnel.filter(person => person.role_type === 'commission_member');
    
    for (const member of members) {
      await prisma.commissionMember.upsert({
        where: { serialNo: member.serial_no },
        update: {
          nameEn: member.name_english,
          nameBn: member.name_bengali,
          designationEn: member.designation_english,
          designationBn: member.designation_bengali,
          descriptionEn: member.description_english,
          descriptionBn: member.description_bengali,
          email: member.email,
          phone: member.phone,
          image: member.image,
        },
        create: {
          nameEn: member.name_english,
          nameBn: member.name_bengali,
          designationEn: member.designation_english,
          designationBn: member.designation_bengali,
          descriptionEn: member.description_english,
          descriptionBn: member.description_bengali,
          email: member.email,
          phone: member.phone,
          image: member.image,
          serialNo: member.serial_no,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${members.length} commission members`);
  } catch (error) {
    console.error('❌ Error seeding commission members:', error);
  }
}

async function seedCommissionOfficials() {
  try {
    console.log('👔 Seeding commission officials...');
    
    const officialsDataPath = path.join(__dirname, '../data/commisson/commission_officials.json');
    const officialsData = JSON.parse(fs.readFileSync(officialsDataPath, 'utf8'));
    
    // Seed secretariat staff
    const secretariatMembers = officialsData.officials.secretariat.members;
    
    for (let i = 0; i < secretariatMembers.length; i++) {
      const official = secretariatMembers[i];
      await prisma.commissionOfficial.upsert({
        where: { id: `official-secretariat-${i + 1}` },
        update: {
          nameEn: official.name.en,
          nameBn: official.name.bn,
          positionEn: official.position.en,
          positionBn: official.position.bn,
          departmentEn: official.department.en,
          departmentBn: official.department.bn,
          email: official.email,
          phone: official.phone,
          experienceEn: official.experience.en,
          experienceBn: official.experience.bn,
          qualificationEn: official.qualification.en,
          qualificationBn: official.qualification.bn,
          category: 'SECRETARIAT',
          order: i + 1,
        },
        create: {
          id: `official-secretariat-${i + 1}`,
          nameEn: official.name.en,
          nameBn: official.name.bn,
          positionEn: official.position.en,
          positionBn: official.position.bn,
          departmentEn: official.department.en,
          departmentBn: official.department.bn,
          email: official.email,
          phone: official.phone,
          experienceEn: official.experience.en,
          experienceBn: official.experience.bn,
          qualificationEn: official.qualification.en,
          qualificationBn: official.qualification.bn,
          category: 'SECRETARIAT',
          order: i + 1,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${secretariatMembers.length} commission officials`);
  } catch (error) {
    console.error('❌ Error seeding commission officials:', error);
  }
}

async function seedGazettes() {
  try {
    console.log('📰 Seeding gazettes...');
    
    const gazettesDataPath = path.join(__dirname, '../data/gazettes.json');
    const gazettesData = JSON.parse(fs.readFileSync(gazettesDataPath, 'utf8'));
    
    const gazettes = gazettesData.gazettes; // Correct property name
    
    for (const gazette of gazettes) {
      const priorityMap = {
        'low': 'LOW',
        'medium': 'MEDIUM', 
        'high': 'HIGH',
        'critical': 'CRITICAL'
      };

      await prisma.gazette.upsert({
        where: { gazetteNumber: gazette.gazetteNumber || `GAZ-${gazette.id}` },
        update: {
          titleEn: gazette.title.en,
          titleBn: gazette.title.bn,
          category: gazette.category,
          priority: priorityMap[gazette.priority] || 'MEDIUM',
          publishedAt: new Date(gazette.publishedAt),
          downloadUrl: gazette.downloadUrl,
          description: `Official gazette notification: ${gazette.title.en}`,
        },
        create: {
          titleEn: gazette.title.en,
          titleBn: gazette.title.bn,
          gazetteNumber: gazette.gazetteNumber || `GAZ-${gazette.id}`,
          category: gazette.category,
          priority: priorityMap[gazette.priority] || 'MEDIUM',
          publishedAt: new Date(gazette.publishedAt),
          downloadUrl: gazette.downloadUrl,
          description: `Official gazette notification: ${gazette.title.en}`,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${gazettes.length} gazettes`);
  } catch (error) {
    console.error('❌ Error seeding gazettes:', error);
  }
}

async function seedCommissionTerms() {
  try {
    console.log('📋 Seeding commission terms...');
    
    // Create sample terms of reference
    const sampleTerms = [
      {
        id: 'term-1',
        titleEn: 'Commission Mandate and Objectives',
        titleBn: 'কমিশনের ম্যান্ডেট ও উদ্দেশ্য',
        descriptionEn: 'To investigate and inquire into the conduct of the National Parliamentary Elections held in 2014, 2018, and 2024, and to examine allegations of irregularities.',
        descriptionBn: '২০১৪, ২০১৮ এবং ২০২৪ সালে অনুষ্ঠিত জাতীয়  নির্বাচনের আচরণ তদন্ত ও অনুসন্ধান করা এবং অনিয়মের অভিযোগ পরীক্ষা করা।',
        category: 'mandate',
        section: 'Article 1',
        order: 1,
        effectiveFrom: '2024-01-01'
      },
      {
        id: 'term-2',
        titleEn: 'Powers and Authority',
        titleBn: 'ক্ষমতা ও কর্তৃত্ব',
        descriptionEn: 'The Commission shall have the power to summon witnesses, examine documents, and conduct investigations as deemed necessary for fulfilling its mandate.',
        descriptionBn: 'কমিশনের সাক্ষী তলব করা, নথিপত্র পরীক্ষা করা এবং তার ম্যান্ডেট পূরণের জন্য প্রয়োজনীয় বলে বিবেচিত তদন্ত পরিচালনার ক্ষমতা থাকবে।',
        category: 'powers',
        section: 'Article 2',
        order: 2,
        effectiveFrom: '2024-01-01'
      },
      {
        id: 'term-3',
        titleEn: 'Scope of Investigation',
        titleBn: 'তদন্তের পরিধি',
        descriptionEn: 'The investigation shall cover all aspects of electoral processes including voter registration, candidate nomination, campaigning, voting procedures, and result compilation.',
        descriptionBn: 'তদন্তে ভোটার নিবন্ধন, প্রার্থী মনোনয়ন, প্রচারণা, ভোটদান পদ্ধতি এবং ফলাফল সংকলন সহ নির্বাচনী প্রক্রিয়ার সমস্ত দিক অন্তর্ভুক্ত থাকবে।',
        category: 'scope',
        section: 'Article 3',
        order: 3,
        effectiveFrom: '2024-01-01'
      },
      {
        id: 'term-4',
        titleEn: 'Reporting and Recommendations',
        titleBn: 'রিপোর্টিং ও সুপারিশ',
        descriptionEn: 'The Commission shall submit its final report with findings and recommendations to the appropriate authorities within the stipulated timeframe.',
        descriptionBn: 'কমিশন নির্ধারিত সময়সীমার মধ্যে উপযুক্ত কর্তৃপক্ষের কাছে তার চূড়ান্ত প্রতিবেদন ও সুপারিশ জমা দেবে।',
        category: 'reporting',
        section: 'Article 4',
        order: 4,
        effectiveFrom: '2024-01-01',
        effectiveTo: '2025-12-31'
      }
    ];

    for (const term of sampleTerms) {
      await prisma.commissionTerm.upsert({
        where: { id: term.id },
        update: {
          titleEn: term.titleEn,
          titleBn: term.titleBn,
          descriptionEn: term.descriptionEn,
          descriptionBn: term.descriptionBn,
          category: term.category,
          section: term.section,
          order: term.order,
          effectiveFrom: new Date(term.effectiveFrom),
          effectiveTo: term.effectiveTo ? new Date(term.effectiveTo) : null,
        },
        create: {
          id: term.id,
          titleEn: term.titleEn,
          titleBn: term.titleBn,
          descriptionEn: term.descriptionEn,
          descriptionBn: term.descriptionBn,
          category: term.category,
          section: term.section,
          order: term.order,
          effectiveFrom: new Date(term.effectiveFrom),
          effectiveTo: term.effectiveTo ? new Date(term.effectiveTo) : null,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${sampleTerms.length} commission terms`);
  } catch (error) {
    console.error('❌ Error seeding commission terms:', error);
  }
}

async function seedSliderData() {
  try {
    console.log('🖼️ Seeding slider data...');
    
    const sliderDataPath = path.join(__dirname, '../data/sliderData.json');
    const sliderData = JSON.parse(fs.readFileSync(sliderDataPath, 'utf8'));
    
    const slides = sliderData.sliderData.slides;
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      await prisma.slider.upsert({
        where: { id: `slider-${slide.id || i + 1}` },
        update: {
          titleEn: slide.title.en,
          titleBn: slide.title.bn,
          descriptionEn: slide.description.en,
          descriptionBn: slide.description.bn,
          image: slide.image,
          link: slide.link,
          buttonTextEn: slide.buttonText.en,
          buttonTextBn: slide.buttonText.bn,
          categoryEn: slide.category.en,
          categoryBn: slide.category.bn,
          date: new Date(slide.date),
          featured: slide.featured,
          order: i,
        },
        create: {
          id: `slider-${slide.id || i + 1}`,
          titleEn: slide.title.en,
          titleBn: slide.title.bn,
          descriptionEn: slide.description.en,
          descriptionBn: slide.description.bn,
          image: slide.image,
          link: slide.link,
          buttonTextEn: slide.buttonText.en,
          buttonTextBn: slide.buttonText.bn,
          categoryEn: slide.category.en,
          categoryBn: slide.category.bn,
          date: new Date(slide.date),
          featured: slide.featured,
          order: i,
          createdBy: 'system-seed',
        },
      });
    }
    
    console.log(`✅ Seeded ${slides.length} sliders`);
  } catch (error) {
    console.error('❌ Error seeding slider data:', error);
  }
}

async function main() {
  console.log('🌱 Starting comprehensive data seeding...\n');
  
  try {
    // Seed all content types
    await seedBlogData();
    await seedFAQData();
    await seedNoticeData();
    await seedContactData();
    await seedCommissionMembers();
    await seedCommissionOfficials();
    await seedCommissionTerms();
    await seedGazettes();
    await seedSliderData();
    
    console.log('\n🎉 Complete data seeding finished successfully!');
    console.log('\n📊 Database Summary:');
    
    // Get counts of all seeded data
    const [
      blogCount,
      faqCount,
      noticeCount,
      contactCount,
      memberCount,
      officialCount,
      termCount,
      gazetteCount,
      sliderCount
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.fAQ.count(),
      prisma.notice.count(),
      prisma.contactInfo.count(),
      prisma.commissionMember.count(),
      prisma.commissionOfficial.count(),
      prisma.commissionTerm.count(),
      prisma.gazette.count(),
      prisma.slider.count()
    ]);
    
    console.log(`📝 Blog Posts: ${blogCount}`);
    console.log(`❓ FAQs: ${faqCount}`);
    console.log(`📢 Notices: ${noticeCount}`);
    console.log(`📞 Contacts: ${contactCount}`);
    console.log(`👥 Commission Members: ${memberCount}`);
    console.log(`👔 Commission Officials: ${officialCount}`);
    console.log(`📋 Commission Terms: ${termCount}`);
    console.log(`📰 Gazettes: ${gazetteCount}`);
    console.log(`🖼️ Sliders: ${sliderCount}`);
    console.log(`\n📈 Total Records: ${blogCount + faqCount + noticeCount + contactCount + memberCount + officialCount + termCount + gazetteCount + sliderCount}`);
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
