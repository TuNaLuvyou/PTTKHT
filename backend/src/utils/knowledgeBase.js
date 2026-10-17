// ============================================================
// knowledge-base.ts — CV Analyzer Knowledge Base + Fallback Engine
// Supports: keyword scoring, experience detection, section parsing,
// skill synonym matching, and full local CV analysis when API is unavailable.
//
// Plain-JS port (1:1) of
// backend/src/cv-scoring/constants/knowledge-base.ts
// ============================================================

// ─────────────────────────────────────────────
// 1. ROLE KNOWLEDGE BASE (keywords per role)
// ─────────────────────────────────────────────

const ROLE_KNOWLEDGE_BASE = {
  frontend: [
    'react',
    'vue',
    'angular',
    'nextjs',
    'nuxtjs',
    'typescript',
    'javascript',
    'es6',
    'html',
    'html5',
    'css',
    'css3',
    'tailwind',
    'bootstrap',
    'sass',
    'scss',
    'less',
    'redux',
    'zustand',
    'context api',
    'recoil',
    'mobx',
    'webpack',
    'vite',
    'rollup',
    'parcel',
    'babel',
    'ui/ux',
    'responsive',
    'accessibility',
    'wcag',
    'storybook',
    'react query',
    'swr',
    'graphql client',
    'apollo client',
    'jest',
    'vitest',
    'testing library',
    'cypress',
    'playwright',
    'pwa',
    'web performance',
    'core web vitals',
    'seo',
  ],
  backend: [
    'nodejs',
    'node.js',
    'nest',
    'nestjs',
    'express',
    'fastify',
    'koa',
    'java',
    'spring boot',
    'spring',
    'maven',
    'gradle',
    'python',
    'django',
    'flask',
    'fastapi',
    'c#',
    '.net',
    'asp.net',
    'dotnet',
    'golang',
    'go',
    'gin',
    'fiber',
    'php',
    'laravel',
    'symfony',
    'ruby',
    'rails',
    'sql',
    'mysql',
    'postgresql',
    'postgres',
    'sqlite',
    'oracle',
    'mssql',
    'mongodb',
    'mongoose',
    'redis',
    'elasticsearch',
    'cassandra',
    'api',
    'rest',
    'restful',
    'graphql',
    'grpc',
    'websocket',
    'microservices',
    'message queue',
    'rabbitmq',
    'kafka',
    'docker',
    'orm',
    'prisma',
    'typeorm',
    'hibernate',
    'sequelize',
    'jwt',
    'oauth',
    'authentication',
    'authorization',
    'rbac',
    'caching',
    'rate limiting',
    'load balancing',
  ],
  mobile: [
    'flutter',
    'react native',
    'swift',
    'swiftui',
    'ios',
    'kotlin',
    'android',
    'dart',
    'objective-c',
    'jetpack compose',
    'xcode',
    'android studio',
    'mobile app',
    'mobile development',
    'firebase',
    'push notification',
    'app store',
    'google play',
    'sqlite',
    'realm',
    'hive',
    'local storage',
    'retrofit',
    'dio',
    'alamofire',
    'bloc',
    'provider',
    'riverpod',
    'getx',
    'redux',
    'biometric',
    'camera',
    'gps',
    'geolocation',
  ],
  devops: [
    'docker',
    'docker compose',
    'kubernetes',
    'k8s',
    'helm',
    'jenkins',
    'gitlab ci',
    'github actions',
    'circleci',
    'travis',
    'ci/cd',
    'pipeline',
    'devops',
    'sre',
    'platform engineering',
    'terraform',
    'ansible',
    'puppet',
    'chef',
    'pulumi',
    'aws',
    'ec2',
    's3',
    'lambda',
    'ecs',
    'eks',
    'rds',
    'cloudfront',
    'azure',
    'gcp',
    'google cloud',
    'linux',
    'ubuntu',
    'centos',
    'bash',
    'shell scripting',
    'nginx',
    'apache',
    'haproxy',
    'prometheus',
    'grafana',
    'elk',
    'datadog',
    'splunk',
    'newrelic',
    'networking',
    'vpc',
    'dns',
    'ssl',
    'cdn',
    'security',
    'iam',
    'vault',
    'sops',
  ],
  data: [
    'python',
    'r',
    'sql',
    'machine learning',
    'ml',
    'deep learning',
    'dl',
    'neural network',
    'data analysis',
    'data analytics',
    'data science',
    'data engineering',
    'data visualization',
    'bi',
    'business intelligence',
    'pandas',
    'numpy',
    'scipy',
    'matplotlib',
    'seaborn',
    'plotly',
    'scikit-learn',
    'sklearn',
    'tensorflow',
    'keras',
    'pytorch',
    'spark',
    'pyspark',
    'hadoop',
    'hive',
    'airflow',
    'dbt',
    'tableau',
    'power bi',
    'looker',
    'metabase',
    'big data',
    'data warehouse',
    'data lake',
    'etl',
    'elt',
    'statistics',
    'regression',
    'classification',
    'clustering',
    'nlp',
    'computer vision',
    'transformers',
    'llm',
    'rag',
    'feature engineering',
    'model deployment',
    'mlops',
  ],
  tester: [
    'automation test',
    'manual test',
    'automation testing',
    'manual testing',
    'selenium',
    'cypress',
    'playwright',
    'puppeteer',
    'jest',
    'mocha',
    'jasmine',
    'junit',
    'testng',
    'unit test',
    'integration test',
    'e2e test',
    'regression test',
    'test case',
    'test plan',
    'test strategy',
    'test report',
    'bug report',
    'defect management',
    'tdd',
    'bdd',
    'jira',
    'testlink',
    'testrail',
    'xray',
    'postman',
    'api testing',
    'rest assured',
    'karate',
    'performance testing',
    'jmeter',
    'locust',
    'k6',
    'security testing',
    'penetration testing',
    'qa',
    'qc',
    'quality assurance',
    'quality control',
  ],
  design: [
    'figma',
    'adobe xd',
    'sketch',
    'invision',
    'framer',
    'photoshop',
    'illustrator',
    'indesign',
    'after effects',
    'ui/ux',
    'ux design',
    'ui design',
    'product design',
    'design thinking',
    'design system',
    'atomic design',
    'wireframe',
    'prototype',
    'mockup',
    'user flow',
    'user research',
    'usability testing',
    'a/b testing',
    'graphic design',
    'visual design',
    'branding',
    'identity',
    'layout',
    'typography',
    'color theory',
    'grid system',
    'motion design',
    'animation',
    'lottie',
    'principle',
  ],
  management: [
    'project management',
    'product management',
    'program management',
    'agile',
    'scrum',
    'kanban',
    'lean',
    'safe',
    'scaled agile',
    'sprint',
    'retrospective',
    'backlog',
    'roadmap',
    'requirement',
    'srs',
    'brd',
    'user story',
    'use case',
    'product owner',
    'scrum master',
    'tech lead',
    'team lead',
    'stakeholder',
    'stakeholder management',
    'communication',
    'jira',
    'trello',
    'asana',
    'notion',
    'confluence',
    'risk management',
    'budget',
    'planning',
    'estimation',
    'ba',
    'business analyst',
    'system analyst',
    'business analysis',
  ],
  marketing: [
    'seo',
    'sem',
    'seo/sem',
    'content marketing',
    'content strategy',
    'social media',
    'social media marketing',
    'smm',
    'google ads',
    'facebook ads',
    'meta ads',
    'tiktok ads',
    'email marketing',
    'marketing automation',
    'hubspot',
    'mailchimp',
    'analytics',
    'google analytics',
    'ga4',
    'mixpanel',
    'marketing strategy',
    'branding',
    'brand identity',
    'copywriting',
    'content writing',
    'blog',
    'landing page',
    'conversion rate',
    'cro',
    'growth hacking',
    'funnel',
    'affiliate marketing',
    'influencer marketing',
    'kol',
  ],
  soft_skills: [
    'teamwork',
    'team player',
    'collaboration',
    'communication',
    'presentation',
    'public speaking',
    'problem solving',
    'critical thinking',
    'analytical thinking',
    'time management',
    'self management',
    'prioritization',
    'leadership',
    'mentoring',
    'coaching',
    'adaptability',
    'flexibility',
    'continuous learning',
    'creativity',
    'innovation',
    'english',
    'tiếng anh',
    'ielts',
    'toeic',
    'toefl',
    'japanese',
    'tiếng nhật',
    'jlpt',
    'chinese',
    'tiếng trung',
  ],
};

