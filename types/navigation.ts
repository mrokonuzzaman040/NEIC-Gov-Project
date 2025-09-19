export interface NavigationLink {
  id: string;
  label: {
    en: string;
    bn: string;
  };
  href: string;
  icon: string;
  type: 'link';
}

export interface NavigationDropdown {
  id: string;
  label: {
    en: string;
    bn: string;
  };
  type: 'dropdown';
  icon: string;
  children: NavigationLink[];
}

export type NavigationItem = NavigationLink | NavigationDropdown;

export interface NavigationData {
  navigation: {
    main: NavigationItem[];
  };
}
