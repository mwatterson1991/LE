import React, { useState, useEffect, useRef } from 'react'
import Marquee from 'react-fast-marquee'
import Squares from './components/Squares'
import CardSwap, { Card } from './components/CardSwap'

const LEVELS = [
  {
    id: 1, color: '#A5E446', accent: '#A5E446', svgW: 280, svgH: 400, svgScale: 308,
    nodes: [
      { id: 'input', x: 140, y: 60, type: 'source' },
      { id: 'ai', x: 140, y: 200, type: 'ai' },
      { id: 'output', x: 140, y: 340, type: 'output' },
    ],
    edges: [{ from: 'input', to: 'ai' }, { from: 'ai', to: 'output' }],
    loops: [],
  },
  {
    id: 2, color: '#A5E446', accent: '#A5E446', svgW: 280, svgH: 420, svgScale: 330,
    nodes: [
      { id: 'trigger', x: 140, y: 45, type: 'source' },
      { id: 'ai', x: 140, y: 145, type: 'ai' },
      { id: 'tool1', x: 70, y: 250, type: 'tool' },
      { id: 'tool2', x: 140, y: 250, type: 'tool' },
      { id: 'tool3', x: 210, y: 250, type: 'tool' },
      { id: 'log', x: 140, y: 360, type: 'output' },
    ],
    edges: [
      { from: 'trigger', to: 'ai' }, { from: 'ai', to: 'tool1' }, { from: 'ai', to: 'tool2' },
      { from: 'ai', to: 'tool3' }, { from: 'tool1', to: 'log' }, { from: 'tool2', to: 'log' },
      { from: 'tool3', to: 'log' },
    ],
    loops: [],
  },
  {
    id: 3, color: '#A5E446', accent: '#A5E446', svgW: 280, svgH: 420, svgScale: 330,
    nodes: [
      { id: 'input', x: 140, y: 35, type: 'source' },
      { id: 'research', x: 90, y: 140, type: 'agent' },
      { id: 'write', x: 190, y: 140, type: 'agent' },
      { id: 'tools', x: 140, y: 250, type: 'ai' },
      { id: 'crm', x: 90, y: 360, type: 'tool' },
      { id: 'email', x: 190, y: 360, type: 'output' },
    ],
    edges: [
      { from: 'input', to: 'research' }, { from: 'input', to: 'write' },
      { from: 'research', to: 'tools' }, { from: 'write', to: 'tools' },
      { from: 'tools', to: 'crm' }, { from: 'tools', to: 'email' },
      { from: 'research', to: 'write', dashed: true },
    ],
    loops: [{ x: 90, y: 140, r: 25 }],
  },
  {
    id: 4, color: '#A5E446', accent: '#A5E446', svgW: 450, svgH: 280, svgScale: 242,
    nodes: [
      { id: 'orch', x: 210, y: 40, type: 'orchestrator' },
      { id: 'a1', x: 90, y: 130, type: 'agent' },
      { id: 'a2', x: 210, y: 130, type: 'agent' },
      { id: 'a3', x: 330, y: 130, type: 'agent' },
      { id: 'eval', x: 210, y: 210, type: 'eval' },
      { id: 'qa', x: 360, y: 210, type: 'eval' },
    ],
    edges: [
      { from: 'orch', to: 'a1' }, { from: 'orch', to: 'a2' }, { from: 'orch', to: 'a3' },
      { from: 'a1', to: 'eval' }, { from: 'a2', to: 'eval' }, { from: 'a3', to: 'qa' },
      { from: 'eval', to: 'orch', dashed: true }, { from: 'qa', to: 'orch', dashed: true },
    ],
    loops: [],
  },
  {
    id: 5, color: '#A5E446', accent: '#A5E446', svgW: 450, svgH: 280, svgScale: 242,
    nodes: [
      { id: 'goal', x: 225, y: 25, type: 'source' },
      { id: 'orch', x: 225, y: 90, type: 'orchestrator' },
      { id: 'mem', x: 85, y: 150, type: 'agent' },
      { id: 'a1', x: 165, y: 170, type: 'agent' },
      { id: 'a2', x: 285, y: 170, type: 'agent' },
      { id: 'build', x: 365, y: 150, type: 'agent' },
      { id: 'eval', x: 225, y: 235, type: 'eval' },
      { id: 'fix', x: 105, y: 235, type: 'eval' },
      { id: 'dash', x: 345, y: 235, type: 'output' },
    ],
    edges: [
      { from: 'goal', to: 'orch' }, { from: 'orch', to: 'mem' }, { from: 'orch', to: 'a1' },
      { from: 'orch', to: 'a2' }, { from: 'orch', to: 'build' }, { from: 'a1', to: 'eval' },
      { from: 'a2', to: 'eval' }, { from: 'build', to: 'dash' },
      { from: 'eval', to: 'fix', dashed: true }, { from: 'fix', to: 'orch', dashed: true },
      { from: 'eval', to: 'orch', dashed: true }, { from: 'mem', to: 'a1' }, { from: 'mem', to: 'a2' },
    ],
    loops: [{ x: 225, y: 90, r: 28 }],
  },
]

