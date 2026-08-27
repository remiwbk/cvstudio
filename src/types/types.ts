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

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface CVStyle {
  fontScale: number;
  fontFamily: string;

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
  | 'technicalSkills'
  | 'softSkills'
  | 'experiences'
  | 'education'
  | 'projects'
  | 'interests'
  | 'certifications'
  | 'languages';

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

  technicalSkills: SkillCategory[];
  softSkills: string[];

  experiences: Experience[];
  education: Education[];
  projects: Project[];
  interests: string[];
  certifications: Certification[];
  languages: Language[];

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
  technicalSkills: 'Compétences techniques',
  softSkills: 'Compétences générales',
  experiences: 'Expériences',
  education: 'Formation',
  projects: 'Projets',
  interests: "Centres d'intérêt",
  certifications: 'Certifications',
  languages: 'Langues',
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
  title: 'Responsable marketing digital',

  email: 'alex.martin@email.fr',
  phone: '06 12 34 56 78',
  location: 'Lyon, France',

  website: 'alexmartin.fr',
  linkedin: 'linkedin.com/in/alexmartin',
  github: 'github.com/alexmartin',

  photo: '/images/portrait.jpg',
  photoScale: 1.5,

  birthDate: '1992-05-18',
  hasDrivingLicense: true,

  sectionOrder: [
    'summary',
    'technicalSkills',
    'softSkills',
    'experiences',
    'education',
    'projects',
    'languages',
    'certifications',
    'interests',
  ],

  sectionTitles: {
    ...DEFAULT_SECTION_TITLES,
  },

  summary:
    'Professionnelle du marketing digital avec plus de 7 ans d’expérience dans la conception et le déploiement de stratégies numériques. J’allie analyse des données, créativité et gestion de projet pour développer la visibilité des marques et améliorer leurs performances.',

  technicalSkills: [
    {
      id: 'ts1',
      name: 'Marketing',
      items: [
        'Stratégie digitale',
        'SEO',
        'SEA',
        'Réseaux sociaux',
      ],
    },

    {
      id: 'ts2',
      name: 'Outils',
      items: [
        'Google Analytics',
        'Google Ads',
        'Figma',
        'WordPress',
      ],
    },

    {
      id: 'ts3',
      name: 'Analyse',
      items: [
        'Analyse de données',
        'Reporting',
        'KPI',
        'Études de marché',
      ],
    },
  ],

  softSkills: [
    'Communication',
    'Travail en équipe',
    'Autonomie',
    'Rigueur',
    'Gestion de projet',
    'Esprit d’analyse',
  ],

  experiences: [
    {
      id: 'e1',
      role: 'Responsable marketing digital',
      company: 'Nova Solutions',
      period: '2021 — Aujourd’hui',
      description:
        'Pilotage de la stratégie digitale et des campagnes d’acquisition. Mise en place d’un plan SEO ayant permis d’augmenter le trafic organique de 35 %. Gestion des campagnes publicitaires et suivi des principaux indicateurs de performance.',
    },

    {
      id: 'e2',
      role: 'Chargée de marketing digital',
      company: 'Studio Horizon',
      period: '2018 — 2021',
      description:
        'Création et gestion de campagnes digitales, animation des réseaux sociaux et production de contenus. Analyse des performances et mise en place de recommandations pour améliorer l’engagement et les conversions.',
    },
  ],

  education: [
    {
      id: 'd1',
      degree: 'Master Marketing digital',
      school: 'Université Lumière Lyon 2',
      period: '2016 — 2018',
      description:
        'Spécialisation en stratégie digitale, communication numérique, analyse de données et gestion de projet.',
    },
  ],

  projects: [
    {
      id: 'p1',
      name: 'Refonte du site e-commerce',
      url: 'projet-exemple.fr',
      description:
        'Pilotage de la refonte d’un site e-commerce avec pour objectifs d’améliorer l’expérience utilisateur, le référencement naturel et le taux de conversion.',
    },
  ],

  interests: [
    'Photographie',
    'Course à pied',
    'Voyages',
    'Cuisine',
  ],

  certifications: [],

  languages: [
    {
      id: 'l1',
      name: 'Français',
      level: 'Langue maternelle',
    },
    {
      id: 'l2',
      name: 'Anglais',
      level: 'Courant',
    },
    {
      id: 'l3',
      name: 'Espagnol',
      level: 'Intermédiaire',
    },
  ],

  style: {
    ...defaultStyle,
  },
};