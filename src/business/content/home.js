// All the words on the business homepage (business.joinleland.com).
// Edit copy here, not in components. [Brackets] = placeholder until someone
// confirms the real thing. Structure follows Dave's wireframe Idea A, with the
// Idea D audience switcher in the hero.

export const HERO = {
  badge: { label: 'New', text: 'The AI Transformation Platform', href: '/ai' },
  // The switcher. `ai` is the default, so most visitors see the AI story first.
  audiences: [
    {
      key: 'ai',
      tab: 'Upskill in AI',
      title: 'Your partner for workforce transformation in the age of AI.',
      sub: 'Get every team fluent in AI and shipping real work, with the hiring, outplacement and university programs that go with it. Led by people who do the work.',
      cta: { label: 'Explore AI Transformation', href: '/ai' },
    },
    {
      key: 'talent',
      tab: 'Hire & transition',
      title: 'Hire ambitious people. Support the ones moving on.',
      sub: 'Recruit AI-fluent operators verified on real builds, and give departing employees expert coaching for what comes next.',
      cta: { label: 'Explore Talent', href: '/recruit' },
    },
    {
      key: 'uni',
      tab: 'Universities',
      title: 'Expert coaching for every student you serve.',
      sub: 'Career centers, MBA and undergrad programs give students one-on-one help from people who have done the job they want.',
      cta: { label: 'Explore Universities', href: '#todo:/universities' },
    },
    {
      key: 'ads',
      tab: 'Advertise',
      title: 'Reach people at the moment they invest in themselves.',
      sub: 'Employers, schools and tools reach ambitious professionals while they are choosing their next step.',
      cta: { label: 'Explore Advertising', href: '#todo:/advertise' },
    },
  ],
  primaryCta: 'Book a demo',
  secondaryCta: 'Take the AI assessment',
  // Product stage per audience. Numbers inside product UI are illustrative.
  stage: {
    ai: {
      window: 'AI readiness',
      metricLabel: 'Company AI readiness',
      metric: 'Level 3',
      delta: '+2 levels this year',
      rows: [['Sales', 82], ['Marketing', 74], ['Operations', 61], ['HR & People', 55], ['Finance', 43]],
      session: { label: 'Live with an expert', title: 'Build your first agent team', meta: 'Andrew Q. · Thu 2pm', joined: '+24 from Sales' },
      shipped: { label: 'Shipped this week', title: 'Post-call tasks automated with one n8n workflow', meta: 'Built by John D. in Ops', build: 3 },
    },
    talent: {
      window: 'Talent',
      metricLabel: 'Roles filled this quarter',
      metric: '[18]',
      delta: '[42] in pipeline',
      rows: [['GTM Engineer', 64], ['Operations Builder', 52], ['AI-Native Engineer', 47], ['In transition', 38]],
      session: { label: 'Outplacement coaching', title: 'Your next role, mapped in one session', meta: 'Dessy K. · Mon 10am', joined: '[12] employees this month' },
      shipped: { label: 'Latest placement', title: 'Operations Builder, verified on 4 builds', meta: 'Hired in [3 weeks]', build: 16 },
    },
    uni: {
      window: 'Universities',
      metricLabel: 'Students coached this term',
      metric: '[1,240]',
      delta: '[14] programs',
      rows: [['MBA', 76], ['Undergrad', 62], ['Career center', 48], ['AI cohort', 40]],
      session: { label: 'Coaching session', title: 'Mock interviews with a consultant', meta: 'Kristen H. · Wed 4pm', joined: '[38] students booked' },
      shipped: { label: 'Latest outcome', title: 'Offer accepted, product management', meta: '[School] · Class of 2027', build: 17 },
    },
    ads: {
      window: 'Advertising',
      metricLabel: 'Audience reached',
      metric: '[2.4M]',
      delta: 'Monthly',
      rows: [['Professionals', 80], ['MBA applicants', 60], ['Students', 50], ['Career switchers', 42]],
      session: { label: 'Sponsored livestream', title: 'How to break into private equity', meta: '[Brand] · [3,100] registered', joined: '[61%] stayed to the end' },
      shipped: { label: 'Campaign', title: 'Employer spotlight in the career feed', meta: '[Brand] · live now', build: 7 },
    },
  },
}