function getNodeCenter(nodeId, nodes) {
  const n = nodes.find((x) => x.id === nodeId)
  if (!n) return { x: 0, y: 0 }
  return { x: n.x, y: n.y }
}

function WorkflowDiagram({ level }) {
  const { nodes, edges, loops, color, accent } = level
  const svgW = level.svgW || 450, svgH = level.svgH || 280
  const nodeRadius = (type) => {
    if (type === 'orchestrator') return 26
    if (type === 'source') return 18
    if (type === 'ai') return 22
    if (type === 'agent') return 20
    return 16
  }
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ height: level.svgScale || 260, width: 'auto', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`bg-${level.id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={svgW} height={svgH} fill={`url(#bg-${level.id})`} rx="8" />
      {edges.map((edge, i) => {
        const from = getNodeCenter(edge.from, nodes)
        const to = getNodeCenter(edge.to, nodes)
        const dx = to.x - from.x, dy = to.y - from.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const fromR = nodeRadius(nodes.find((n) => n.id === edge.from)?.type)
        const toR = nodeRadius(nodes.find((n) => n.id === edge.to)?.type)
        const startX = from.x + (dx / dist) * fromR, startY = from.y + (dy / dist) * fromR
        const endX = to.x - (dx / dist) * (toR + 4), endY = to.y - (dy / dist) * (toR + 4)
        const cpx = (startX + endX) / 2 + (edge.dashed ? (dy > 0 ? -30 : 30) : 0)
        const cpy = (startY + endY) / 2 + (edge.dashed ? (dx > 0 ? -20 : 20) : 0)
        return (
          <g key={i}>
            <path d={`M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`} stroke={color} strokeWidth="1" strokeDasharray="2,4" strokeLinecap="round" fill="none" opacity="0.7" />
            <circle r="3" fill={edge.dashed ? accent : color} opacity="0.9">
              <animateMotion dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" path={`M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`} />
            </circle>
          </g>
        )
      })}
      {loops.map((loop, i) => (
        <g key={i}>
          <path d={`M ${loop.x + loop.r} ${loop.y} C ${loop.x + loop.r * 2.5} ${loop.y - loop.r * 2}, ${loop.x - loop.r * 1.5} ${loop.y - loop.r * 2}, ${loop.x - loop.r} ${loop.y}`} stroke={color} strokeWidth="1" strokeDasharray="2,4" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      ))}
      {nodes.map((node) => {
        const r = nodeRadius(node.type)
        return (
          <g key={node.id}>
            {node.type === 'orchestrator' ? (
              <rect x={node.x - r} y={node.y - r * 0.7} width={r * 2} height={r * 1.4} rx="5" fill="#121212" stroke={color} strokeWidth="1" />
            ) : (
              <circle cx={node.x} cy={node.y} r={r} fill="#121212" stroke={color} strokeWidth="1" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const StarRow = () => (
  <div className="star-row" style={{ color: 'var(--accent)' }}>
    {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
  </div>
)

const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

function Countdown() {
  const [time, setTime] = useState({ d: '--', h: '--', m: '--', s: '--' })
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const target = new Date('2026-04-21T16:00:00Z')
    function update() {
      const now = new Date()
      const diff = target - now
      if (diff <= 0) {
        setStarted(true)
        return
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  if (started) {
    return (
      <div className="countdown">
        <span className="cd-label">COHORT STARTED</span>
      </div>
    )
  }

  return (
    <div className="countdown">
      <span className="cd-label">NEXT COHORT &rarr;</span>
      <div className="cd-units">
        <div className="cd-unit">
          <span className="cd-num">{time.d}</span>
          <span className="cd-lbl">DAYS</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.h}</span>
          <span className="cd-lbl">HRS</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.m}</span>
          <span className="cd-lbl">MIN</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.s}</span>
          <span className="cd-lbl">SEC</span>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={() => setOpen(!open)}>
      <span className="faq-index">{String(index + 1).padStart(2, '0')}</span>
      <div className="faq-body">
        <div className="faq-q">
          <h3>{question}</h3>
          <ChevronIcon />
        </div>
        <div className="faq-a">
          <p dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      </div>
    </div>
  )
}

function CourseScreenshot({ level }) {
  return (
    <div className="course-screenshot">
      <WorkflowDiagram level={level} />
    </div>
  )
}

function CourseSection({ id, num, type, title, tagline, tags, sessions, cohorts, reversed, levelIndex }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="course-section" id={id}>
      <div className="container">
        <div className={`course-layout${reversed ? ' reversed' : ''}`}>
          <div className="course-content">
            <div className="course-label">
              <span>LEVEL</span>
              <span className="num">{num}</span>
            </div>
            <h2>{title}</h2>
            <p className="course-tagline">{tagline}</p>
            <div className="course-audience">
              {tags.map((tag, i) => (
                <span className="tag" key={i}>{tag}</span>
              ))}
            </div>
            <div className={`course-sessions${expanded ? ' expanded' : ''}`}>
              <div className="course-sessions-label">Curriculum</div>
              <div className="course-sessions-inner">
                {sessions.map((session, i) => (
                  <div className="course-session" key={i}>
                    <span className="course-session-num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="course-session-text">
                      <span className="course-session-title">{session.title}</span>
                      <span className="course-session-sub">{session.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              {!expanded ? (
                <div className="course-sessions-fade" onClick={() => setExpanded(true)}>
                  <span className="course-sessions-toggle">Show all sessions</span>
                </div>
              ) : (
                <div className="course-sessions-collapse" onClick={() => setExpanded(false)}>
                  <span className="course-sessions-toggle">Show less</span>
                </div>
              )}
            </div>
            <div className="course-cta-group">
              <div className="cohort-row cohort-next">
                <div className="cohort-cal">
                  <span className="cohort-cal-month">{cohorts[0].month}</span>
                  <span className="cohort-cal-day">{cohorts[0].day}</span>
                </div>
                <div className="cohort-info">
                  <span className="cohort-date">Starting {cohorts[0].date}</span>
                  <span className="cohort-label">$999</span>
                </div>
                <a href="#" className="btn btn-primary">
                  Enroll
                  <span className="arrow">&rarr;</span>
                </a>
              </div>
              {cohorts.length > 1 && (
                <span className="cohort-upcoming">Also runs {cohorts.slice(1).map(c => c.date).join(' & ')}</span>
              )}
            </div>
          </div>
          <CourseScreenshot level={LEVELS[levelIndex]} />
        </div>
      </div>
    </section>
  )
}

function App() {
  const heroRef = useRef(null)
  const [showSticky, setShowSticky] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState(null)

  const navSections = [
    { id: 'course-1', label: 'Level 01' },
    { id: 'course-2', label: '02' },
    { id: 'course-3', label: '03' },
    { id: 'course-4', label: '04' },
    { id: 'course-5', label: '05' },
    { id: 'enterprise', label: 'For Teams' },
  ]

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const stickyObserver = new IntersectionObserver((entries) => {
      if (window.innerWidth <= 768) {
        setShowSticky(!entries[0].isIntersecting)
      }
    }, { threshold: 0 })
    stickyObserver.observe(hero)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      stickyObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!scrolled) { setActiveSection(null); return }
    const sectionIds = navSections.map(s => s.id)
    const handleScroll = () => {
      let current = null
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) current = id
        }
      }
      setActiveSection(current)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  const courses = [
    {
      id: 'course-1', num: '01', type: 'LIVE COURSE',
      title: 'Foundations',
      tagline: "Understand what's possible with AI and start using it today. Best for knowledge workers new to AI, professionals building a foundation, and teams preparing for the series.",
      tags: ['Tuesdays and Fridays', '3 Weeks'],
      sessions: [
        { title: 'Transform How You Work Forever', sub: 'AI tool selection, iterative prompting, and turning messy notes into structured outputs.' },
        { title: 'Let AI Research and Synthesize for You', sub: 'Use AI to research markets, synthesize findings, and produce strategic deliverables.' },
        { title: 'Analyze Data in Minutes, Not Hours', sub: 'Work with spreadsheets, build financial models, and create visualizations using AI.' },
        { title: 'Build a Workflow That Runs Daily', sub: 'Chain prompts into repeatable workflows that surface leads and opportunities automatically.' },
        { title: 'Train AI to Write Emails That Sound Like You', sub: 'Teach AI your voice and build personalized multi-touch communication sequences.' },
        { title: 'Build an End-to-End Process Workflow', sub: 'Connect research inputs to automated outputs with human-in-the-loop checkpoints.' },
      ],
      cohorts: [
        { month: 'APR', day: '21', date: 'April 21' },
        { month: 'MAY', day: '19', date: 'May 19' },
        { month: 'JUN', day: '16', date: 'June 16' },
      ],
      levelIndex: 0,
      reversed: false,
    },
    {
      id: 'course-2', num: '02', type: 'BOOTCAMP',
      title: 'Intelligent Automation',
      tagline: 'Make AI work for you. Automate the tasks eating your week. Best for operators and managers, anyone with repetitive workflows, and professionals who want measurable time back.',
      tags: ['Tuesdays and Fridays', '3 Weeks'],
      sessions: [
        { title: 'Automate the Task You Do Every Week', sub: 'Build your first connected automation that handles a recurring task without you.' },
        { title: 'Reframe Your Work as a System', sub: 'Map your recurring work as a system and build a prioritized automation backlog.' },
        { title: 'Build a Tool or Webpage Without a Developer', sub: 'Use vibe coding to build and publish a working tool or page with AI.' },
        { title: 'Automate Tasks That Span 5+ Tools', sub: 'Build multi-tool workflows with AI processing, error handling, and parallel outputs.' },
        { title: 'Build a Content or Reporting Engine', sub: 'Turn one input into multiple formatted outputs across destinations on a schedule.' },
        { title: 'Ship Your Operating Stack', sub: 'Connect your automations into a coherent system where inputs flow and exceptions surface.' },
      ],
      cohorts: [
        { month: 'APR', day: '21', date: 'April 21' },
        { month: 'MAY', day: '19', date: 'May 19' },
      ],
      levelIndex: 1,
      reversed: true,
    },
    {
      id: 'course-3', num: '03', type: 'LIVE COURSE',
      title: 'Agentic Workflows',
      tagline: 'Build AI agents that plan, decide, and execute without babysitting. Best for technical professionals, product builders, and anyone ready to go beyond prompts.',
      tags: ['Tuesdays and Fridays', '3 Weeks'],
      sessions: [
        { title: 'Ship Your First Autonomous Agent', sub: 'Build a research agent that takes an input and returns a structured brief autonomously.' },
        { title: 'Run an Agent Across a List', sub: 'Process entire lists with an agent that enriches each row with structured data at scale.' },
        { title: 'Build an Agent That Writes', sub: 'Create an agent that reads context and writes personalized messages for each recipient.' },
        { title: 'Connect an Agent to Your Tools', sub: 'Build an agent that logs activity and updates records in external systems like a CRM.' },
        { title: 'Build Software With AI', sub: 'Spec and build a working tool or dashboard through natural language, no code required.' },
        { title: 'Build Your Full Agent Pipeline', sub: 'Chain agents into one pipeline that researches, personalizes, logs, and follows up.' },
      ],
      cohorts: [
        { month: 'MAY', day: '19', date: 'May 19' },
      ],
      levelIndex: 2,
      reversed: false,
    },
    {
      id: 'course-4', num: '04', type: 'BOOTCAMP',
      title: 'AI Systems Design',
      tagline: 'Design AI-powered systems that scale across your org. Best for team leads and architects, operations and strategy, and professionals designing org-level AI.',
      tags: ['Tuesdays and Fridays', '3 Weeks'],
      sessions: [
        { title: 'Give an Agent a Goal, Not a Script', sub: 'Design goal-directed agents that plan and execute steps toward an objective autonomously.' },
        { title: 'Build an Eval System', sub: 'Define rubrics and score agent outputs to measure and improve performance over time.' },
        { title: 'Build an Agent That Improves Software', sub: 'Give an agent a codebase and improvement goal, let it build, test, and iterate.' },
        { title: 'Build an Orchestration Layer', sub: 'Build an orchestrator that delegates subtasks to specialized agents and assembles results.' },
        { title: 'Build a QA Layer for Autonomous Systems', sub: 'Monitor agent outputs, score quality, and alert when something needs human review.' },
        { title: 'Ship a Goal-Directed Delivery System', sub: 'Deploy an end-to-end autonomous pipeline with evals and human checkpoints.' },
      ],
      cohorts: [
        { month: 'JUN', day: '16', date: 'June 16' },
      ],
      levelIndex: 3,
      reversed: true,
    },
    {
      id: 'course-5', num: '05', type: 'LIVE COURSE',
      title: 'Advanced AI Architecture',
      tagline: 'Orchestrate multi-agent systems and enterprise-grade AI infrastructure. Best for senior technical leaders, AI/ML engineers, and enterprise architects.',
      tags: ['Tuesdays and Fridays', '3 Weeks'],
      sessions: [
        { title: 'Give Your Agents Institutional Memory', sub: 'Build a retrieval system so agents have real organizational context when they act.' },
        { title: 'Build an Agent That Works Toward a Long-Horizon Goal', sub: 'Design agents that maintain context across days with checkpointing and drift prevention.' },
        { title: 'Build an Agent That Builds and Tests Software', sub: 'Give an agent a product goal and let it write, test, and iterate autonomously.' },
        { title: 'Build a System That Self-Corrects', sub: 'Create feedback loops that detect errors, attempt corrections, and escalate when needed.' },
        { title: 'Evaluate a System You\'re Not Watching', sub: 'Build a live dashboard with KPIs, anomaly detection, and decision-support alerts.' },
        { title: 'Build a System That Runs the Business', sub: 'Connect all layers into one autonomous system that pursues goals with minimal human input.' },
      ],
      cohorts: [
        { month: 'JUL', day: '14', date: 'July 14' },
      ],
      levelIndex: 4,
      reversed: false,
    },
  ]

  const faqs = [
    {
      q: 'Do I need coding experience?',
      a: 'No. The series is designed for knowledge workers, not engineers. You will learn technical concepts, but everything is taught in a way that prioritizes practical application over code. That said, if you do have a technical background, the later courses (Agentic Workflows and Advanced Architecture) go deep enough to challenge experienced builders.',
    },
    {
      q: 'Can I take just one course?',
      a: 'Yes. Each course stands alone. But the series is designed to build on itself, and enrolling in all five gives you the best price and the most complete skill set.',
    },
    {
      q: 'What if I miss a live session?',
      a: 'Every session is recorded and available within 24 hours. You also get access to async discussion and coach support between sessions.',
    },
    {
      q: 'Is this for individuals or teams?',
      a: 'Both. Individuals can enroll directly. Teams of 5+ get volume pricing, a dedicated account manager, and custom use case workshops. <a href="#enterprise">Learn more about team training.</a>',
    },
    {
      q: "What's included in each course?",
      a: '6 live sessions, recorded replays, hands-on projects, a course community, and direct access to your instructor.',
    },
    {
      q: 'How is this different from free AI tutorials?',
      a: 'Free content teaches you features. This series teaches you systems. You will build real workflows, get expert feedback, and leave with tools you actually use at work. The cohort format keeps you accountable, and the live instruction means you can ask questions in real time.',
    },
  ]

  const testimonials = [
    {
      headline: 'I automated 6 hours of weekly reporting in the first week.',
      quote: 'My manager asked how I did it. The automation module alone paid for the entire course. I went from copying data between spreadsheets to having AI handle the entire pipeline while I focus on analysis.',
      initials: 'SK', name: 'Sarah K.', role: 'Operations Lead',
    },
    {
      headline: "This wasn't another 'intro to ChatGPT' course.",
      quote: 'I built real systems I still use every day. The agentic workflows module changed how I think about product development entirely. We shipped a feature in 2 days that would have taken 2 weeks before.',
      initials: 'MT', name: 'Marcus T.', role: 'Product Manager',
    },
    {
      headline: 'Zero to agentic workflows in production within a month.',
      quote: 'Our team went from no AI adoption to running agentic workflows in production. The systems design course gave us the architecture to do it right. Best investment our engineering org made this year.',
      initials: 'RL', name: 'Rachel L.', role: 'Director of Engineering',
    },
  ]

  const trackItems = [
    { num: '01', name: 'Learn Foundations', tagline: "Understand what's possible with AI and start using it today.", href: '#course-1', seats: 12, thumb: 'Image-1.png' },
    { num: '02', name: 'Intelligent Automation', tagline: 'Make AI work for you. Automate the tasks eating your week.', href: '#course-2', seats: 12, thumb: 'Image-2.png' },
    { num: '03', name: 'Agentic Workflows', tagline: 'Build AI agents that plan, decide, and execute without babysitting.', href: '#course-3', thumb: 'Image-3.png' },
    { num: '04', name: 'AI Systems Design', tagline: 'Design AI-powered systems that scale across your org.', href: '#course-4', thumb: 'Image-4.png' },
    { num: '05', name: 'Advanced AI Architecture', tagline: 'Orchestrate multi-agent systems and enterprise-grade AI infrastructure.', href: '#course-5', thumb: 'Image-5.png' },
  ]

  return (
    <>
      {/* Navigation */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <div className={`nav-default${scrolled ? ' hidden' : ''}`}>
            <a
              href="https://joinleland.typeform.com/to/tjyc1wni"
              className="btn btn-secondary btn-sm"
              style={{ textTransform: 'uppercase', borderRadius: '4px', fontSize: '12px' }}
            >
              Get a recommendation
            </a>
          </div>
          <div className={`nav-tabs${scrolled ? '' : ' hidden'}`}>
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`nav-tab${activeSection === s.id ? ' active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-bg">
          <Squares
            direction="diagonal"
            borderColor="#1a1a1a"
            hoverFillColor="#111111"
            squareSize={40}
            speed={0.5}
          />
        </div>
        <div className="container">
          <Countdown />

          <h1>AI Mastery Program</h1>

          <p className="hero-sub">Our five-course series is designed to help any knowledge worker 100x their output with an AI-first approach.</p>

          <div className="proof-bar" id="courses">
            <StarRow />
            <span className="rating">4.9/5</span> AVERAGE RATING
            <span className="proof-sep">&middot;</span>
            COHORT-BASED LIVE INSTRUCTION
            <span className="proof-sep">&middot;</span>
            <svg className="proof-icon" width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
              <rect x="2" y="5" width="14" height="14" rx="0"/>
              <polygon points="18,7 23,4 23,20 18,17"/>
            </svg>
            RECORDED
          </div>

          <div className="hero-cta-row">
            <a
              href="https://joinleland.typeform.com/to/tjyc1wni"
              className="btn btn-primary btn-lg"
              style={{ textTransform: 'uppercase' }}
            >
              Get started
              <span className="arrow">&rarr;</span>
            </a>
          </div>

          <div className="track-cards">
            {trackItems.map((item) => (
              <div className="track-card" key={item.num} onClick={() => document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="track-card-body">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/thumbnails/${item.thumb}`}
                    alt={item.name}
                    className="track-card-thumb"
                  />
                  <div className="track-label">
                    <span className="track-label-text">LEVEL</span>
                    <span className="track-label-num">{item.num}</span>
                  </div>
                  <div className="track-title">{item.name}</div>
                  <div className="track-desc">{item.tagline}</div>
                  <div className="track-tags">
                    <span className="track-tag">3 Weeks</span>
                    <span className="track-tag">6 Sessions</span>
                    {item.seats && <span className="track-tag track-tag-accent">{item.seats} Seats Left!</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="logo-ticker">
            <span className="logo-ticker-label">Taught by experts from places like:</span>
            <Marquee gradient gradientColor="#000000" gradientWidth={80} speed={35}>
              {[...Array(2)].flatMap((_, round) => [
                { file: 'OpenAI Logo 1.svg', alt: 'OpenAI', className: 'logo-ticker-img logo-ticker-lg' },
                { file: 'Spotify Logo 2024.svg', alt: 'Spotify', className: 'logo-ticker-img logo-ticker-lg' },
                { file: 'Fabletics Logo Vector.svg', alt: 'Fabletics', className: 'logo-ticker-img' },
                { file: 'google.svg', alt: 'Google', className: 'logo-ticker-img logo-ticker-lg' },
                { file: 'meta.svg', alt: 'Meta', className: 'logo-ticker-img' },
                { file: 'intiut.svg', alt: 'Intuit', className: 'logo-ticker-img' },
                { file: 'Amazon_logo.svg', alt: 'Amazon', className: 'logo-ticker-img' },
              ].map(({ file, alt, className }) => (
                <img key={`${alt}-${round}`} src={`${import.meta.env.BASE_URL}assets/logos/${file}`} alt={alt} className={className} />
              )))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* Review */}
      <section className="review-hero">
        <div className="container">
          <div className="review-hero-card">
            <div className="review-hero-content">
              <h2 className="review-hero-headline">&ldquo;I automated 6 hours of weekly reporting in the first week.</h2>
              <p className="review-hero-quote">My manager asked how I did it. The automation module alone paid for the entire course. I went from copying data between spreadsheets to having AI handle the entire pipeline while I focus on analysis.&rdquo;</p>
              <span className="review-hero-author">Adam K., Operations Lead</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Sections */}
      {courses.map((course) => (
        <CourseSection key={course.id} {...course} />
      ))}

      {/* Enterprise Section */}
      <section className="enterprise" id="enterprise">
        <div className="container">
          <div className="enterprise-card">
            <div className="enterprise-card-content">
              <h2>For Teams</h2>
              <p className="enterprise-desc">
                Train your team on AI. See ROI in weeks. We work with companies from 10-person startups to Fortune 500 to design custom AI training programs. Volume pricing, custom use cases, dedicated support.
              </p>
              <div className="enterprise-bottom">
                <ul className="enterprise-points">
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h3v1H2v2H1V1zM10 1h3v3h-1V2h-2V1zM1 10v3h3v-1H2v-2H1zM13 10v3h-3v-1h2v-2h1z" fill="currentColor"/><rect x="5" y="5" width="4" height="4" fill="currentColor"/></svg> Team licenses from 5 seats</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="3" fill="currentColor"/><rect x="2" y="5.5" width="10" height="3" fill="currentColor"/><rect x="2" y="10" width="10" height="3" fill="currentColor"/></svg> Custom workshops available</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="1" width="4" height="4" fill="currentColor"/><rect x="3" y="6" width="8" height="2" fill="currentColor"/><rect x="1" y="9" width="12" height="4" fill="currentColor"/></svg> Dedicated account manager</li>
                </ul>
                <a href="mailto:teams@joinleland.com" className="btn btn-primary btn-lg">
                  Talk to Our Team
                  <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="certification" id="certification">
        <div className="container">
          <div className="cert-intro">
            <h2>Walk away certified.</h2>
            <p className="cert-desc">
              Every course in the series culminates in a verified certificate of completion from Leland. Finish all five and earn the full AI Mastery designation — a signal to employers, clients, and colleagues that you operate at the highest level of AI proficiency.
            </p>
          </div>

          <div className="cert-swap-wrapper">
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={false}
            >
              {/* Card 1: Full AI Mastery Series */}
              <Card>
                <div className="cert-card-inner">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/seal.png`}
                    alt="Leland Verified Seal"
                    className="cert-seal"
                  />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed the</span>
                      <span className="cert-program">AI Mastery Series</span>
                      <span className="cert-subprogram">Foundations &middot; Intelligent Automation &middot; Agentic Workflows &middot; AI Systems Design &middot; Advanced AI Architecture</span>
                    </div>
                    <div className="cert-footer">
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Program Director</span>
                      </div>
                      <div className="cert-meta">
                        <span className="cert-date-label">ISSUED</span>
                        <span className="cert-date-value">2026</span>
                      </div>
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Leland Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Foundations */}
              <Card>
                <div className="cert-card-inner">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/seal.png`}
                    alt="Leland Verified Seal"
                    className="cert-seal"
                  />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed</span>
                      <span className="cert-program">Learn Foundations</span>
                      <span className="cert-subprogram">Level 01 &middot; AI Mastery Series</span>
                    </div>
                    <div className="cert-footer">
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Program Director</span>
                      </div>
                      <div className="cert-meta">
                        <span className="cert-date-label">ISSUED</span>
                        <span className="cert-date-value">2026</span>
                      </div>
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Leland Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 3: Intelligent Automation */}
              <Card>
                <div className="cert-card-inner">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/seal.png`}
                    alt="Leland Verified Seal"
                    className="cert-seal"
                  />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed</span>
                      <span className="cert-program">Intelligent Automation</span>
                      <span className="cert-subprogram">Level 02 &middot; AI Mastery Series</span>
                    </div>
                    <div className="cert-footer">
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Program Director</span>
                      </div>
                      <div className="cert-meta">
                        <span className="cert-date-label">ISSUED</span>
                        <span className="cert-date-value">2026</span>
                      </div>
                      <div className="cert-sig">
                        <span className="cert-sig-line"></span>
                        <span className="cert-sig-label">Leland Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="container">
          <h2>Start building with AI.</h2>
          <p>The next cohort begins April 21. Spots are limited.</p>
          <div className="cta-row">
            <a href="#courses" className="btn btn-primary btn-lg">
              Enroll Now
              <span className="arrow">&rarr;</span>
            </a>
            <a href="#enterprise" className="btn btn-secondary btn-lg">
              Train Your Team
              <span className="arrow">&rarr;</span>
            </a>
          </div>
          <div className="final-rec">
            <span className="final-rec-label">Not sure where to start?</span>
            <a href="https://joinleland.typeform.com/to/tjyc1wni" className="final-rec-link">Get a recommendation</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="sticky-cta" style={{ display: showSticky ? 'block' : 'none' }}>
        <div className="container">
          <div>
            <div className="sticky-text">AI Mastery Series</div>
            <div className="sticky-sub">Next cohort: April 21</div>
          </div>
          <a href="#courses" className="btn btn-primary btn-sm">
            Explore Courses
            <span className="arrow">&rarr;</span>
          </a>
        </div>
      </div>
    </>
  )
}

export default App
