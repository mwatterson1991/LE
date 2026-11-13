// Single source of truth for the business.joinleland.com information
// architecture (Dave's Nov 2026 proposal). The nav, mobile menu, and footer all
// read from here so a menu change is one edit. Every dropdown follows the same
// pattern: "what you buy" on the left, "who it's for" on the right.
//
// Pages marked `stub: true` don't exist yet. They're in the menu so the team can
// react to the full structure; links point at a placeholder anchor until built.

export const BOOK_DEMO_URL = 'https://joinleland.typeform.com/to/bZuwV6t5?utm_source=business'
export const ASSESSMENT_URL = 'https://leland.ai/ai-assessment'
export const LOGIN_URL = 'https://www.joinleland.com/login'
export const CONSUMER_AI_URL = 'https://www.joinleland.com/program'

export const NAV = [
  {
    label: 'AI Transformation',
    href: '/ai',
    buy: [
      { label: 'AI Transformation Platform', desc: 'Assess, train, and prove impact', href: '/ai' },
      { label: 'Assessment', desc: 'See where your team stands', href: '/ai/assessment', stub: true },
      { label: 'Curriculum & programs', desc: 'Levels 0 to 4, live cohorts, Builder', href: '/ai/curriculum', stub: true },
      { label: 'Services', desc: 'We build it with you', href: '/services' },
    ],
    who: [
      { group: 'By team', links: [
        { label: 'HR & People', href: '/ai/for/hr', stub: true },
        { label: 'Sales', href: '/ai/for/sales', stub: true },
        { label: 'Marketing', href: '/ai/for/marketing', stub: true },
        { label: 'Operations', href: '/ai/for/operations', stub: true },
      ] },
      { group: 'By industry', links: [
        { label: 'Financial services', href: '/ai/for/financial-services', stub: true },
        { label: 'Higher education', href: '/ai/for/higher-ed', stub: true },
        { label: 'Consumer brands', href: '/ai/for/consumer', stub: true },
      ] },
      { group: 'By size', links: [
        { label: 'Growth · 25 to 500', href: '/ai/for/growth', stub: true },
        { label: 'Enterprise · 500+', href: '/ai/for/enterprise', stub: true },
      ] },
    ],
    feature: { title: 'Take the AI assessment', desc: 'Free. Get your team’s AI-native level and a plan.', href: ASSESSMENT_URL, cta: 'Start' },
    footnote: { text: 'Learning AI for yourself?', link: 'AI Builder Program on joinleland.com', href: CONSUMER_AI_URL },
  },
  {
    label: 'Talent',
    href: '/talent',
    buy: [
      { label: 'Hiring', desc: 'Recruit AI-native operators', href: '/recruit' },
      { label: 'Outplacement', desc: 'Coaching for employees in transition', href: '/outplacement', stub: true },
    ],
    who: [
      { group: 'Hiring', links: [
        { label: 'Recruiting teams', href: '/recruit', stub: true },
        { label: 'Employer branding', href: '/recruit', stub: true },
      ] },
      { group: 'Outplacement', links: [
        { label: 'HR & People leaders', href: '/outplacement', stub: true },
        { label: 'Employees in transition', href: '/outplacement', stub: true },
      ] },
    ],
    aiBar: { text: 'Hire AI-fluent people, upskill everyone in transition.', href: '/ai' },
  },
  {
    label: 'Universities',
    href: '/universities',
    buy: [
      { label: 'University partnerships', desc: 'Expert coaching for your students', href: '/universities', stub: true },
    ],
    who: [
      { group: 'Programs', links: [
        { label: 'Career centers', href: '/universities/career-centers', stub: true },
        { label: 'MBA programs', href: '/universities/mba-programs', stub: true },
        { label: 'Undergrad programs', href: '/universities/undergrad', stub: true },
      ] },
    ],
    aiBar: { text: 'AI-ready graduates.', href: '/ai/for/higher-ed' },
  },
  {
    label: 'Advertising',
    href: '/advertise',
    buy: [
      { label: 'Advertise with Leland', desc: 'Overview and media kit', href: '/advertise', stub: true },
    ],
    who: [
      { group: 'Advertisers', links: [
        { label: 'Employers', href: '/advertise/employers', stub: true },
        { label: 'Schools & programs', href: '/advertise/schools', stub: true },
        { label: 'Test prep & tools', href: '/advertise/tools', stub: true },
      ] },
    ],
    aiBar: { text: 'Reach people actively building AI skills.', href: '/ai' },
  },
  {
    label: 'Resources',
    href: '/customers',
    columns: [
      { cap: 'Proof', links: [
        { label: 'Customers', desc: 'Case studies and builder stories', href: '/customers', stub: true },
        { label: 'Partners', desc: 'AI partners, partner with Leland', href: '/partners', stub: true },
      ] },
      { cap: 'Learn', links: [
        { label: 'Events', desc: 'Roundtables, webinars', href: '/events', stub: true },
        { label: 'Blog ↗', desc: 'AI and workforce posts', href: 'https://www.joinleland.com/library' },
        { label: 'Comparisons ↗', desc: 'Leland vs. Section, Multiverse', href: 'https://www.joinleland.com/library/a/leland-vs-section-ai' },
      ] },
      { cap: 'Trust & support', links: [
        { label: 'Security & trust', desc: 'Data handling and policies', href: '/security', stub: true },
        { label: 'Help center', desc: 'For current customers', href: 'https://www.joinleland.com/support' },
      ] },
    ],
  },
]

export const linkHref = (l) => (l.stub ? `#todo:${l.href}` : l.href)
export const isExternal = (href) => href.startsWith('http')