export const PROOF = {
  title: 'Trusted by companies, universities and teams',
  // trained = live pledge counter. The rest are published on joinleland.com
  // and leland.ai (as of Nov 2026).
  stats: [
    { key: 'trained', label: 'people learning AI on Leland' },
    { value: '500+', label: 'trained AI experts' },
    { value: '250+', label: 'teams trained' },
    { value: '4.99', label: 'average rating from 37,185 reviews' },
  ],
}

export const PATHS = {
  title: 'Whatever your goal, your path starts here.',
  sub: 'Every path is backed by the same network of experts.',
  ai: {
    label: 'AI Transformation',
    title: 'Get every team fluent in AI and shipping real work.',
    desc: 'Assess where you stand, learn with experts, build with your team, and measure what changed.',
    cta: { label: 'Explore AI Transformation', href: '/ai' },
    parts: [
      { n: '01', title: 'Assessment', desc: 'See where every team stands' },
      { n: '02', title: 'Expert-led learning', desc: 'Live cohorts by function' },
      { n: '03', title: 'Services', desc: 'We build agents with you' },
      { n: '04', title: 'Reporting', desc: 'Adoption and impact by team' },
    ],
  },
  others: [
    { label: 'Talent', title: 'Hire great talent', desc: 'Recruiting · Employer branding', href: '/recruit', illus: 'handshake' },
    { label: 'Talent', title: 'Support employees in transition', desc: 'Outplacement', href: '#todo:/outplacement', illus: 'unlock-potential' },
    { label: 'Universities', title: 'Coach every student', desc: 'Career centers · MBA · Undergrad', href: '#todo:/universities', illus: 'graduation' },
    { label: 'Advertising', title: 'Reach ambitious people', desc: 'Employers · Schools · Tools', href: '#todo:/advertise', illus: 'megaphone' },
  ],
}

// Real AI Builder Program reviews (public/data/featured-reviews.json). Swap for
// a named customer story once one is approved.
export const STORY_AI = {
  title: 'Teams getting real results from AI.',
  quote: 'We built a skill that saves our accounting team roughly 40 hours of work each quarter. They’ll go from 40 hours to maybe 40 minutes on this. This has been huge for us.',
  name: 'AI Builder Program participant',
  role: 'Finance team lead · [Company, pending approval]',
  metric: '40 hrs → 40 min',
  metricLabel: 'quarterly reporting, per cycle',
  cta: 'Read more reviews',
  href: '/reviews',
}

export const DEEP_DIVE = {
  label: 'AI Transformation Platform',
  title: 'From AI‑curious to AI‑fluent, one team at a time.',
  cta: { label: 'Explore the platform', href: '/ai' },
  steps: [
    { n: '01', title: 'Assess', desc: 'Every person gets a level and a roadmap from how they actually use AI.' },
    { n: '02', title: 'Learn', desc: 'Live sessions by function, taught by practitioners who ship with AI daily.' },
    { n: '03', title: 'Build', desc: 'Weekly builds tied to real work. The best ones become your team’s playbook.' },
    { n: '04', title: 'Measure', desc: 'Readiness, builds shipped and hours saved by team, ready for leadership.' },
  ],
  services: {
    label: 'Leland Services',
    title: 'Need it built? We’ll build it with you.',
    desc: 'Agents and workflows designed and shipped alongside your team, from strategy session to an embedded Head of AI.',
    cta: { label: 'Explore Services', href: '/services' },
  },
  builtFor: ['HR & People', 'Sales', 'Marketing', 'Operations', 'Higher ed', 'Enterprise'],
}

