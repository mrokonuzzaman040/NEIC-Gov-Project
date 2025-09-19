export interface LocalizedText {
  en: string;
  bn: string;
}

export interface HomePageHeader {
  title: LocalizedText;
  subtitle: LocalizedText;
  portal: LocalizedText;
  tagline: LocalizedText;
}

export interface HeroStat {
  id: string;
  value: string | LocalizedText;
  label: LocalizedText;
}

export interface HomePageHero {
  stats: HeroStat[];
}

export interface SectionItem {
  key: string;
}

export interface SectionLink {
  href: string;
  text: LocalizedText;
}

export interface QuickLink {
  href: string;
  icon: string;
  key: string;
}

export interface HomePageSection {
  id: string;
  icon: string;
  color: 'blue' | 'green' | 'purple';
  titleKey: string;
  textKey: string;
  items?: SectionItem[];
  link?: SectionLink;
  links?: QuickLink[];
}

export interface HomePageFooter {
  title: LocalizedText;
  subtitle: LocalizedText;
  copyright: LocalizedText;
}

export interface HomePageData {
  homePage: {
    header: HomePageHeader;
    hero: HomePageHero;
    sections: HomePageSection[];
    footer: HomePageFooter;
  };
}
