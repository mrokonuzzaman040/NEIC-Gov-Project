export interface LocalizedText {
  en: string;
  bn: string;
}

export interface FAQPageHeader {
  title: LocalizedText;
  subtitle: LocalizedText;
  documentType: LocalizedText;
  tagline: LocalizedText;
}

export interface FAQPageNavigation {
  backToHome: LocalizedText;
}

export interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface FAQContact {
  titleKey: string;
  descriptionKey: string;
  buttonKey: string;
  buttonHref: string;
  icon: string;
}

export interface FAQPageFooter {
  importantNotice: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export interface FAQPageData {
  faqPage: {
    header: FAQPageHeader;
    navigation: FAQPageNavigation;
    faqs: FAQItem[];
    contact: FAQContact;
    footer: FAQPageFooter;
  };
}
