const __COVER_CANDIDATE_GLOBAL__ =
  typeof window !== 'undefined' ? window : globalThis;

const CANDIDATE_PROFILE = {
  identity: {
    fullName: 'Mykhailo Horodnytskyi',
    title: 'Front-End Developer',
    location: 'Warsaw, Poland',
    summary:
      'Front-end developer with 3+ years of experience in e-commerce solutions using Next.js, React, and Svelte. Advocates AI workflow and automation, quickly adopts new technologies, and collaborates effectively in cross-functional teams.',
  },
  experience: {
    commercialYears: '3+ years',
    currentLevel: 'Middle Front-End Developer',
    focus: ['e-commerce', 'web applications', 'interactive marketing websites'],
  },
  coreSkills: [
    'JavaScript (ES6+)',
    'TypeScript',
    'React',
    'Next.js',
    'Svelte',
    'SvelteKit',
    'Tailwind CSS',
  ],
  secondarySkills: [
    'PHP',
    'Blade templating',
    'anime.js',
    'responsive layouts',
    'SEO optimization',
    'data parsing',
    'TensorFlow-based frontend features',
  ],
  aiTools: ['Cursor', 'v0', 'Lovable', 'Bolt', 'MCP automation'],
  languages: [
    { name: 'English', level: 'B2' },
    { name: 'Polish', level: 'A1' },
    { name: 'Russian', level: 'C2' },
    { name: 'Ukrainian', level: 'C2' },
  ],
  softSkills: [
    'fast learner',
    'proactive communicator',
    'strong cross-functional collaboration',
    'comfortable presenting ideas to developers',
    'effective under tight deadlines',
  ],
  education: [
    {
      degree: 'Bachelor in Computer Science',
      school: 'National University "Yuri Kondratyuk Poltava Polytechnic"',
      period: 'Sep 2022 - Jun 2026',
    },
  ],
  roles: [
    {
      company: 'Redentu',
      period: 'Mar 2024 - Present',
      title: 'Middle Front-End Developer',
      highlights: [
        'Created and worked with more than 10 successful e-commerce projects, including an e-ticket product and the Ukrainian Association of Football merchandise website.',
        'Improved team efficiency by 30% by integrating AI tools such as Cursor, v0, and Lovable.',
        'Built a Trello MCP extension that improved PM and QA productivity by 20-25%.',
        'Presented workflow innovations that are now used by developers in the team.',
        'Improved existing project architectures using SOLID principles.',
      ],
    },
    {
      company: 'Smedia Digital Agency',
      period: 'Dec 2022 - Feb 2024',
      title: 'Junior Front-End Developer',
      highlights: [
        'Built interactive and highly optimized websites using anime.js and modern frontend tooling.',
        'Created frontend solutions for Matisque, Yulia-Style, Sash Home Textile, the Smedia Digital agency site, and the ROZGLOS web application.',
        'Optimized and tested backend applications in PHP and built pages with Blade templating.',
      ],
    },
    {
      company: 'Trainee Internship',
      period: '3 months',
      title: 'Front-End Engineer',
      highlights: [
        'Developed interactive UI components using JavaScript and animation libraries.',
        'Worked on responsive layouts, optimization, debugging, and browser compatibility.',
      ],
    },
    {
      company: 'Freelance',
      period: 'Jan 2021 - Apr 2024',
      title: 'Front-End Developer',
      highlights: [
        'Developed landing pages and SEO-focused solutions.',
        'Worked with data parsing and a gas station search application.',
        'Built AI-based frontend features using TensorFlow for real-time environment scanning.',
      ],
    },
  ],
  achievements: [
    {
      id: 'ecommerce_delivery',
      title: 'Delivered 10+ e-commerce projects',
      metric: '10+ projects',
      keywords: [
        'e-commerce',
        'next.js',
        'react',
        'storefront',
        'web applications',
      ],
      evidence:
        'Created and worked with more than 10 successful e-commerce projects, including an e-ticket product and the Ukrainian Association of Football merchandise website.',
    },
    {
      id: 'ai_efficiency',
      title: 'Improved team efficiency with AI',
      metric: '30% efficiency boost',
      keywords: ['ai', 'automation', 'cursor', 'v0', 'lovable', 'productivity'],
      evidence:
        'Optimized team work by 30% by integrating AI technologies such as Cursor, v0, and Lovable.',
    },
    {
      id: 'mcp_extension',
      title: 'Built Trello MCP extension',
      metric: '20-25% PM/QA productivity boost',
      keywords: [
        'mcp',
        'automation',
        'trello',
        'productivity',
        'tools',
        'internal tooling',
      ],
      evidence:
        'Built an MCP server extension for Trello that streamlined task management and improved PM and QA productivity by 20-25%.',
    },
    {
      id: 'architecture',
      title: 'Improved architecture quality',
      metric: 'SOLID-driven improvements',
      keywords: ['architecture', 'solid', 'scalability', 'maintainability'],
      evidence:
        'Improved the architecture of existing projects based on SOLID principles.',
    },
    {
      id: 'interactive_sites',
      title: 'Built interactive marketing websites',
      metric: 'multiple production websites',
      keywords: [
        'animation',
        'anime.js',
        'interactive',
        'performance',
        'responsive',
      ],
      evidence:
        'Created interactive websites with anime.js and strong optimization for brands and agency clients.',
    },
    {
      id: 'php_blade',
      title: 'Worked with PHP and Blade',
      metric: 'production backend-connected pages',
      keywords: ['php', 'blade', 'backend', 'templating'],
      evidence:
        'Optimized and tested backend applications in PHP and developed pages using Blade templating.',
    },
    {
      id: 'tensorflow_features',
      title: 'Built AI-based frontend features',
      metric: 'real-time environment scanning',
      keywords: ['tensorflow', 'ai', 'frontend features', 'computer vision'],
      evidence:
        'Built AI-based frontend features using TensorFlow for real-time environment scanning.',
    },
  ],
  guardrails: {
    doNotClaim: [
      'native mobile development experience',
      'backend ownership beyond PHP/Blade support work',
      'senior or lead title',
      'Polish fluency',
    ],
  },
};

function formatProfileSection(title, values) {
  if (!Array.isArray(values) || values.length === 0) return '';
  return `${title}: ${values.join(', ')}`;
}

function buildProfileSnapshot(profile = CANDIDATE_PROFILE) {
  const sections = [
    `Candidate: ${profile.identity.fullName}`,
    `Title: ${profile.identity.title}`,
    `Location: ${profile.identity.location}`,
    `Summary: ${profile.identity.summary}`,
    `Commercial experience: ${profile.experience.commercialYears}`,
    formatProfileSection('Core skills', profile.coreSkills),
    formatProfileSection('Secondary skills', profile.secondarySkills),
    formatProfileSection('AI tools', profile.aiTools),
    formatProfileSection(
      'Languages',
      profile.languages.map(
        (language) => `${language.name} (${language.level})`
      )
    ),
    formatProfileSection('Soft skills', profile.softSkills),
  ].filter(Boolean);

  return sections.join('\n');
}

__COVER_CANDIDATE_GLOBAL__.CoverCandidateProfile = {
  PROFILE: CANDIDATE_PROFILE,
  buildProfileSnapshot,
};
