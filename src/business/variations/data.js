// build-08 is a broken 18x26 image: never use id 8.
// Real assets for the variation mockups. Everything here already ships on
// leland.ai or the AI Builder Program; names on builds are real member builds
// from the program's community gallery. Personas (PEOPLE) are placeholder
// portraits with invented names: swap for real customers before launch.

export const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
export const buildImg = (n) => asset(`business/v/builds/build-${String(n).padStart(2, '0')}.webp`)
export const personImg = (file) => asset(`business/v/people/${file}.webp`)
export const illus = (name) => asset(`business/illustrations/${name}.svg`)

export const BUILDS = [
  { id: 22, title: 'AE agent that converts inbound leads', author: 'Marcus T.', role: 'Sales', tool: 'n8n', hours: 6 },
  { id: 24, title: 'SDR agent that follows up with every lead', author: 'Priya S.', role: 'Sales', tool: 'n8n', hours: 8 },
  { id: 23, title: 'FAQ and pricing agents for support', author: 'Dana L.', role: 'Support', tool: 'Claude', hours: 5 },
  { id: 3, title: 'Post-call tasks automated with one n8n workflow', author: 'John D.', role: 'Operations', tool: 'n8n', hours: 4 },
  { id: 4, title: 'Marketplace scout that scores deals every 15 minutes', author: 'Johanna D.', role: 'Operations', tool: 'n8n', hours: 3 },
  { id: 7, title: 'Customer survey analysis, charted in minutes', author: 'Faisal K.', role: 'Marketing', tool: 'Claude', hours: 5 },
  { id: 9, title: 'PocketCFO: cash-flow forecast that flags your low point', author: 'Thomas N.', role: 'Finance', tool: 'Claude Code', hours: 4 },
  { id: 10, title: 'Proposal comparison engine that flags cost variance', author: 'Chris A.', role: 'Finance', tool: 'Claude', hours: 7 },
  { id: 16, title: 'Team ops dashboard with a daily digest', author: 'Kira F.', role: 'Operations', tool: 'n8n', hours: 3 },
  { id: 21, title: 'Smart-crop ad creative in every placement size', author: 'Leah M.', role: 'Marketing', tool: 'Claude', hours: 6 },
  { id: 19, title: 'Events pipeline with Notion as the source of truth', author: 'Sam R.', role: 'Operations', tool: 'Notion', hours: 4 },
  { id: 25, title: 'Slack QA bot that answers coach questions', author: 'Gerritt V.', role: 'Product', tool: 'Claude', hours: 5 },
  { id: 17, title: 'Full careers site built in two hours with Claude Code', author: 'Dalton B.', role: 'People', tool: 'Claude Code', hours: 10 },
  { id: 18, title: 'B2B dashboard and pitch-deck generator', author: 'Alex W.', role: 'Sales', tool: 'Claude', hours: 6 },
  { id: 15, title: 'City affordability analysis in an afternoon', author: 'Nina P.', role: 'Data', tool: 'ChatGPT', hours: 3 },
  { id: 1, title: 'Quantitative reasoning tutor', author: 'Owen J.', role: 'Education', tool: 'Claude', hours: 2 },
]

export const PEOPLE = [
  { img: 'pic-01', name: 'Jordan Lee', role: 'VP Sales' },
  { img: 'pic-02', name: 'Maya Chen', role: 'Head of People' },
  { img: 'pic-03', name: 'Sam Rivera', role: 'Ops Lead' },
  { img: 'pic-04', name: 'Ava Brooks', role: 'Finance Manager' },
  { img: 'pic-05', name: 'Noah Patel', role: 'Product Manager' },
  { img: 'pic-06', name: 'Grace Kim', role: 'Marketing Director' },
  { img: 'pic-07', name: 'Leo Martins', role: 'Account Executive' },
  { img: 'pic-08', name: 'Zoe Adams', role: 'Recruiter' },
  { img: 'pic-09', name: 'Ethan Wright', role: 'COO' },
  { img: 'pic-10', name: 'Isla Turner', role: 'Support Lead' },
  { img: 'pic-11', name: 'Ravi Shah', role: 'Data Analyst' },
  { img: 'pic-12', name: 'Chloe Martin', role: 'CEO' },
  { img: 'pic-13', name: 'Ben Okafor', role: 'Engineer' },
  { img: 'pic-14', name: 'Lena Fischer', role: 'Designer' },
  { img: 'pic-15', name: 'Omar Haddad', role: 'Controller' },
]

