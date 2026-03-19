// Local candidate data — copy to candidate-profile.local.js (gitignored) and edit.
// `npm install` creates the local file from this example if it is missing.
(function (global) {
  global.__COVER_CANDIDATE_PROFILE__ = {
    identity: {
      fullName: 'Alex Morgan',
      title: 'Front-End Developer',
      location: 'Berlin, Germany',
      summary:
        'Front-end developer focused on product UI, design systems, and performance. Comfortable owning features end-to-end in React/TypeScript codebases and collaborating with design and backend teams.',
    },
    experience: {
      commercialYears: '4+ years',
      currentLevel: 'Mid-level Front-End Developer',
      focus: ['SaaS dashboards', 'marketing sites', 'component libraries'],
    },
    coreSkills: [
      'JavaScript (ES6+)',
      'TypeScript',
      'React',
      'Next.js',
      'HTML & semantic markup',
      'CSS (including Tailwind CSS)',
    ],
    secondarySkills: [
      'Node.js basics',
      'REST APIs',
      'Jest / React Testing Library',
      'CI-friendly tooling (ESLint, Prettier)',
      'Web performance (Core Web Vitals)',
    ],
    aiTools: ['IDE assistants', 'code review automation'],
    languages: [
      { name: 'English', level: 'C1' },
      { name: 'German', level: 'B1' },
    ],
    softSkills: [
      'clear written communication',
      'async collaboration across time zones',
      'pragmatic trade-offs under deadlines',
    ],
    education: [
      {
        degree: 'B.Sc. Computer Science',
        school: 'Example University',
        period: '2016 - 2020',
      },
    ],
    roles: [
      {
        company: 'Example SaaS Inc.',
        period: '2022 - Present',
        title: 'Front-End Developer',
        highlights: [
          'Shipped customer-facing analytics dashboards used by 10k+ weekly active users.',
          'Reduced largest contentful paint on the marketing site by ~35% via image strategy and bundle splitting.',
          'Introduced a shared React component library adopted by three product squads.',
        ],
      },
      {
        company: 'Studio North',
        period: '2020 - 2022',
        title: 'Junior Front-End Developer',
        highlights: [
          'Built responsive campaign landing pages with strong accessibility baselines.',
          'Partnered with designers to translate Figma specs into reusable components.',
        ],
      },
    ],
    achievements: [
      {
        id: 'dashboard_scale',
        title: 'Scaled analytics UI',
        metric: '10k+ WAU',
        keywords: ['react', 'dashboard', 'performance', 'typescript'],
        evidence:
          'Delivered analytics dashboards with stable performance as usage grew past 10k weekly active users.',
      },
      {
        id: 'web_perf',
        title: 'Improved marketing site performance',
        metric: '~35% LCP improvement',
        keywords: ['performance', 'lcp', 'seo', 'next.js'],
        evidence:
          'Cut largest contentful paint on the marketing site by roughly 35% through image optimization and bundle work.',
      },
      {
        id: 'design_system',
        title: 'Component library adoption',
        metric: '3 squads',
        keywords: ['design system', 'react', 'components', 'collaboration'],
        evidence:
          'Maintained a shared React component library adopted by three product teams.',
      },
    ],
    guardrails: {
      doNotClaim: [
        'native mobile (Swift/Kotlin) shipping experience',
        'staff/principal title',
        'formal team lead or people management',
        'expertise in languages not listed above',
      ],
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