// ─────────────────────────────────────────────
// 2. ROLE MAPPING
// ─────────────────────────────────────────────

const ROLE_MAPPING = {
  frontend: 'frontend',
  'front-end': 'frontend',
  'front end': 'frontend',
  web: 'frontend',
  'web developer': 'frontend',
  backend: 'backend',
  'back-end': 'backend',
  'back end': 'backend',
  server: 'backend',
  node: 'backend',
  java: 'backend',
  python: 'backend',
  fullstack: ['frontend', 'backend'],
  'full-stack': ['frontend', 'backend'],
  'full stack': ['frontend', 'backend'],
  mobile: 'mobile',
  android: 'mobile',
  ios: 'mobile',
  flutter: 'mobile',
  'react native': 'mobile',
  devops: 'devops',
  cloud: 'devops',
  aws: 'devops',
  infrastructure: 'devops',
  sre: 'devops',
  platform: 'devops',
  data: 'data',
  ai: 'data',
  'machine learning': 'data',
  'data scientist': 'data',
  'data analyst': 'data',
  'data engineer': 'data',
  tester: 'tester',
  qa: 'tester',
  qc: 'tester',
  'quality assurance': 'tester',
  'kiểm thử': 'tester',
  automation: 'tester',
  design: 'design',
  ui: 'design',
  ux: 'design',
  designer: 'design',
  'ui/ux': 'design',
  graphic: 'design',
  manager: 'management',
  pm: 'management',
  ba: 'management',
  analyst: 'management',
  'scrum master': 'management',
  'product owner': 'management',
  'tech lead': 'management',
  'team lead': 'management',
  marketing: 'marketing',
  seo: 'marketing',
  sale: 'marketing',
  sales: 'marketing',
  growth: 'marketing',
};

// ─────────────────────────────────────────────
// 3. SKILL WEIGHTS (importance per role)
//    3 = core, 2 = important, 1 = bonus
// ─────────────────────────────────────────────

const SKILL_WEIGHTS = {
  frontend: {
    react: 3,
    vue: 3,
    angular: 3,
    nextjs: 3,
    typescript: 3,
    javascript: 3,
    html: 2,
    css: 2,
    tailwind: 2,
    responsive: 2,
    redux: 2,
    webpack: 1,
    vite: 1,
    'testing library': 2,
    jest: 2,
  },
  backend: {
    nodejs: 3,
    java: 3,
    python: 3,
    golang: 3,
    'c#': 3,
    'spring boot': 3,
    nestjs: 3,
    express: 2,
    postgresql: 3,
    mysql: 3,
    mongodb: 3,
    redis: 2,
    docker: 2,
    microservices: 3,
    restful: 3,
    graphql: 2,
    jwt: 2,
    kafka: 2,
  },
  mobile: {
    flutter: 3,
    'react native': 3,
    swift: 3,
    kotlin: 3,
    dart: 2,
    ios: 2,
    android: 2,
    firebase: 2,
    bloc: 2,
    provider: 2,
  },
  devops: {
    docker: 3,
    kubernetes: 3,
    aws: 3,
    terraform: 3,
    'ci/cd': 3,
    'github actions': 2,
    jenkins: 2,
    linux: 3,
    bash: 2,
    nginx: 2,
    prometheus: 2,
    grafana: 2,
  },
  data: {
    python: 3,
    sql: 3,
    'machine learning': 3,
    pandas: 3,
    numpy: 2,
    'scikit-learn': 3,
    tensorflow: 2,
    pytorch: 2,
    spark: 2,
    tableau: 2,
    'power bi': 2,
  },
  tester: {
    selenium: 3,
    cypress: 3,
    playwright: 3,
    jest: 2,
    junit: 2,
    'api testing': 3,
    postman: 2,
    jira: 2,
    'test case': 3,
    'automation testing': 3,
  },
  design: {
    figma: 3,
    'adobe xd': 3,
    'ui/ux': 3,
    'design thinking': 2,
    'design system': 2,
    wireframe: 2,
    prototype: 2,
    'user research': 2,
  },
  management: {
    agile: 3,
    scrum: 3,
    jira: 2,
    'product owner': 3,
    backlog: 2,
    'user story': 3,
    requirement: 3,
    stakeholder: 2,
    roadmap: 2,
  },
  marketing: {
    seo: 3,
    'google ads': 3,
    'facebook ads': 2,
    'google analytics': 2,
    'content marketing': 2,
    'email marketing': 2,
    'marketing strategy': 3,
  },
};

// ─────────────────────────────────────────────
// 3.5. SKILL SYNONYMS (alternate forms for fuzzy matching)
// ─────────────────────────────────────────────

/**
 * Map skill keywords to their common alternate forms/abbreviations.
 * Used by scoreSkills() to match skills even when written differently.
 */
const SKILL_ALT_FORMS = {
  nodejs: ['node', 'node.js', 'node js'],
  nestjs: ['nest', 'nest.js'],
  react: ['reactjs', 'react.js', 'react js'],
  nextjs: ['next', 'next.js', 'next js'],
  nuxtjs: ['nuxt', 'nuxt.js', 'nuxt js'],
  vue: ['vuejs', 'vue.js', 'vue js'],
  typescript: ['ts'],
  javascript: ['js', 'ecmascript', 'es6', 'es2015'],
  postgresql: ['postgres', 'psql'],
  mongodb: ['mongo'],
  kubernetes: ['k8s', 'kube'],
  'machine learning': ['ml'],
  'deep learning': ['dl'],
  'c#': ['c sharp', 'csharp'],
  '.net': ['dotnet', '.net core', 'dotnet core'],
  express: ['expressjs', 'express.js'],
  'docker compose': ['docker-compose'],
  'ui/ux': ['ui ux', 'ux design', 'ui design', 'ui/ux design'],
  'react native': ['reactnative', 'rn'],
  'objective-c': ['objective c', 'objc'],
  terraform: ['tf'],
  'github actions': ['githubactions', 'actions'],
  'ci/cd': ['cicd', 'ci cd'],
  elasticsearch: ['es'],
  go: ['golang'],
  typeorm: ['type orm'],
  prisma: ['prisma orm'],
  'spring boot': ['springboot'],
  'scikit-learn': ['sklearn'],
  'power bi': ['powerbi', 'power bi'],
  'react query': ['reactquery', 'tanstack query'],
  'testing library': ['react testing library', 'rtl'],
  cassandra: ['cassandra db'],
  microservices: ['micro service', 'micro service architecture'],
  'message queue': ['message broker', 'mq'],
  rabbitmq: ['rabbit mq'],
  authentication: ['authn'],
  authorization: ['authz'],
  materialize: ['materialized view'],
  'jetpack compose': ['jetpackcompose', 'compose'],
  'google cloud': ['gcp'],
};

// ─────────────────────────────────────────────
// 3.6. COMPANY TIERS
// ─────────────────────────────────────────────

/**
 * Known companies with recognition scores.
 * Working at these companies gives extra experience score.
 */
const COMPANY_TIERS = [
  // Global Big Tech
  { pattern: /\bgoogle\b/i, score: 5, label: 'Google' },
  { pattern: /\b(meta|facebook)\b/i, score: 5, label: 'Meta/Facebook' },
  { pattern: /\bamazon\b/i, score: 5, label: 'Amazon' },
  { pattern: /\bapple\s+(inc|computer)?\b/i, score: 5, label: 'Apple' },
  { pattern: /\bmicrosoft\b/i, score: 5, label: 'Microsoft' },
  { pattern: /\bnetflix\b/i, score: 5, label: 'Netflix' },
  { pattern: /\b(openai|anthropic)\b/i, score: 5, label: 'AI Lab' },
  { pattern: /\bstripe\b/i, score: 5, label: 'Stripe' },
  { pattern: /\bspotify\b/i, score: 5, label: 'Spotify' },
  { pattern: /\blinkedin\b/i, score: 5, label: 'LinkedIn' },
  { pattern: /\btwitter|x\.com\b/i, score: 4, label: 'Twitter/X' },
  { pattern: /\bshopee\b/i, score: 4, label: 'Shopee' },
  { pattern: /\bgrab\b/i, score: 4, label: 'Grab' },
  { pattern: /\blazada\b/i, score: 4, label: 'Lazada' },

  // Top Vietnamese Tech
  { pattern: /\bvng\b/i, score: 4, label: 'VNG' },
  { pattern: /\bfpt\s*(software|digital|smart)?\b/i, score: 4, label: 'FPT' },
  { pattern: /\bvccorp\b/i, score: 3, label: 'VCCorp' },
  { pattern: /\bviettel\b/i, score: 3, label: 'Viettel' },
  { pattern: /\bvnpt\b/i, score: 3, label: 'VNPT' },
  { pattern: /\bmomo\b/i, score: 4, label: 'MoMo' },
  { pattern: /\bsendo\b/i, score: 3, label: 'Sendo' },
  { pattern: /\btiki\b/i, score: 3, label: 'Tiki' },

  // Banks & Finance (VN)
  {
    pattern: /\b(techcombank|vpbank|mbbank|acb|vcb|bidv|vietinbank)\b/i,
    score: 2,
    label: 'Major Vietnamese Bank',
  },

  // Consulting & Outsourcing
  { pattern: /\bmckinsey\b/i, score: 4, label: 'McKinsey' },
  { pattern: /\bbcg\b/i, score: 4, label: 'BCG' },
  { pattern: /\bbain\b/i, score: 4, label: 'Bain' },
  { pattern: /\bcapgemini\b/i, score: 3, label: 'Capgemini' },
  {
    pattern: /\b(accenture|avaloq|thoughtworks)\b/i,
    score: 3,
    label: 'Tech Consulting',
  },
];

