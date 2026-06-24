import type { Metadata } from 'next';
import { Instrument_Serif, Special_Gothic_Expanded_One } from 'next/font/google';
import './globals.css';

import { getPortfolioData } from '@/lib/dataManager';
import { PortfolioProvider } from '@/lib/PortfolioContext';
import { ThemeProvider } from '@/lib/ThemeProvider';


const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

const specialGothic = Special_Gothic_Expanded_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-special-gothic',
  display: 'swap',
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const BASE_URL = data.baseUrl && data.baseUrl.startsWith('http') ? data.baseUrl : 'http://localhost:3000';

  return {
    metadataBase: new URL(BASE_URL),

    title: {
      default: `${data.fullName} | ${data.title}`,
      template: `%s | ${data.fullName}`,
    },

    description: `${data.fullName} (${data.brandName}) — ${data.shortBio} Available for hire — ${data.location.toLowerCase()}.`,

    keywords: [
      data.fullName,
      data.brandName,
      (data.baseUrl || 'localhost:3000').replace(/^https?:\/\//i, ''),
      `${data.brandName || 'Portfolio'} developer`,
      'Full Stack Engineer',
      'Full Stack Developer',
      'Software Engineer',
      'Web Developer',
      'Frontend Developer',
      'Backend Engineer',
      'React Developer',
      'Next.js Developer',
      'Next.js Expert',
      'Django Developer',
      'Go Developer',
      'Golang Developer',
      'TypeScript Developer',
      'Node.js Developer',
      'Python Developer',
      'hire full stack developer',
      'hire Next.js developer',
      'hire React developer',
      'hire software engineer',
      'hire web developer',
      'freelance full stack developer',
      'freelance software engineer',
      'freelance web developer',
      'remote software engineer for hire',
      'contract developer',
      'available for hire',
      'Next.js',
      'React',
      'Django',
      'Go',
      'PostgreSQL',
      'Redis',
      'AWS',
      'Docker',
      'TypeScript',
      'Node.js',
      'REST API development',
      'GraphQL',
      'Microservices',
      'CI/CD',
      'cloud engineer',
      'Full Stack Developer portfolio',
      'Software Engineer portfolio',
      'Web Developer portfolio',
      'remote developer worldwide',
      'enterprise web development',
      'scalable web applications',
      'production-grade web systems',
      'high-performance web apps',
    ],

    authors: [{ name: data.fullName, url: BASE_URL }],
    creator: data.fullName,
    publisher: data.fullName,

    icons: {
      icon: [{ url: data.logoWhite, type: 'image/png' }],
      apple: data.logoWhite,
      shortcut: data.logoWhite,
    },

    openGraph: {
      type: 'website',
      url: BASE_URL,
      siteName: `${data.brandName} — ${data.fullName}`,
      title: `${data.fullName} | ${data.title}`,
      description: `${data.stats.find(s => s.label.includes('Experience'))?.target ?? 5}+ years building high-performance web systems. Next.js · React · Django · Go · PostgreSQL · AWS. Available for hire — remote, worldwide.`,
      locale: 'en_US',
    },

    twitter: {
      card: 'summary_large_image',
      site: data.twitterHandle,
      creator: data.twitterHandle,
      title: `${data.fullName} | ${data.title}`,
      description: `${data.stats.find(s => s.label.includes('Experience'))?.target ?? 5}+ years building production-grade web systems. Next.js · Django · Go · PostgreSQL · AWS. Available for hire worldwide.`,
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: BASE_URL,
      languages: {
        'en-US': BASE_URL,
        'en-GB': BASE_URL,
      },
    },

    category: 'technology',

    appleWebApp: {
      capable: true,
      title: data.brandName,
      statusBarStyle: 'black-translucent',
    },

    other: {
      'theme-color': '#0A0A0A',
      'msapplication-TileColor': '#0A0A0A',
      'application-name': data.brandName,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getPortfolioData();
  const BASE_URL = data.baseUrl && data.baseUrl.startsWith('http') ? data.baseUrl : 'http://localhost:3000';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    name: data.fullName,
    alternateName: [data.brandName, `${data.lastName} ${data.firstName}`],
    url: BASE_URL,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}${data.logoWhiteHorizontal || '/logo/weblogo-white.png'}`,
      width: 1200,
      height: 630,
    },
    jobTitle: 'Full Stack Engineer',
    description: `${data.title} with ${data.stats.find(s => s.label.includes('Experience'))?.target ?? 5}+ years experience building scalable, production-grade web applications using ${data.heroStackTags.join(', ')}.`,
    email: data.email,
    nationality: { '@type': 'Country', name: 'Worldwide' },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full Stack Engineer',
      description: 'Designs, develops, and deploys scalable full-stack web applications for clients worldwide.',
      occupationLocation: { '@type': 'Country', name: 'Worldwide' },
      skills: data.heroStackTags.join(', '),
    },
    knowsAbout: [
      'Next.js', 'React', 'TypeScript', 'JavaScript',
      'Django', 'Python', 'Go', 'Node.js',
      'PostgreSQL', 'Redis', 'MongoDB',
      'AWS', 'Docker', 'Kubernetes',
      'REST APIs', 'GraphQL', 'Microservices',
      'CI/CD', 'DevOps', 'Cloud Architecture',
      'Web Performance Optimisation', 'System Design',
    ],
    sameAs: Object.values(data.socials),
    contactPoint: {
      '@type': 'ContactPoint',
      email: data.email,
      contactType: 'professional inquiry',
      availableLanguage: 'English',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: `${data.brandName} — ${data.fullName}`,
    description: `Portfolio and professional profile of ${data.fullName} — ${data.title}.`,
    author: { '@id': `${BASE_URL}/#person` },
    publisher: { '@id': `${BASE_URL}/#person` },
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${BASE_URL}/#profilepage`,
    url: BASE_URL,
    name: `${data.fullName} — ${data.title} Portfolio`,
    description: `Professional portfolio of ${data.fullName} (${data.brandName}), a ${data.title} with ${data.stats.find(s => s.label.includes('Experience'))?.target ?? 5}+ years of experience.`,
    dateCreated: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: { '@id': `${BASE_URL}/#person` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BASE_URL,
        },
      ],
    },
  };

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${specialGothic.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash-of-wrong-theme: apply theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var t=localStorage.getItem('theme')||'light';
                  var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;
                  document.documentElement.setAttribute('data-theme',r);
                  if(r==='dark') document.documentElement.classList.add('dark');
                }catch(e){}
              })()
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
      </head>
      <body className="antialiased">
        <PortfolioProvider initialData={data}>
          <ThemeProvider>
            {children}

          </ThemeProvider>
        </PortfolioProvider>
      </body>
    </html>
  );
}