export const STORY_OTHER = {
  label: 'Universities · Talent',
  quote: '[Quote from a career center director or HR leader, ideally with a number in it.]',
  name: '[Name]',
  role: '[Title, University]',
  metric: '[X]',
  metricLabel: '[students coached]',
}

export const BEYOND = {
  title: 'Talent, universities and brands work with Leland too.',
  cards: [
    { key: 'talent', label: 'Talent', title: 'Hiring and outplacement', desc: 'Hire AI-native operators and support people in transition.', href: '/recruit', cta: 'Explore Talent', faces: ['pic-07', 'pic-02', 'pic-13'] },
    { key: 'uni', label: 'Universities', title: 'Career centers, MBA and undergrad', desc: 'Expert coaching for every student you serve.', href: '#todo:/universities', cta: 'Explore Universities', logos: ['byu', 'kellogg', 'usc-marshall'] },
    { key: 'ads', label: 'Advertising', title: 'Employers, schools and tools', desc: 'Reach people while they choose their next step.', href: '#todo:/advertise', cta: 'Explore Advertising', stat: ['300K+', 'students using Leland'] },
  ],
}

export const ENTERPRISE = {
  label: 'Enterprise-ready',
  title: 'Built to roll out across thousands of people.',
  items: [
    { title: 'Security & privacy', desc: '[SSO, data handling and compliance details to confirm with the platform team.]' },
    { title: 'Admin & access', desc: 'Seats, teams and permissions managed by your admins, with roles for managers.' },
    { title: 'Reporting', desc: 'Readiness, adoption and outcomes by team, exportable for leadership reviews.' },
    { title: 'AI & model partners', desc: 'Works inside the tools your people already use: Claude, ChatGPT, Copilot and Gemini.' },
  ],
}

export const FAQ = {
  title: 'FAQ',
  items: [
    {
      q: 'What does Leland do for businesses?',
      a: 'Leland helps companies become AI-native. The AI Transformation Platform assesses every employee, trains them with live sessions and real builds, and shows leadership the impact. Leland also helps you hire ambitious, AI-fluent people, coach employees through transitions, partner with universities, and reach professionals through advertising.',
    },
    {
      q: 'What is the AI Transformation Platform?',
      a: 'One platform for the whole rollout: an assessment that scores how people actually use AI, a leveled curriculum taught live by practitioners, a library of real builds by role, Leland inside the AI tools your team already uses, and an admin view of readiness, builds and hours saved.',
    },
    {
      q: 'How is Leland different from online courses?',
      a: 'Courses teach and stop. Leland measures where each person starts, teaches through weekly builds tied to their real job, and shows what changed. People leave with things they built, verified on their Leland portfolio, not just a certificate.',
    },
    {
      q: 'Do you work with universities?',
      a: 'Yes. Career centers, MBA programs and undergraduate programs use Leland to give students one-on-one coaching from experts who have done the job they want, plus AI programs that prepare them for it.',
    },
    {
      q: 'How is pricing structured?',
      a: 'The platform is an annual seat. Live sessions, coaching and custom builds are added on and always itemized. You see one total for your company, sized to your team. Book a demo and we’ll scope it with you.',
    },
  ],
}

export const FINAL_CTA = {
  title: 'Start your company’s next chapter.',
  primary: 'Book a demo',
  secondary: 'Take the AI assessment',
  goTo: [
    { label: 'AI Transformation', href: '/ai' },
    { label: 'Talent', href: '/recruit' },
    { label: 'Universities', href: '#todo:/universities' },
    { label: 'Advertising', href: '#todo:/advertise' },
  ],
}

/* ------------------------------------------------------------------
   Hi-fi 4 direction (Dave's "Nature dark, product hero"). Option A.
   ------------------------------------------------------------------ */

export const HIFI_HERO = {
  // Kept for search/answer engines; rendered almost invisible.
  eyebrow: 'Leland for Business',
  title: 'AI workforce transformation',
  sub: 'Assess every team, train them with experts, and prove the impact.',
  primaryCta: 'Book a demo',
  secondaryCta: 'Take the AI assessment',
}