// ─────────────────────────────────────────────
// 3.7. UNIVERSITY TIERS
// ─────────────────────────────────────────────

/**
 * University recognition for education scoring bonus.
 */
const UNIVERSITY_TIERS = [
  // Top Global
  {
    pattern:
      /\b(harvard|mit|stanford|oxford|cambridge|berkeley|cmu|caltech|princeton|yale)\b/i,
    score: 4,
    label: 'Top Global University',
  },
  // Top Asian
  {
    pattern: /\b(nus|ntu|tokyo|seoul national|tsinghua|peking)\b/i,
    score: 3,
    label: 'Top Asian University',
  },

  // Top Vietnamese Universities
  {
    pattern:
      /\b(đại học bách khoa|hcmut|hust|bách khoa hà nội|bách khoa tp|bách khoa hcm)\b/i,
    score: 3,
    label: 'Đại học Bách Khoa',
  },
  {
    pattern:
      /\b(đại học công nghệ|vnu|vnu hcm|đại học quốc gia|hcmus|vnu hcmus|university of science)\b/i,
    score: 3,
    label: 'Đại học Quốc gia',
  },
  { pattern: /\b(đại học fpt|fpt university)\b/i, score: 2, label: 'Đại học FPT' },
  {
    pattern: /\b(học viện công nghệ|post and telecommunications|ptit)\b/i,
    score: 2,
    label: 'PTIT',
  },
  { pattern: /\brmit\b/i, score: 3, label: 'RMIT Vietnam' },
  {
    pattern: /\b(đại học ngoại thương|ftu)\b/i,
    score: 2,
    label: 'Đại học Ngoại thương',
  },
  {
    pattern: /\b(đại học kinh tế|ueh|học viện tài chính|hvnh|ngân hàng)\b/i,
    score: 2,
    label: 'Đại học Kinh tế',
  },
  {
    pattern: /\b(đại học sư phạm|hcmue|học viện kỹ thuật|mta)\b/i,
    score: 1,
    label: 'Other University',
  },
];

// ─────────────────────────────────────────────
// 3.8. MAJOR/FIELD OF STUDY PATTERNS
// ─────────────────────────────────────────────

const MAJOR_PATTERNS = [
  {
    pattern:
      /\b(cs|computer science|công nghệ thông tin|khoa học máy tính|cntt|information technology|it)\b/i,
    label: 'Computer Science/IT',
  },
  {
    pattern: /\b(software engineering|công nghệ phần mềm|kỹ thuật phần mềm)\b/i,
    label: 'Software Engineering',
  },
  {
    pattern: /\b(data science|khoa học dữ liệu|data engineering)\b/i,
    label: 'Data Science/Engineering',
  },
  {
    pattern:
      /\b(information systems|hệ thống thông tin|management information systems|mis)\b/i,
    label: 'Information Systems',
  },
  {
    pattern:
      /\b(electrical engineering|điện tử viễn thông|kỹ thuật điện|electronics)\b/i,
    label: 'Electrical/Electronics Engineering',
  },
  {
    pattern: /\b(artificial intelligence|ai|trí tuệ nhân tạo|machine learning)\b/i,
    label: 'AI/Machine Learning',
  },
  {
    pattern: /\b(mathematics|toán|applied math|toán tin)\b/i,
    label: 'Mathematics',
  },
  { pattern: /\b(physics|vật lý)\b/i, label: 'Physics' },
  {
    pattern: /\b(business administration|quản trị kinh doanh|mba)\b/i,
    label: 'Business Administration',
  },
];

// ─────────────────────────────────────────────
// 3.9. INDUSTRY WEIGHT CONFIG
// ─────────────────────────────────────────────

const INDUSTRY_WEIGHT_CONFIG = {
  backend: {
    priority: [
      'database design',
      'API design',
      'scalability',
      'system architecture',
      'microservices',
      'caching',
      'security',
    ],
    secondary: ['CSS', 'UI/UX', 'frontend styling'],
    description:
      'Cực kỳ coi trọng thiết kế cơ sở dữ liệu (database design), thiết kế API, khả năng mở rộng hệ thống (scalability), kiến trúc microservices và bảo mật hơn là giao diện hoặc CSS.',
  },
  frontend: {
    priority: [
      'UX/UI',
      'web performance',
      'accessibility (WCAG)',
      'state management',
      'responsive design',
      'single page application',
    ],
    secondary: ['DevOps', 'CI/CD', 'backend databases'],
    description:
      'Coi trọng trải nghiệm người dùng (UX), tối ưu hiệu năng front-end (web performance), khả năng tiếp cận (accessibility), responsive design hơn là hạ tầng DevOps hoặc thiết kế cơ sở dữ liệu.',
  },
  data: {
    priority: [
      'math/statistics background',
      'Python',
      'model deployment',
      'machine learning',
      'deep learning',
      'data engineering',
      'NLP/LLM',
      'RAG',
    ],
    secondary: ['UI design', 'CSS styling', 'frontend framework'],
    description:
      'Cực kỳ coi trọng nền tảng toán học/thống kê, kỹ năng Python, huấn luyện và triển khai mô hình (model deployment), kỹ năng xử lý dữ liệu lớn hơn là thiết kế giao diện UI/CSS.',
  },
  devops: {
    priority: [
      'CI/CD pipelines',
      'containerization (Docker/Kubernetes)',
      'monitoring & logging',
      'infrastructure as code (IaC)',
      'cloud security',
    ],
    secondary: [
      'frontend programming',
      'UI/UX layout',
      'web development framework',
    ],
    description:
      'Tập trung cao độ vào quy trình CI/CD, đóng gói containerization (Docker/Kubernetes), giám sát hệ thống (monitoring & logging), hạ tầng dạng mã (IaC) hơn là lập trình front-end hoặc thiết kế UI.',
  },
  mobile: {
    priority: [
      'mobile performance',
      'state management',
      'offline storage/sync',
      'push notifications',
      'native bridge',
      'app store deployment',
    ],
    secondary: ['DevOps pipelines', 'backend architecture'],
    description:
      'Coi trọng hiệu năng ứng dụng di động, quản lý trạng thái, lưu trữ offline/đồng bộ hóa dữ liệu, thông báo đẩy và triển khai lên App Store/Google Play hơn là hạ tầng DevOps.',
  },
  tester: {
    priority: [
      'test planning/strategy',
      'automation test framework',
      'API testing',
      'bug reporting',
      'performance/load testing',
      'QA/QC processes',
    ],
    secondary: ['UI layout design', 'complex database design'],
    description:
      'Coi trọng lập kế hoạch kiểm thử, phát triển framework kiểm thử tự động, kiểm thử API và quy trình đảm bảo chất lượng phần mềm (QA/QC) hơn là thiết kế UI hoặc thiết kế database phức tạp.',
  },
  design: {
    priority: [
      'Figma prototyping',
      'design systems',
      'user research',
      'wireframing',
      'UX flow optimization',
      'UI visual details',
    ],
    secondary: ['CI/CD pipelines', 'server configuration'],
    description:
      'Tập trung cao độ vào công cụ thiết kế (Figma), xây dựng Design System, nghiên cứu người dùng, luồng UX và chi tiết giao diện trực quan hơn là lập trình hoặc cấu hình máy chủ.',
  },
  management: {
    priority: [
      'Agile/Scrum processes',
      'product roadmap',
      'requirement gathering (BA)',
      'stakeholder management',
      'sprint planning',
      'risk management',
    ],
    secondary: ['writing code', 'database optimization'],
    description:
      'Coi trọng quản trị dự án theo Agile/Scrum, hoạch định lộ trình sản phẩm, phân tích yêu cầu (BA) và quản lý các bên liên quan hơn là trực tiếp lập trình hoặc tối ưu hóa cơ sở dữ liệu.',
  },
  marketing: {
    priority: [
      'SEO/SEM optimization',
      'data analytics (GA4/Mixpanel)',
      'campaign strategy',
      'content copywriting',
      'conversion rate optimization (CRO)',
    ],
    secondary: ['software programming', 'system administration'],
    description:
      'Coi trọng tối ưu hóa tìm kiếm SEO/SEM, phân tích số liệu chiến dịch (GA4), chiến lược nội dung và tối ưu tỷ lệ chuyển đổi hơn là lập trình phần mềm hay quản trị hệ thống.',
  },
};