// Real Leland instructors (used on leland.ai today).
export const INSTRUCTORS = [
  { img: 'andrew-q', name: 'Andrew Q.', role: 'AI Builder instructor' },
  { img: 'dessy-k', name: 'Dessy K.', role: 'AI Builder instructor' },
  { img: 'kristen-h', name: 'Kristen H.', role: 'AI Builder instructor' },
]

// Logos already on leland.ai. dir + file + display height.
export const LOGOS = [
  { name: 'Google', src: 'logos/google.svg', h: 28 },
  { name: 'JPMorgan Chase', src: 'logos/JPMorganChase.svg', h: 22 },
  { name: 'Bain', src: 'logos/bain.svg', h: 22 },
  { name: 'Shopify', src: '../logos/shopify.svg', h: 28 },
  { name: "McDonald's", src: '../logos/mcdonalds.svg', h: 28 },
  { name: 'GitLab', src: '../logos/gitlab-logo-400-rgb.svg', h: 40 },
  { name: 'Datavant', src: '../logos/datavant.svg', h: 22 },
  { name: 'American Express', src: '../logos/american_express.svg', h: 14 },
  { name: 'Adobe', src: '../logos/adobe.svg', h: 22 },
  { name: 'Morgan Stanley', src: 'org-logos/morgan-stanley.svg', h: 18 },
  { name: 'Salesforce', src: 'org-logos/salesforce.svg', h: 30 },
  { name: 'Nike', src: 'org-logos/nike.svg', h: 22 },
  { name: 'Cisco', src: 'org-logos/cisco.svg', h: 26 },
  { name: 'Etsy', src: 'org-logos/etsy.svg', h: 22 },
  { name: 'Figma', src: 'org-logos/figma.svg', h: 26 },
  { name: 'LinkedIn', src: 'org-logos/linkedin.svg', h: 22 },
  { name: 'Walmart', src: 'org-logos/walmart.png', h: 24 },
  { name: 'Miro', src: 'org-logos/miro.svg', h: 24 },
]
export const logoSrc = (l) => (l.src.startsWith('../') ? `${import.meta.env.BASE_URL}${l.src.slice(3)}` : asset(l.src))

export const TOOLS = [
  { name: 'Claude', src: 'logos/tools/claude-ai.png' },
  { name: 'ChatGPT', src: 'logos/tools/openai.png' },
  { name: 'Gemini', src: 'logos/tools/gemini-ai.png' },
  { name: 'Cursor', src: 'logos/tools/cursor-1.png' },
  { name: 'n8n', src: 'logos/tools/n8n.png' },
  { name: 'Perplexity', src: 'logos/tools/perplexity.png' },
]

// Real live-session titles from the AI Builder Program.
export const SESSIONS = [
  { day: 'Mon', date: 13, title: 'Make every output sound like you', level: 2 },
  { day: 'Thu', date: 16, title: 'Build your first agent team', level: 2 },
  { day: 'Tue', date: 21, title: 'Automate your inbox with n8n', level: 2 },
  { day: 'Thu', date: 23, title: 'Ship an internal tool with Claude Code', level: 3 },
]

// The nine AI-native operating principles are not public yet: short
// placeholder labels so charts have something to plot.
export const PRINCIPLES = ['Delegate', 'Prompt', 'Verify', 'Automate', 'Build', 'Data', 'Judgment', 'Share', 'Iterate']

export const LEVELS = [
  { n: 0, name: 'Curious', color: '#E5E1D8' },
  { n: 1, name: 'User', color: '#E5C9A8' },
  { n: 2, name: 'Practitioner', color: '#7BA4E0' },
  { n: 3, name: 'Builder', color: '#F5C84B' },
  { n: 4, name: 'Architect', color: '#2E2E2E' },
]

export const BOOK_DEMO_URL = 'https://joinleland.typeform.com/to/bZuwV6t5?utm_source=business'
