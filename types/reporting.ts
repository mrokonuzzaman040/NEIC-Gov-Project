export interface LocalizedText {
  en: string;
  bn: string;
}

export interface ReportingPageHeader {
  title: LocalizedText;
  subtitle: LocalizedText;
  documentType: LocalizedText;
  tagline: LocalizedText;
}

export interface ReportingPageNavigation {
  backToHome: LocalizedText;
}

export interface ReportingGuideline {
  id: string;
  title: LocalizedText;
  descriptionKey: string;
  icon: string;
  color: 'blue' | 'green' | 'orange';
}

export interface ReportingPageSection {
  id: string;
  titleKey: string;
  icon: string;
  color: 'green' | 'amber';
  guidelines?: ReportingGuideline[];
  descriptionKey?: string;
}

export interface ReportingPageFooter {
  importantNotice: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export interface ReportingPageData {
  reportingPage: {
    header: ReportingPageHeader;
    navigation: ReportingPageNavigation;
    sections: ReportingPageSection[];
    footer: ReportingPageFooter;
  };
}