// ─────────────────────────────────────────────
// 4. EXPERIENCE LEVEL PATTERNS
// ─────────────────────────────────────────────

const EXPERIENCE_PATTERNS = {
  senior: [
    /\b(senior|sr\.?|lead|principal|staff|architect|head of|vp of|director)\b/i,
    /\b(7\+?\s*năm|8\+?\s*năm|9\+?\s*năm|10\+?\s*năm)\b/i,
    /\b([7-9]|1[0-9])\+?\s*(years?|yrs?|năm)\s*(of\s*)?(experience|exp)\b/i,
    /\b(mentored|managed team|led team|architected|designed system|scaled)\b/i,
  ],
  mid: [
    /\b(mid[\s-]?level|intermediate|experienced)\b/i,
    /\b([3-6]\+?\s*(years?|yrs?|năm)\s*(of\s*)?(experience|exp))\b/i,
    /\b(3\+?\s*năm|4\+?\s*năm|5\+?\s*năm|6\+?\s*năm)\b/i,
    /\b(independently|owned|delivered|improved|optimized|refactored)\b/i,
  ],
  junior: [
    /\b(junior|jr\.?|fresher|fresh graduate|entry[\s-]?level|intern|thực tập)\b/i,
    /\b([0-2]\+?\s*(years?|yrs?|năm)\s*(of\s*)?(experience|exp))\b/i,
    /\b(0-1\s*năm|1\s*năm|2\s*năm)\b/i,
    /\b(learning|studying|bootcamp|course|self[\s-]?taught)\b/i,
  ],
};

// ─────────────────────────────────────────────
// 5. CV SECTION PATTERNS
// ─────────────────────────────────────────────

/**
 * Strip Vietnamese diacritics from text for fuzzy matching.
 * E.g. "kỹ năng" → "ky nang", "trình độ" → "trinh do"
 */
function stripAccents(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}

/**
 * Expanded CV section patterns with more Vietnamese and English variations.
 * Each section now has multiple patterns for better coverage.
 */
const CV_SECTION_PATTERNS = {
  summary: [
    /\b(summary|objective|profile|about me|career objective|professional summary|giới thiệu|mục tiêu nghề nghiệp|tóm tắt)\b/i,
    /\b(mục tiêu|sơ yếu lý lịch|giới thiệu bản thân|personal statement|career goal)\b/i,
  ],
  education: [
    /\b(education|academic|university|college|degree|bachelor|master|phd|học vấn|trình độ học vấn|đại học|cao đẳng|bằng cấp)\b/i,
    /\b(học tập|đào tạo|education background|academic background|học hàm|trình độ chuyên môn|hệ đào tạo)\b/i,
  ],
  experience: [
    /\b(experience|work experience|employment|career|work history|professional experience|kinh nghiệm|kinh nghiệm làm việc|quá trình công tác)\b/i,
    /\b(kinh nghiệm chuyên môn|dự án|project|projects|quá trình làm việc|employment history|work background)\b/i,
  ],
  skills: [
    /\b(skills|technical skills|competencies|expertise|technologies|kỹ năng|công nghệ|kỹ năng chuyên môn)\b/i,
    /\b(kỹ thuật|năng lực|technical|chuyên môn|core competencies|tech stack|kỹ năng kỹ thuật)\b/i,
    /\b(công nghệ sử dụng|ngôn ngữ lập trình|programming languages|frameworks|tools)\b/i,
  ],
  projects: [
    /\b(projects|personal projects|side projects|portfolio|dự án|dự án cá nhân)\b/i,
    /\b(đồ án|project experience|project highlights)\b/i,
  ],
  certifications: [
    /\b(certifications?|certificates?|licenses?|credentials|chứng chỉ|bằng cấp|chứng nhận)\b/i,
    /\b(khóa học|course|certified|professional certification)\b/i,
  ],
  awards: [
    /\b(awards?|honors?|achievements?|recognition|giải thưởng|thành tích|khen thưởng)\b/i,
  ],
  languages: [
    /\b(languages?|linguistic|ngoại ngữ|ngôn ngữ)\b/i,
    /\b(trình độ ngoại ngữ|language skills|foreign language)\b/i,
  ],
};

/**
 * Check if text has strong CV content evidence even without section headers.
 * Uses heuristics like date patterns, tech skills, action verbs, education keywords.
 */
