export interface LocalizedText {
  en: string;
  bn: string;
}

export interface PrivacyPageHeader {
  title: LocalizedText;
  subtitle: LocalizedText;
  documentType: LocalizedText;
  tagline: LocalizedText;
}

export interface PrivacyPageNavigation {
  backToHome: LocalizedText;
}

export interface PrivacyPageSubsection {
  id: string;
  titleKey: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  itemsKey: string;
}

export interface PrivacyPageSection {
  id: string;
  titleKey: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subsections?: PrivacyPageSubsection[];
  itemsKey?: string;
  descriptionKey?: string;
  contactInfo?: PrivacyContactInfo[];
}

export interface PrivacyContactInfo {
  type: 'email' | 'phone' | 'address';
  icon: string;
  key: string;
}

export interface PrivacyPageFooter {
  lastUpdatedKey: string;
  importantNotice: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export interface PrivacyPageData {
  privacyPage: {
    header: PrivacyPageHeader;
    navigation: PrivacyPageNavigation;
    sections: PrivacyPageSection[];
    footer: PrivacyPageFooter;
  };
}
