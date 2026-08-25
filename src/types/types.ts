export type TemplateId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'corporate'
  | 'editorial'
  | 'executive'
  | 'swiss'
  | 'tech';

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  period: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  url: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string[];
}

export interface CVStyle {
  fontScale: number; // 0.8 – 1.3, base font-size multiplier
  fontFamily: string; // font stack id

  // Empty string = use theme default
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  surface: string;
  border: string;
}

export type CVSectionId =
  | 'summary'
  | 'skills'
  | 'experiences'
  | 'education'
  | 'projects'
  | 'interests'
  | 'certifications';

export type CVSectionColumn =
  | 'left'
  | 'right';

export type CVSectionTitles = Record<
  CVSectionId,
  string
>;

export interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photo: string;

  summary: string;

  skills: SkillCategory[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  interests: string[];
  certifications: Certification[];

  style: CVStyle;

  photoScale?: number;
  birthDate?: string;
  hasDrivingLicense?: boolean;

  sectionOrder: CVSectionId[];

  sectionTitles: CVSectionTitles;

  sectionColumns?: Partial<
    Record<
      CVSectionId,
      CVSectionColumn
    >
  >;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  surface: string;
  border: string;
}

export interface Theme {
  id: TemplateId;
  name: string;
  colors: ThemeColors;
  fontHeading: string;
  fontBody: string;
}

/**
 * =========================================================
 * TITRES PAR DÉFAUT DES SECTIONS
 * =========================================================
 */

export const DEFAULT_SECTION_TITLES: CVSectionTitles = {
  summary: 'Profil',
  skills: 'Compétences',
  experiences: 'Expériences',
  education: 'Formation',
  projects: 'Projets',
  interests: "Centres d'intérêt",
  certifications: 'Certifications',
};

/**
 * =========================================================
 * STYLE PAR DÉFAUT
 * =========================================================
 */

export const defaultStyle: CVStyle = {
  fontScale: 1,
  fontFamily: 'inter',

  primary: '',
  secondary: '',
  accent: '',
  text: '',
  muted: '',
  surface: '',
  border: '',
};

/**
 * =========================================================
 * CV VIDE / EXEMPLE
 * =========================================================
 */

export const emptyCV: CVData = {
  name: 'Alex Martin',
  title: 'Senior Product Designer',

  email: 'alex.martin@email.com',
  phone: '+33 6 12 34 56 78',
  location: 'Paris, France',

  website: 'alexmartin.design',
  linkedin: 'linkedin.com/in/alexmartin',
  github: 'github.com/alexmartin',

  photo: '/images/portrait.jpg',
  photoScale: 1.5,

  birthDate: '1990-02-15',
  hasDrivingLicense: false,

  sectionOrder: [
    'summary',
    'skills',
    'experiences',
    'education',
    'projects',
    'certifications',
    'interests',
  ],

  sectionTitles: {
    ...DEFAULT_SECTION_TITLES,
  },

  summary:
    'Product designer with 8+ years crafting digital experiences for startups and enterprises. I blend user research, interaction design, and systems thinking to ship products people love.',

  skills: [
    {
      id: 'sc1',
      name: 'Design',
      items: [
        'Figma',
        'Design Systems',
        'Prototyping',
        'User Research',
      ],
    },

    {
      id: 'sc2',
      name: 'Technique',
      items: [
        'React',
        'TypeScript',
        'Accessibility',
        'Design Ops',
      ],
    },

    {
      id: 'sc3',
      name: 'Systèmes',
      items: [
        'Linux',
        'Windows',
        'macOS',
      ],
    },
  ],

  experiences: [
    {
      id: 'e1',
      role: 'Senior Product Designer',
      company: 'Acme Corp',
      period: '2021 — Present',
      description:
        'Lead designer for the core product suite. Built the design system used across 6 product teams. Drove a redesign that lifted activation by 23%.',
    },

    {
      id: 'e2',
      role: 'Product Designer',
      company: 'Nimbus Labs',
      period: '2017 — 2021',
      description:
        'Owned end-to-end design for the mobile onboarding flow. Conducted 40+ user interviews and shipped a 3x faster signup experience.',
    },
  ],

  education: [
    {
      id: 'd1',
      degree: 'M.A. Interaction Design',
      school:
        'École Nationale Supérieure des Arts Décoratifs',
      period: '2015 — 2017',
      description:
        'Focus on HCI, prototyping, and speculative design.',
    },
  ],

  projects: [
    {
      id: 'p1',
      name: 'Atlas Design System',
      url: 'atlas.design',
      description:
        'Open-source design system with 120+ components, used by 3k+ teams.',
    },
  ],

  interests: [
    'Photographie',
    'Course à pied',
    'Cuisine japonaise',
    'Typographie',
  ],

  certifications: [],

  style: {
    ...defaultStyle,
  },
};