function hasCvContentEvidence(text) {
  const normalized = normalizeText(text);
  let evidenceCount = 0;

  // Evidence 1: Has date patterns (work history indication)
  const hasDates =
    /\b(19|20)\d{2}\b.*?\b(19|20)\d{2}\b|\b(19|20)\d{2}\s*[-–—to]*\s*(present|nay|current|now|hiện tại|nay)\b/is.test(
      normalized,
    );
  if (hasDates) evidenceCount++;

  // Evidence 2: Has programming languages / tech skills
  const techPattern =
    /\b(javascript|typescript|python|java|c\+\+|c#|react|vue|angular|node|nodejs|docker|aws|sql|mysql|postgresql|mongodb|html|css|php|ruby|golang|swift|kotlin|flutter|git)\b/i;
  if (techPattern.test(normalized)) evidenceCount++;

  // Evidence 3: Has job-related action verbs (work experience)
  const actionVerbPattern =
    /\b(developed|built|designed|implemented|managed|led|created|maintained|optimized|improved|delivered|deployed|configured|engineered|programmed|architected)\b/i;
  if (actionVerbPattern.test(normalized)) evidenceCount++;

  // Evidence 4: Has education keywords
  const eduPattern =
    /\b(university|college|bachelor|master|degree|đại học|cao đẳng|school|institute|học viện)\b/i;
  if (eduPattern.test(normalized)) evidenceCount++;

  // Evidence 5: Has contact info (email or phone)
  const hasContact =
    /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(normalized) ||
    /(\+84|0[3-9]\d{8}|\(\d{3}\)\s?\d{3}-\d{4})/.test(normalized);
  if (hasContact) evidenceCount++;

  // Evidence 6: Has company / job title keywords
  const jobTitlePattern =
    /\b(engineer|developer|designer|manager|consultant|specialist|intern|fresher|junior|senior|lead|architect|intern|thực tập|nhân viên|trưởng nhóm)\b/i;
  if (jobTitlePattern.test(normalized)) evidenceCount++;

  // Evidence 7: Has project-related keywords
  const projectPattern =
    /\b(project|team|client|feature|module|system|application|app|web|mobile|api)\b/i;
  if (projectPattern.test(normalized)) evidenceCount++;

  return evidenceCount >= 3;
}

// ─────────────────────────────────────────────
// 6. POSITIVE IMPACT PHRASES (boost score)
// ─────────────────────────────────────────────

const POSITIVE_IMPACT_PHRASES = [
  // Quantified achievements
  /\b(reduced|improved|increased|decreased|optimized|cut|boosted)\b.{0,40}\b(\d+%|\d+x|by \d+)\b/i,
  /\b(\d+%|\d+x)\b.{0,30}\b(faster|improvement|reduction|increase|better|performance)\b/i,
  // Scale
  /\b(million|1m\+|10k\+|100k\+|scaled to|handles? \d+)\b/i,
  /\b(high traffic|high performance|high availability|99\.?\d*%)\b/i,
  // Leadership
  /\b(led a team|managed \d+|mentored \d+|architected|designed from scratch)\b/i,
  // Awards / recognition
  /\b(award|prize|recognition|first place|top \d|winner|best project)\b/i,
];

// ─────────────────────────────────────────────
// 7. RED FLAG PATTERNS (reduce score)
// ─────────────────────────────────────────────

const RED_FLAG_PATTERNS = [
  /\b(responsible for|assisted in|helped with|worked on)\b/i, // vague verbs
  /\b(etc\.?|and more|various|several|some)\b/i, // vague quantifiers
];

// ─────────────────────────────────────────────
// 8. EDUCATION TIER SCORING
// ─────────────────────────────────────────────

const EDUCATION_TIERS = [
  {
    pattern: /\b(phd|doctorate|tiến sĩ|ph\.d)\b/i,
    score: 10,
    label: 'Tiến sĩ (PhD)',
  },
  {
    pattern: /\b(master|thạc sĩ|mba|m\.sc|m\.eng)\b/i,
    score: 8,
    label: 'Thạc sĩ',
  },
  {
    pattern: /\b(bachelor|cử nhân|kỹ sư|b\.sc|b\.eng|đại học)\b/i,
    score: 6,
    label: 'Đại học',
  },
  {
    pattern: /\b(associate|cao đẳng|college)\b/i,
    score: 4,
    label: 'Cao đẳng',
  },
  {
    pattern: /\b(bootcamp|certificate program|chứng chỉ khóa học)\b/i,
    score: 3,
    label: 'Bootcamp / Khóa học',
  },
];

// ─────────────────────────────────────────────
// 9. CERTIFICATION VALUE MAP
// ─────────────────────────────────────────────

const CERTIFICATION_VALUES = [
  {
    pattern:
      /\b(aws certified|aws solutions architect|aws developer|aws sysops)\b/i,
    score: 5,
    label: 'AWS Certification',
  },
  {
    pattern:
      /\b(google cloud|gcp certified|associate cloud engineer|professional cloud)\b/i,
    score: 5,
    label: 'GCP Certification',
  },
  {
    pattern: /\b(azure certified|microsoft certified|az-\d+)\b/i,
    score: 5,
    label: 'Azure Certification',
  },
  {
    pattern: /\b(ckad|cka|cks|kubernetes certified)\b/i,
    score: 5,
    label: 'Kubernetes Certification',
  },
  {
    pattern: /\b(pmp|project management professional)\b/i,
    score: 4,
    label: 'PMP',
  },
  {
    pattern: /\b(csm|certified scrum master)\b/i,
    score: 3,
    label: 'Scrum Master',
  },
  {
    pattern: /\b(ielts [6-9]|ielts [6-9]\.[0-9])\b/i,
    score: 3,
    label: 'IELTS 6.0+',
  },
  {
    pattern: /\b(toeic [7-9]\d{2}|toeic [89]\d{2})\b/i,
    score: 3,
    label: 'TOEIC 700+',
  },
  {
    pattern: /\b(oracle certified|ocp|oca)\b/i,
    score: 3,
    label: 'Oracle Certification',
  },
  {
    pattern: /\b(google analytics|meta certified|hubspot certified)\b/i,
    score: 2,
    label: 'Marketing Certification',
  },
];

// ─────────────────────────────────────────────
// 10. SCORING CONFIG
// ─────────────────────────────────────────────

const SCORING_CONFIG = {
  maxScore: 100,
  weights: {
    skills: 45, // keyword matches weighted by role
    experience: 25, // years + impact + seniority
    education: 10, // degree tier
    certifications: 10, // industry certs
    softSkills: 5, // teamwork, communication, etc.
    presentation: 5, // structure, sections, completeness
  },
  bonuses: {
    quantifiedImpact: 3, // per quantified achievement found
    openSource: 2, // github / open source mentions
    awardMention: 2, // awards or recognitions
    multiLanguage: 1, // multiple human languages
  },
  penalties: {
    vagueLanguage: -1, // per vague phrase found (max -5)
    missingSection: -2, // per critical missing section
    noContact: -3, // no email / phone
  },
};

// ─────────────────────────────────────────────
// 11. HELPER UTILITIES
// ─────────────────────────────────────────────

/**
 * Normalize text: lowercase, remove punctuation noise
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'") // normalize quotes
    .replace(/[–—]/g, '-') // normalize dashes
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

/**
 * Aggressive normalization for keyword matching:
 * removes dots, dashes, underscores, spaces so that
 * "node.js", "Node JS", "nodejs", "node-js" all match each other.
 */
function normalizeForMatching(text) {
  return text
    .toLowerCase()
    .replace(/[-._\s]+/g, '') // strip dots, dashes, underscores, whitespace
    .trim();
}

/**
 * Extract years of work experience from date ranges found in CV text.
 * Parses patterns like:
 * - "2019 - 2023" → 4 years
 * - "2019 - Present" → (current year - 2019) years
 * - "Jan 2019 - Dec 2023" → 4 years
 * - "2019 đến 2023", "2019 đến nay"
 * - "01/2019 - 12/2023"
 *
 * Merges overlapping/adjacent ranges and returns total years.
 */
function extractYearsOfExperience(text) {
  const normalized = normalizeText(text);
  const ranges = [];
  const currentYear = new Date().getFullYear();

  // Pattern 1: "YYYY - YYYY" or "YYYY - Present/nay/now"
  const rangeRegex1 =
    /\b(\d{4})\s*[-–—to]+\s*(\d{4}|present|nay|current|now|hiện tại)\b/gi;
  let match;
  while ((match = rangeRegex1.exec(normalized)) !== null) {
    const start = parseInt(match[1]);
    if (!/^\d{4}$/.test(match[1])) continue;
    if (start < 1990 || start > currentYear) continue; // Sanity check

    if (/^\d{4}$/.test(match[2])) {
      const end = parseInt(match[2]);
      if (end >= start && end <= currentYear + 1) {
        ranges.push({ start, end });
      }
    } else {
      // "Present" etc.
      ranges.push({ start, end: currentYear });
    }
  }

  // Pattern 2: "YYYY đến YYYY" or "YYYY đến nay"
  const rangeRegex2 = /\b(\d{4})\s*(?:đến|tới)\s*(\d{4}|nay)\b/gi;
  while ((match = rangeRegex2.exec(normalized)) !== null) {
    const start = parseInt(match[1]);
    if (start < 1990 || start > currentYear) continue;
    if (/^\d{4}$/.test(match[2])) {
      const end = parseInt(match[2]);
      if (end >= start) ranges.push({ start, end });
    } else {
      ranges.push({ start, end: currentYear });
    }
  }

  // Pattern 3: Month YYYY - Month YYYY (e.g., "January 2020 - March 2023")
  const months =
    '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|tháng\\s*\\d+)';
  const rangeRegex3 = new RegExp(
    `\\b${months}\\s*(\\d{4})\\s*[-–—to]+\\s*${months}\\s*(\\d{4}|present|nay|now)\\b`,
    'gi',
  );
  while ((match = rangeRegex3.exec(normalized)) !== null) {
    const start = parseInt(match[1]);
    if (start < 1990 || start > currentYear) continue;
    if (/^\d{4}$/.test(match[2])) {
      const end = parseInt(match[2]);
      if (end >= start) ranges.push({ start, end });
    } else {
      ranges.push({ start, end: currentYear });
    }
  }

  if (ranges.length === 0) return 0;

  // Sort by start year
  ranges.sort((a, b) => a.start - b.start);

  // Merge overlapping/adjacent ranges
  const merged = [];
  for (const range of ranges) {
    if (merged.length === 0) {
      merged.push(range);
    } else {
      const last = merged[merged.length - 1];
      if (range.start <= last.end) {
        // Overlap or adjacent - merge
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push(range);
      }
    }
  }

  // Sum up total years
  const totalYears = merged.reduce((sum, r) => sum + (r.end - r.start), 0);
  return totalYears;
}

/**
 * Extract company recognition score from CV text.
 * Checks for known company names and returns cumulative score.
 */
function extractCompanyScore(text) {
  const normalized = normalizeText(text);
  const found = new Set();
  let score = 0;

  for (const company of COMPANY_TIERS) {
    if (company.pattern.test(normalized)) {
      if (!found.has(company.label)) {
        found.add(company.label);
        score += company.score;
      }
    }
  }

  return { score, companies: Array.from(found) };
}

/**
 * Detect which role(s) a CV is targeting
 */
function detectRoles(cvText) {
  const normalized = normalizeText(cvText);
  const found = new Set();

  for (const [key, value] of Object.entries(ROLE_MAPPING)) {
    if (normalized.includes(key.toLowerCase())) {
      if (Array.isArray(value)) value.forEach((v) => found.add(v));
      else found.add(value);
    }
  }

  // If no role detected from mapping, use keyword frequency
  if (found.size === 0) {
    const scores = {};
    for (const [role, keywords] of Object.entries(ROLE_KNOWLEDGE_BASE)) {
      scores[role] = keywords.filter((kw) => normalized.includes(kw)).length;
    }
    const topRole = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (topRole && topRole[1] > 0) found.add(topRole[0]);
  }

  return Array.from(found);
}

/**
 * Detect experience level
 */
function detectExperienceLevel(cvText) {
  const normalized = normalizeText(cvText);
  for (const [level, patterns] of Object.entries(EXPERIENCE_PATTERNS)) {
    if (patterns.some((p) => p.test(normalized))) {
      return level;
    }
  }
  return 'unknown';
}

/**
 * Detect which sections exist in CV
 */
function detectSections(cvText) {
  const normalized = normalizeText(cvText);
  const criticalSections = ['experience', 'skills', 'education'];
  const allSections = Object.keys(CV_SECTION_PATTERNS);

  // Strategy 1: Try exact patterns on normalized text
  let found = allSections.filter((section) =>
    CV_SECTION_PATTERNS[section].some((p) => p.test(normalized)),
  );

  // Strategy 2: If Strategy 1 found < 2 critical sections, try with accent-stripped text
  // This helps when PDF extraction garbles Vietnamese diacritics
  const foundCritical = criticalSections.filter((s) => found.includes(s));
  if (foundCritical.length < 2) {
    const accentStripped = stripAccents(normalized);
    const strippedFound = allSections.filter((section) =>
      CV_SECTION_PATTERNS[section].some((p) => p.test(accentStripped)),
    );
    // Merge findings, preferring original
    found = [...new Set([...found, ...strippedFound])];
  }

  // Strategy 3: Content-based fallback for critical sections
  // If we still can't find sections via headers, check content evidence
  const foundCriticalFinal = criticalSections.filter((s) => found.includes(s));
  if (foundCriticalFinal.length < 2) {
    // Check if text has strong evidence of being a CV
    if (hasCvContentEvidence(normalized)) {
      // Mark missing critical sections as found based on content evidence
      if (
        !found.includes('experience') &&
        /\b(19|20)\d{2}\b.*?(company|công ty|team|project|dự án)\b/is.test(
          normalized,
        )
      ) {
        found.push('experience');
      }
      if (
        !found.includes('skills') &&
        /\b(javascript|python|java|react|node|docker|sql|html|css|c\+\+|php|ruby|git)\b/i.test(
          normalized,
        )
      ) {
        found.push('skills');
      }
      if (
        !found.includes('education') &&
        /\b(university|college|bachelor|master|degree|đại học|cao đẳng)\b/i.test(
          normalized,
        )
      ) {
        found.push('education');
      }
    }
  }

  const missing = criticalSections.filter((s) => !found.includes(s));
  return { found, missing };
}

/**
 * Score skill matches for given roles
 *
 * Uses multiple matching strategies:
 * 1. Exact match on normalized text
 * 2. Fuzzy (normalizeForMatching) for multi-char keywords
 * 3. Synonym matching via SKILL_ALT_FORMS for abbreviations/variations
 *
 * Uses an exponential scoring curve for diminishing returns.
 */
function scoreSkills(cvText, roles) {
  const normalized = normalizeText(cvText);
  const fuzzyNormalized = normalizeForMatching(cvText);
  const matched = new Set();
  const missing = [];
  let rawScore = 0;
  let coreMaxRaw = 0; // ← denominator: only weight >= 2 keywords

  for (const role of roles) {
    const keywords = ROLE_KNOWLEDGE_BASE[role] || [];
    const weights = SKILL_WEIGHTS[role] || {};

    for (const kw of keywords) {
      const weight = weights[kw] ?? 1;
      const normalizedKw = normalizeForMatching(kw);
      const altForms = SKILL_ALT_FORMS[kw] || [];

      // Only count weight >= 2 keywords in the denominator.
      // Weight=1 keywords are treated as bonus (they add to rawScore but not the cap).
      if (weight >= 2) coreMaxRaw += weight;

      // Strategy 1: Exact match on normalized text
      const exactMatch = normalized.includes(kw.toLowerCase());

      // Strategy 2: Fuzzy match (strip dots/dashes/spaces)
      const fuzzyMatch =
        !exactMatch &&
        normalizedKw.length >= 4 &&
        fuzzyNormalized.includes(normalizedKw);

      // Strategy 3: Synonym/alternate form matching
      const synonymMatch =
        !exactMatch &&
        !fuzzyMatch &&
        altForms.some((alt) => {
          const altLower = alt.toLowerCase();
          // Try exact match on alt form first
          if (normalized.includes(altLower)) return true;
          // Then try fuzzy match on alt form
          const fuzzyAlt = normalizeForMatching(altLower);
          return fuzzyAlt.length >= 3 && fuzzyNormalized.includes(fuzzyAlt);
        });

      if (exactMatch || fuzzyMatch || synonymMatch) {
        rawScore += weight;
        matched.add(kw);
      } else if (weight === 3) {
        missing.push(kw);
      }
    }
  }

  // Use exponential scoring curve with coreMaxRaw (weight>=2 keywords only)
  let score = 0;
  if (coreMaxRaw > 0) {
    const matchRatio = Math.min(rawScore / coreMaxRaw, 1.0);
    const effectiveRatio = 1 - Math.exp(-6 * matchRatio);
    score = Math.round(effectiveRatio * SCORING_CONFIG.weights.skills);
  }

  return {
    score: Math.min(score, SCORING_CONFIG.weights.skills),
    maxScore: SCORING_CONFIG.weights.skills,
    matchedKeywords: Array.from(matched),
    missingKeywords: missing.slice(0, 10),
  };
}

/**
 * Score experience section with enhanced logic:
 * - Date-based year calculation from CV date ranges
 * - Company recognition bonus
 * - Explicit years-of-experience mention parsing
 */
function scoreExperience(cvText, level) {
  const normalized = normalizeText(cvText);
  const details = [];
  let score = 0;

  // Base by seniority — increased to better match Gemini scoring
  const baseByLevel = { senior: 20, mid: 16, junior: 12, unknown: 10 };
  score += baseByLevel[level];
  details.push(`Cấp độ phát hiện: ${level}`);

  // --- Date-based experience calculation ---
  const yearsFromDates = extractYearsOfExperience(cvText);
  if (yearsFromDates > 0) {
    // Bonus: up to 8 points for date-based experience
    // Scale: 1 year → 2 points, 5+ years → 8 points (max)
    const dateBonus = Math.min(8, Math.round(yearsFromDates * 1.5));
    score += dateBonus;
    details.push(`Kinh nghiệm từ mốc thời gian: ${yearsFromDates} năm`);
  }

  // --- Explicit years-of-experience mention ---
  const explicitYearsMatch = normalized.match(
    /\b(\d+)\+?\s*(years?|yrs?|năm)\s*(of\s*)?(experience|exp|kinh nghiệm)\b/i,
  );
  if (explicitYearsMatch) {
    const explicitYears = parseInt(explicitYearsMatch[1]);
    if (explicitYears > 0 && explicitYears <= 50) {
      const explicitBonus = Math.min(4, Math.round(explicitYears * 0.6));
      score += explicitBonus;
      details.push(`Kinh nghiệm khai báo: ${explicitYears} năm`);
    }
  }

  // --- Company recognition ---
  const companyInfo = extractCompanyScore(cvText);
  if (companyInfo.score > 0) {
    const companyBonus = Math.min(6, companyInfo.score);
    score += companyBonus;
    details.push(`Công ty nổi bật: ${companyInfo.companies.join(', ')}`);
  }

  // --- Impact phrases (quantified achievements) ---
  let impactCount = 0;
  for (const pattern of POSITIVE_IMPACT_PHRASES) {
    if (pattern.test(normalized)) {
      impactCount++;
      score += SCORING_CONFIG.bonuses.quantifiedImpact;
      if (impactCount <= 2) details.push('Tìm thấy thành tích định lượng');
    }
  }

  // --- Penalty for vague language ---
  let vagueCount = 0;
  for (const pattern of RED_FLAG_PATTERNS) {
    const matches = normalized.match(new RegExp(pattern.source, 'gi'));
    if (matches) vagueCount += matches.length;
  }
  if (vagueCount > 3) {
    score -= 2;
    details.push('Ngôn ngữ mô tả còn chung chung');
  }

  // --- Open source / github bonus ---
  if (/\b(github|gitlab|open[\s-]?source|contributed to)\b/i.test(normalized)) {
    score += SCORING_CONFIG.bonuses.openSource;
    details.push('Có đóng góp mã nguồn mở / GitHub');
  }

  return {
    score: Math.min(Math.max(score, 0), SCORING_CONFIG.weights.experience),
    maxScore: SCORING_CONFIG.weights.experience,
    details,
  };
}

/**
 * Score education with enhanced detection:
 * - Degree tier (PhD, Master, Bachelor, etc.)
 * - University tier bonus
 * - Major/field of study detection
 * - GPA detection
 */
function scoreEducation(cvText) {
  const normalized = normalizeText(cvText);
  let detected = 'Không phát hiện';
  let eduScore = 0;

  // 1. Degree tier (from EDUCATION_TIERS)
  for (const tier of EDUCATION_TIERS) {
    if (tier.pattern.test(normalized)) {
      eduScore = tier.score;
      detected = tier.label;
      break;
    }
  }

  // 2. University tier bonus (up to +4 bonus)
  let uniBonus = 0;
  const foundUnis = [];
  for (const uni of UNIVERSITY_TIERS) {
    if (uni.pattern.test(normalized)) {
      uniBonus = Math.max(uniBonus, uni.score);
      foundUnis.push(uni.label);
    }
  }
  if (uniBonus > 0 && foundUnis.length > 0) {
    detected += ` - ${foundUnis[0]}`;
  }

  // 3. Major/field of study detection
  let majorLabel = '';
  for (const major of MAJOR_PATTERNS) {
    if (major.pattern.test(normalized)) {
      majorLabel = major.label;
      break;
    }
  }
  if (majorLabel) {
    detected += ` (${majorLabel})`;
  }

  // 4. GPA detection
  let gpaText = '';
  const gpaMatch = normalized.match(
    /\b(gpa|điểm)\s*:?\s*(\d+\.?\d*)\s*\/?\s*(4|10|100)?\b/i,
  );
  if (gpaMatch) {
    const gpa = parseFloat(gpaMatch[2]);
    const scale = gpaMatch[3] ? parseInt(gpaMatch[3]) : 4;
    // Normalize to 4.0 scale
    let normalizedGpa = gpa;
    if (scale === 10) normalizedGpa = gpa / 2.5;
    else if (scale === 100) normalizedGpa = gpa / 25;
    if (normalizedGpa >= 3 && normalizedGpa <= 4) {
      uniBonus += 1;
      gpaText = `GPA: ${gpa}/${scale}`;
    }
  }

  const finalScore = Math.min(
    Math.round((eduScore / 10) * SCORING_CONFIG.weights.education) + uniBonus,
    SCORING_CONFIG.weights.education,
  );

  return {
    score: finalScore,
    maxScore: SCORING_CONFIG.weights.education,
    detected: detected + (gpaText ? ` | ${gpaText}` : ''),
  };
}

/**
 * Score certifications
 */
function scoreCertifications(cvText) {
  const normalized = normalizeText(cvText);
  const found = [];
  let raw = 0;

  for (const cert of CERTIFICATION_VALUES) {
    if (cert.pattern.test(normalized)) {
      found.push(cert.label);
      raw += cert.score;
    }
  }

  const score = Math.min(
    Math.round((raw / 10) * SCORING_CONFIG.weights.certifications),
    SCORING_CONFIG.weights.certifications,
  );

  return { score, maxScore: SCORING_CONFIG.weights.certifications, found };
}

/**
 * Score soft skills
 * Uses fuzzy matching and exponential curve for consistency.
 */
function scoreSoftSkills(cvText) {
  const normalized = normalizeText(cvText);
  const fuzzyNormalized = normalizeForMatching(cvText);
  const matched = ROLE_KNOWLEDGE_BASE.soft_skills.filter((kw) => {
    const normalizedKw = normalizeForMatching(kw);
    if (normalizedKw.length === 0) return false;
    // Try exact match first
    if (normalized.includes(kw.toLowerCase())) return true;
    // Then fuzzy match (only for multi-char keywords to avoid false positives)
    if (normalizedKw.length >= 4 && fuzzyNormalized.includes(normalizedKw))
      return true;
    return false;
  });

  const ratio =
    ROLE_KNOWLEDGE_BASE.soft_skills.length > 0
      ? matched.length / ROLE_KNOWLEDGE_BASE.soft_skills.length
      : 0;
  // Steeper curve (λ=6) so matching a few soft skills gives decent score
  const effectiveRatio = 1 - Math.exp(-6 * ratio);
  const score = Math.min(
    Math.round(effectiveRatio * SCORING_CONFIG.weights.softSkills),
    SCORING_CONFIG.weights.softSkills,
  );

  return {
    score,
    maxScore: SCORING_CONFIG.weights.softSkills,
    matchedKeywords: matched,
  };
}

/**
 * Score presentation / structure
 */
function scorePresentation(cvText, sections) {
  let score = SCORING_CONFIG.weights.presentation;

  // Penalize missing critical sections
  score += sections.missing.length * SCORING_CONFIG.penalties.missingSection;

  // Penalize no contact info
  const hasContact =
    /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(cvText) ||
    /\b(\+84|0[3-9]\d{8}|\(\d{3}\)\s?\d{3}-\d{4})\b/.test(cvText);
  if (!hasContact) score += SCORING_CONFIG.penalties.noContact;

  return {
    score: Math.max(score, 0),
    maxScore: SCORING_CONFIG.weights.presentation,
    sectionsFound: sections.found,
    sectionsMissing: sections.missing,
  };
}

/**
 * Map numeric score to letter grade
 */
function scoreToGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
}