// Product mock. Labels follow the real admin dashboard (AI-Native Score,
// bands, by team). Numbers are illustrative.
export const HIFI_DASH = {
  nav: ['Overview', 'Assessment', 'Cohorts', 'Builds', 'Talent', 'Reports'],
  greeting: 'Good morning',
  period: 'Q4',
  score: 3.4,
  band: 'AI Fluent',
  change: 'Up 1.2 since July',
  bands: ['Starter', 'Explorer', 'Fluent', 'Proficient', 'AI-Native'],
  teams: [['Sales', 3.9], ['Marketing', 3.6], ['Operations', 3.1], ['Finance', 2.6]],
  sessions: [
    { img: 'andrew-q', title: 'Build your first agent team', when: 'Live now', live: true },
    { img: 'dessy-k', title: 'Make every output sound like you', when: 'Monday 10am' },
    { img: 'kristen-h', title: 'Automate your inbox with n8n', when: 'Tuesday 1pm' },
  ],
  builds: [
    { build: 3, title: 'Post-call tasks agent', meta: 'Ops · runs after every call' },
    { build: 24, title: 'SDR follow-up agent', meta: 'Sales · runs every morning' },
    { build: 9, title: 'Cash-flow forecast', meta: 'Finance · updated weekly' },
  ],
  roles: [
    { title: 'GTM Engineer', meta: '3 verified candidates' },
    { title: 'Operations Builder', meta: 'Offer accepted' },
    { title: 'Sales Builder', meta: '5 verified candidates' },
  ],
  report: { label: 'Hours saved per week', value: '1,920', series: [12, 18, 22, 31, 40, 52, 61, 74] },
}

export const HIFI_TRANSFORM = {
  eyebrow: 'AI Transformation',
  title: 'Your company’s AI transformation',
  sub: 'Assess every team, learn with experts and ship real work with AI.',
  cards: [
    {
      key: 'assess',
      title: 'Assess',
      desc: 'Everyone gets a score and a plan from how they actually use AI.',
      bg: 'motion-green',
    },
    {
      key: 'learn',
      title: 'Learn with experts',
      desc: 'Live sessions for each function, led by people who do the work.',
      bg: 'learn',
    },
    {
      key: 'build',
      title: 'Build it with us',
      desc: 'Our builders work alongside your team to ship the agents that matter most.',
      bg: 'build',
    },
  ],
}

// Real customer stories, already published on leland.ai/program.
export const HIFI_STORIES = {
  eyebrow: 'Customer stories',
  title: 'What teams say about Leland',
  cards: [
    { quote: 'The course probably accelerated our company’s AI adoption by six months.', name: 'Udit Pillay', title: 'Chief Revenue Officer', company: 'Ethisphere', logo: 'co/ethisphere.svg', photo: 'cut-udit-pillay', stat: ['95%', 'of eligible staff through the program'], bg: 'motion-orange' },
    { quote: 'It was a huge shift in the mindset of what’s possible. Those excuses are almost gone.', name: 'Ryan Moats', title: 'VP Global Marketing', company: 'PlayPower', logo: 'co/playpower.png', photo: 'cut-ryan-moats', stat: ['1,500+', 'spec sheets rebuilt'], bg: 'motion-teal' },
    { quote: 'It put everyone in a builder mindset. Many didn’t think it was possible to truly build something.', name: 'Lucy Baldwin', title: 'VP Product', company: 'ASU+GSV Summit', logo: 'co/asugsv.png', photo: 'cut-lucy-baldwin', stat: ['8 hrs', 'of meeting prep automated weekly'], bg: 'motion-blue' },
    { quote: 'I got more value out of that program for a thousand dollars than what I got out of my entire MBA.', name: 'Gerritt Vander Linden', title: 'Commercial Partnerships', company: '47G', logo: 'co/47g.png', photo: 'cut-gerritt-vander-linden', stat: ['89%', 'faster partnership plans'], bg: 'motion-prism' },
  ],
}
