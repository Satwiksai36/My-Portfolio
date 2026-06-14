export interface Stat {
  label: string;
  target: number;
  suffix: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  tagline: string;
  stack: string[];
  image: string;
  year: string;
  link?: string;
  github?: string;
}

export interface EducationItem {
  year: string;
  role: string;
  branch?: string;
  company: string;
  type: string;
  bullets: string[];
  stack: string[];
  logo?: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface PortfolioData {
  // Personal Info
  fullName: string;
  firstName: string;
  lastName: string;
  brandName: string;
  title: string;
  tagline: string;
  shortBio: string;
  subBio: string;
  email: string;
  location: string;
  responseTime: string;
  statusText: string;
  availabilityStatus: string;
  resumeUrl: string;
  resumeFilename: string;
  headshotImage: string;
  baseUrl: string;
  twitterHandle: string;

  // Assets
  logoWhite: string;
  logoWhiteHorizontal: string;
  logoBlack?: string;
  logoBlackHorizontal?: string;
  heroSideLabel?: string;
  heroVideo?: string;
  heroPoster?: string;

  // Social Links
  socials: {
    github: string;
    linkedin: string;
    x: string;
    instagram: string;
    leetcode: string;
  };

  // Section specific arrays
  stats: Stat[];
  heroStackTags: string[];
  aboutQuoteWords: string[];
  projects: Project[];
  education: EducationItem[];
  skills?: { id?: string; name: string; category: string; percentage?: number; icon?: string }[];
  services?: { index?: string; title: string; short: string; body: string; keywords: string[] }[];
  certifications?: { num?: string; title: string; issuer: string; year: string; file: string }[];
  floatingWords?: string[];
  credentialsFloatWords?: string[];
  skillsHeadline1?: string;
  skillsHeadline2?: string;
  skillsTagline?: string;
  customTechLogos?: Record<string, string>;
  socialsList?: { label: string; href: string; logo?: string }[];
}

export const PORTFOLIO_DATA: PortfolioData = {
  fullName: '',
  firstName: '',
  lastName: '',
  brandName: '',
  title: '',
  tagline: '',
  shortBio: '',
  subBio: '',
  email: '',
  location: '',
  responseTime: '',
  statusText: '',
  availabilityStatus: '',
  resumeUrl: '',
  resumeFilename: '',
  headshotImage: '',
  baseUrl: '',
  twitterHandle: '',

  logoWhite: '',
  logoWhiteHorizontal: '',
  logoBlack: '',
  logoBlackHorizontal: '',
  heroSideLabel: '',
  heroVideo: '',
  heroPoster: '',
  socials: {
    github: '',
    linkedin: '',
    x: '',
    instagram: '',
    leetcode: '',
  },

  stats: [
    { label: 'Years of Experience', target: 0, suffix: '+' },
  ],

  heroStackTags: [],
  floatingWords: [],
  credentialsFloatWords: [],

  skillsHeadline1: '',
  skillsHeadline2: '',
  skillsTagline: '',
  customTechLogos: {},

  aboutQuoteWords: [],

  projects: [],

  education: [],
  services: [],
  certifications: [],
  skills: [],
  socialsList: []
};

export const getAutoLogoUrl = (name: string): string => {
  if (!name.trim()) return '';
  const lower = name.toLowerCase().trim();
  const mappings: Record<string, string> = {
    'c++': 'cplusplus',
    'c#': 'csharp',
    'f#': 'fsharp',
    'node.js': 'nodedotjs',
    'nodejs': 'nodedotjs',
    'next.js': 'nextdotjs',
    'nextjs': 'nextdotjs',
    'vue.js': 'vuedotjs',
    'vuejs': 'vuedotjs',
    'three.js': 'threedotjs',
    'threejs': 'threedotjs',
    'angular.js': 'angulardotjs',
    'angularjs': 'angulardotjs',
    'react native': 'react',
    'reactjs': 'react',
    'tailwind css': 'tailwindcss',
    'tailwindcss': 'tailwindcss',
    'tailwind': 'tailwindcss',
    'express.js': 'express',
    'expressjs': 'express',
    'express': 'express',
    'golang': 'go',
    'nest.js': 'nestdotjs',
    'nestjs': 'nestdotjs',
    'nuxt.js': 'nuxtdotjs',
    'nuxtjs': 'nuxtdotjs',
    'chart.js': 'chartdotjs',
    'd3.js': 'd3dotjs',
    'rxjs': 'reactivex',
    'amazon web services': 'amazonwebservices',
    'aws': 'amazonwebservices',
    'amazon': 'amazonwebservices',
    'github': 'github',
    'git': 'git',
    'postgre sql': 'postgresql',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'mongodb': 'mongodb',
    'mongo': 'mongodb',
    'ms sql': 'microsoftsqlserver',
    'sql server': 'microsoftsqlserver',
    'mysql': 'mysql',
    'sqlite': 'sqlite',
    'graphql': 'graphql',
    'apollo': 'apollographql',
    'visual studio code': 'visualstudiocode',
    'vscode': 'visualstudiocode',
    'github actions': 'githubactions',
    'power bi': 'powerbi',
    'scikit-learn': 'scikitlearn',
    'scikit learn': 'scikitlearn',
    'tensorflow': 'tensorflow',
    'pytorch': 'pytorch',
    'numpy': 'numpy',
    'pandas': 'pandas',
    'fastapi': 'fastapi',
    'html': 'html5',
    'css': 'css',
    'java': 'openjdk',
    'sass': 'sass',
    'scss': 'sass',
    'js': 'javascript',
    'ts': 'typescript',
  };

  const slug = mappings[lower] || lower
    .replace(/\.js$/, 'dotjs')
    .replace(/[^a-z0-9]/g, '');

  const darkLogos = ['github', 'apple', 'nextdotjs', 'vercel', 'express', 'flask', 'socketdotio', 'precommit', 'hugo', 'mdx', 'electron'];
  if (darkLogos.includes(slug)) {
    return `https://cdn.simpleicons.org/${slug}/_/fff`;
  }
  return `https://cdn.simpleicons.org/${slug}`;
};

export const normalizeIconUrl = (url: string | undefined, isDark?: boolean): string => {
  if (!url) return '';

  let cleanUrl = url;
  if (url.includes('cdn.jsdelivr.net/npm/simple-icons')) {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    let slug = lastPart.replace('.svg', '').toLowerCase().trim();
    if (slug === 'java') slug = 'openjdk';
    if (slug === 'css3') slug = 'css';
    cleanUrl = `https://cdn.simpleicons.org/${slug}`;
  }

  if (cleanUrl.includes('cdn.simpleicons.org')) {
    const match = cleanUrl.match(/cdn\.simpleicons\.org\/([^/]+)/);
    if (match) {
      let slug = match[1].toLowerCase().trim();
      if (slug === 'java') slug = 'openjdk';
      if (slug === 'css3') slug = 'css';

      const darkLogos = ['github', 'apple', 'nextdotjs', 'vercel', 'express', 'flask', 'socketdotio', 'precommit', 'hugo', 'mdx', 'electron'];
      if (darkLogos.includes(slug)) {
        if (isDark !== undefined) {
          return `https://cdn.simpleicons.org/${slug}/${isDark ? 'fff' : '000'}`;
        }
        return `https://cdn.simpleicons.org/${slug}/_/fff`;
      }
      return `https://cdn.simpleicons.org/${slug}`;
    }
  }

  return cleanUrl;
};