/**
 * Generate human-readable strengths and improvement tips
 */
function generateFeedback(breakdown, roles, level) {
  const strengths = [];
  const improvements = [];

  // Skills feedback
  const skillRatio = breakdown.skills.score / breakdown.skills.maxScore;
  if (skillRatio >= 0.75) {
    strengths.push(
      `Kỹ năng kỹ thuật phù hợp tốt với vị trí ${roles.join('/')} (${breakdown.skills.matchedKeywords.length} kỹ năng nhận diện được)`,
    );
  } else if (skillRatio < 0.4) {
    improvements.push(
      `Bổ sung thêm kỹ năng quan trọng: ${breakdown.skills.missingKeywords.slice(0, 5).join(', ')}`,
    );
  }

  // Experience feedback
  if (breakdown.experience.details.some((d) => d.includes('định lượng'))) {
    strengths.push(
      'CV có các thành tích định lượng cụ thể (con số, phần trăm), tạo ấn tượng mạnh',
    );
  } else {
    improvements.push(
      'Thêm các thành tích cụ thể với con số đo lường (ví dụ: "Tối ưu tốc độ tải trang 40%", "Xử lý 10.000 request/giây")',
    );
  }

  // Experience: company recognition
  if (breakdown.experience.details.some((d) => d.includes('Công ty nổi bật'))) {
    strengths.push('Kinh nghiệm làm việc tại các công ty công nghệ nổi bật');
  }

  // Experience: open source
  if (breakdown.experience.details.some((d) => d.includes('mã nguồn mở'))) {
    strengths.push(
      'Có đóng góp mã nguồn mở, thể hiện tinh thần học hỏi và cống hiến',
    );
  }

  // Education
  if (breakdown.education.score >= 6) {
    strengths.push(`Nền tảng học vấn tốt: ${breakdown.education.detected}`);
  } else if (
    breakdown.education.detected &&
    !breakdown.education.detected.includes('Không phát hiện')
  ) {
    strengths.push(`Học vấn: ${breakdown.education.detected}`);
  }

  // Certs
  if (breakdown.certifications.found.length > 0) {
    strengths.push(
      `Có chứng chỉ chuyên ngành: ${breakdown.certifications.found.join(', ')}`,
    );
  } else {
    improvements.push(
      'Thêm chứng chỉ quốc tế liên quan (AWS, GCP, Azure, PMP...) để tăng uy tín',
    );
  }

  // Soft skills
  if (breakdown.softSkills.score >= 3) {
    strengths.push('Kỹ năng mềm được thể hiện rõ ràng trong CV');
  } else {
    improvements.push(
      'Đề cập rõ hơn về kỹ năng mềm: giao tiếp, làm việc nhóm, quản lý thời gian',
    );
  }

  // Sections
  if (breakdown.presentation.sectionsMissing.length > 0) {
    improvements.push(
      `Bổ sung các phần còn thiếu: ${breakdown.presentation.sectionsMissing.join(', ')}`,
    );
  }

  return { strengths, improvements };
}

// ─────────────────────────────────────────────
// 13. MAIN FALLBACK ANALYZER
// ─────────────────────────────────────────────

/**
 * Kiểm tra nội dung có phải là CV hợp lệ hay không dựa trên:
 * - Có ít nhất 2/3 section quan trọng (Experience, Skills, Education)
 *   với 3 strategy: regex → accent-stripped → content-based heuristic
 * - Có độ dài tối thiểu
 * - Fallback: content-based evidence (dates, tech skills, education keywords,
 *   contact info, job titles, project keywords)
 */
function isValidCV(cvText) {
  const normalized = normalizeText(cvText);

  // Kiểm tra độ dài tối thiểu (tránh file rỗng hoặc quá ngắn)
  if (normalized.length < 50) {
    return {
      valid: false,
      reason: 'Tài liệu quá ngắn, không đủ thông tin để phân tích CV.',
    };
  }

  // Phát hiện các section (sử dụng detectSections đã cải tiến với 3 strategy)
  const sections = detectSections(normalized);
  const criticalSections = ['experience', 'skills', 'education'];
  const foundCritical = criticalSections.filter((s) =>
    sections.found.includes(s),
  );

  // Nếu section detection không đủ 2/3, dùng content-based heuristic làm fallback
  if (foundCritical.length < 2) {
    // Content-based fallback: kiểm tra bằng chứng nội dung CV
    if (hasCvContentEvidence(normalized)) {
      // Nội dung có đủ bằng chứng của một CV hợp lệ → cho phép pass
      return { valid: true, reason: '' };
    }

    const foundList =
      foundCritical.length === 0
        ? 'không tìm thấy phần nào'
        : `chỉ tìm thấy: ${foundCritical.join(', ')}`;
    return {
      valid: false,
      reason: `Tài liệu không giống một bản CV hợp lệ (${foundList}). Một CV cần có ít nhất 2 trong 3 phần: Kinh nghiệm (Experience), Kỹ năng (Skills), Học vấn (Education).`,
    };
  }

  // Kiểm tra thông tin liên hệ (chỉ bắt buộc khi section detection không tìm thấy đủ)
  // Nếu đã có đủ section, contact info là bonus, không phải requirement tuyệt đối

  return { valid: true, reason: '' };
}

/**
 * Analyze a CV using local knowledge base only (no API required).
 * Use this as fallback when Gemini API is unavailable or quota exceeded.
 *
 * @param {string} cvText - Raw extracted text of the CV
 * @param {string} [targetRole] - Optional override for target role (e.g. "frontend")
 */
function analyzeCVLocal(cvText, targetRole) {
  const normalized = normalizeText(cvText);

  // Validate that this looks like a CV before analyzing
  const cvCheck = isValidCV(normalized);
  if (!cvCheck.valid) {
    throw new Error(cvCheck.reason);
  }

  // Step 1: Determine roles
  let detectedRoles = targetRole
    ? (() => {
        const mappedRole = ROLE_MAPPING[targetRole.toLowerCase()];
        if (!mappedRole) {
          // targetRole is not a valid KB role key (e.g. "Vị trí ứng tuyển chung")
          // fall back to auto-detection from CV content
          return detectRoles(cvText);
        }
        return Array.isArray(mappedRole) ? mappedRole : [mappedRole];
      })()
    : detectRoles(cvText);

  if (detectedRoles.length === 0) detectedRoles = ['backend'];

  // Validate that all detected roles actually exist in the knowledge base.
  // If the role string doesn't match any KB entry, filter it out and retry detection.
  const validRoles = detectedRoles.filter(
    (r) => ROLE_KNOWLEDGE_BASE[r] !== undefined,
  );
  if (validRoles.length === 0) {
    // No valid roles found — retry with auto-detection
    const autoDetected = detectRoles(cvText);
    detectedRoles = autoDetected.length > 0 ? autoDetected : ['backend'];
  } else {
    detectedRoles = validRoles;
  } // safe default

  // Step 2: Detect level
  const experienceLevel = detectExperienceLevel(cvText);

  // Step 3: Detect sections
  const sections = detectSections(cvText);

  // Step 4: Sub-scores
  const skillsBreakdown = scoreSkills(normalized, detectedRoles);
  const experienceBreakdown = scoreExperience(normalized, experienceLevel);
  const educationBreakdown = scoreEducation(normalized);
  const certBreakdown = scoreCertifications(normalized);
  const softSkillsBreakdown = scoreSoftSkills(normalized);
  const presentationBreakdown = scorePresentation(cvText, sections);

  const breakdown = {
    skills: skillsBreakdown,
    experience: experienceBreakdown,
    education: educationBreakdown,
    certifications: certBreakdown,
    softSkills: softSkillsBreakdown,
    presentation: presentationBreakdown,
  };

  // Step 5: Total score
  const rawTotal =
    skillsBreakdown.score +
    experienceBreakdown.score +
    educationBreakdown.score +
    certBreakdown.score +
    softSkillsBreakdown.score +
    presentationBreakdown.score;

  const overallScore = Math.min(Math.max(Math.round(rawTotal), 0), 100);
  const grade = scoreToGrade(overallScore);

  // Step 6: Feedback
  const { strengths, improvements } = generateFeedback(
    breakdown,
    detectedRoles,
    experienceLevel,
  );

  // Step 7: Summary
  const summary =
    `CV được phân tích bởi hệ thống nội bộ (fallback). ` +
    `Phát hiện vị trí: ${detectedRoles.join(', ')} | ` +
    `Cấp độ: ${experienceLevel} | ` +
    `Điểm tổng: ${overallScore}/100 (${grade}). ` +
    `Nhận diện ${skillsBreakdown.matchedKeywords.length} kỹ năng phù hợp. ` +
    (certBreakdown.found.length > 0
      ? `Chứng chỉ: ${certBreakdown.found.join(', ')}.`
      : 'Chưa có chứng chỉ nổi bật.');

  return {
    overallScore,
    grade,
    detectedRoles,
    experienceLevel,
    breakdown,
    strengths,
    improvements,
    summary,
    analysisSource: 'local_fallback',
  };
}

// ─────────────────────────────────────────────
// 14. API WRAPPER WITH FALLBACK
// ─────────────────────────────────────────────

/**
 * Analyze CV with Gemini API, automatically falling back to local engine
 * if the API is unavailable, returns an error, or exceeds quota.
 */
async function analyzeCVWithFallback(cvText, targetRole, callGeminiAPI) {
  try {
    const result = await callGeminiAPI(cvText, targetRole);
    return { ...result, analysisSource: 'gemini_api' };
  } catch (error) {
    const isQuotaError =
      error instanceof Error &&
      (error.message.includes('429') ||
        error.message.toLowerCase().includes('quota') ||
        error.message.toLowerCase().includes('rate limit'));

    console.warn(
      isQuotaError
        ? '[CV Analyzer] Gemini API quota exceeded — using local fallback.'
        : '[CV Analyzer] Gemini API error — using local fallback.',
      error,
    );

    return analyzeCVLocal(cvText, targetRole);
  }
}

module.exports = {
  ROLE_KNOWLEDGE_BASE,
  ROLE_MAPPING,
  SKILL_WEIGHTS,
  SKILL_ALT_FORMS,
  COMPANY_TIERS,
  UNIVERSITY_TIERS,
  MAJOR_PATTERNS,
  INDUSTRY_WEIGHT_CONFIG,
  EXPERIENCE_PATTERNS,
  stripAccents,
  CV_SECTION_PATTERNS,
  hasCvContentEvidence,
  POSITIVE_IMPACT_PHRASES,
  RED_FLAG_PATTERNS,
  EDUCATION_TIERS,
  CERTIFICATION_VALUES,
  SCORING_CONFIG,
  normalizeText,
  normalizeForMatching,
  extractYearsOfExperience,
  extractCompanyScore,
  detectRoles,
  detectExperienceLevel,
  detectSections,
  isValidCV,
  analyzeCVLocal,
  analyzeCVWithFallback,
};
