import React, { useState, useEffect, useRef } from 'react'
import Marquee from 'react-fast-marquee'
import Squares from './components/Squares'
import CardSwap, { Card } from './components/CardSwap'

const ENROLL_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69af7ea5b3a78d3ad6852270)'
const DISCOUNT_WEBHOOK_URL = '' // TODO: set n8n webhook URL for discount emails

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

const LelandIcon = ({ name }) => (
  <img src={`${import.meta.env.BASE_URL}assets/icons/${name}.svg`} alt={name} className="when-where-svg-icon" />
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

function CourseAccordionItem({ course, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion-item${open ? ' open' : ''}`}>
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <div className="accordion-header-left">
          <span className="accordion-level">LEVEL {course.num}</span>
          <h3 className="accordion-title">{course.title}</h3>
          <p className="accordion-tagline">{course.tagline.split('.')[0]}.</p>
        </div>
        <div className="accordion-header-right">
          <ChevronIcon />
        </div>
      </div>
      <div className="accordion-body">
        <div className="accordion-sessions">
          <div className="course-sessions-label">Curriculum</div>
          {course.sessions.map((session, i) => (
            <div className="course-session" key={i}>
              <span className="course-session-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="course-session-text">
                <span className="course-session-title">{session.title}</span>
                <span className="course-session-sub">{session.sub}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="accordion-meta">
          <div className="accordion-meta-row">
            <span className="accordion-meta-label">Schedule</span>
            <span className="accordion-meta-value">Tuesdays & Fridays &middot; 3 Weeks</span>
          </div>
          <hr className="accordion-meta-divider" />
          <div className="accordion-meta-row">
            <span className="accordion-meta-label">Next Cohort</span>
            <span className="accordion-meta-value">{course.cohorts[0].date}</span>
          </div>
          {course.cohorts.length > 1 && (
            <div className="accordion-meta-row">
              <span className="accordion-meta-label">Also runs {course.cohorts.slice(1).map(c => c.date).join(' & ')}</span>
            </div>
          )}
          <span className="accordion-price">{course.price}</span>
          <a href={course.enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textTransform: 'uppercase' }}>
            Enroll Now
            <span className="arrow">&rarr;</span>
          </a>
          <a href={course.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="btn accordion-learn-more-btn" style={{ textTransform: 'uppercase' }}>
            Learn More
            <span className="arrow">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function IcebergVisualization() {
  const levels = [
    { label: 'Build Foundations', width: 50 },
    { label: 'Intelligent Automation', width: 60 },
    { label: 'Agentic Workflows', width: 70 },
    { label: 'AI Systems Design', width: 80 },
    { label: 'Advanced AI Architecture', width: 90 },
  ]

  return (
    <div className="iceberg-levels">
      {levels.map((level, i) => (
        <div
          key={i}
          className={`iceberg-level${i === 0 ? ' iceberg-level-active' : ''}`}
          style={{ width: `${level.width}%` }}
        >
          <span className="iceberg-level-num">Level {i + 1}</span>
          <span className="iceberg-level-name">{level.label}</span>
        </div>
      ))}
    </div>
  )
}

function ValueStack({ id, headline }) {
  return (
    <section className={`value-stack${id ? '' : ' value-stack-secondary'}`} id={id || undefined}>
      <div className="container">
        <div className="value-stack-box">
          <h2 className="value-stack-headline">{headline || <>Everything you get with our <span style={{ color: 'var(--accent)' }}>AI Mastery: Build Foundations</span> Course</>}</h2>
          <div className="value-stack-list">
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">12+ hours of live, cohort-based instruction</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">5+ hands-on deliverables (AI Opportunity Map, Context Templates, Collaboration Protocol, working AI-powered workflow, system blueprints)</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Access to private Leland AI Mastery community</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Weekly office hours with instructors</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Full session recordings + access to future cohort's session recordings for 1 year</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Certification upon completion</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">3 months of access to Leland+, with 5 specialized AI courses and 250+ AI resources</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Comprehensive practice environment for you to build everything covered in the course</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">100+ skill.md files, folder templates, and other tools to help you build your AI foundation</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Best Course Guarantee, money-back if you find better</span>
            </div>
            <div className="value-stack-item">
              <span className="value-stack-check">&#10003;</span>
              <span className="value-stack-label">Unlimited course retakes for 1 year, letting you access the most up-to-date curriculum</span>
            </div>
          </div>
          <div className="value-stack-pricing">
            <span className="value-stack-crossed">$2,500+ value</span>
            <span className="value-stack-price">$999</span>
          </div>
          <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg value-stack-cta" style={{ textTransform: 'uppercase' }}>
            Enroll Now
            <span className="arrow">&rarr;</span>
          </a>
          <span className="value-stack-subtext">Payment plans available</span>
        </div>
      </div>
    </section>
  )
}

function DiscountPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('discount_popup_dismissed')) return
    const timer = setTimeout(() => setVisible(true), 15000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    sessionStorage.setItem('discount_popup_dismissed', '1')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    sessionStorage.setItem('discount_popup_dismissed', '1')
    localStorage.setItem('discount_email', email)
    if (DISCOUNT_WEBHOOK_URL) {
      try {
        await fetch(DISCOUNT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'discount', timestamp: new Date().toISOString() }),
        })
      } catch (_) { /* silent fail */ }
    }
    setSubmitted(true)
  }

  if (!visible) return null

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={handleClose}>&times;</button>
        {submitted ? (
          <div className="popup-success">
            <span className="popup-success-icon">&#10003;</span>
            <h3>You're in!</h3>
            <p>Check your email for your $200 discount code.</p>
          </div>
        ) : (
          <>
            <div className="popup-badge">LIMITED OFFER</div>
            <h3 className="popup-title">Get $200 off</h3>
            <p className="popup-sub">Enter your email to receive an exclusive $200 discount on AI Mastery: Build Foundations.</p>
            <form className="popup-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="popup-input"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {error && <span className="popup-error">{error}</span>}
              <button type="submit" className="btn btn-primary popup-submit">Claim My Discount</button>
            </form>
            <span className="popup-dismiss" onClick={handleClose}>No thanks</span>
          </>
        )}
      </div>
    </div>
  )
}


function RotatingText({ items, interval = 2500 }) {
  const [index, setIndex] = useState(0)
  const [minHeight, setMinHeight] = useState(0)
  const measureRef = useRef(null)

  useEffect(() => {
    if (!measureRef.current) return
    const spans = measureRef.current.querySelectorAll('.rotating-text-measure')
    let max = 0
    spans.forEach(s => { max = Math.max(max, s.offsetHeight) })
    setMinHeight(max)
  }, [items])

  const [phase, setPhase] = useState('idle') // idle | out | in

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('out')
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length)
        setPhase('in')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase('idle'))
        })
      }, 400)
    }, interval)
    return () => clearInterval(timer)
  }, [items.length, interval])

  return (
    <>
      <span ref={measureRef} aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: 0, right: 0 }}>
        {items.map((item, i) => (
          <span key={i} className="rotating-text rotating-text-measure" style={{ display: 'inline-block' }}>{item}</span>
        ))}
      </span>
      <span className={`rotating-text${phase === 'out' ? ' rotating-out' : phase === 'in' ? ' rotating-in' : ''}`} style={{ minHeight: minHeight || undefined }}>
        {items[index]}
      </span>
    </>
  )
}

function App() {
  const heroRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState(null)

  const navSections = [
    { id: 'courses', label: 'Courses' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ' },
  ]

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
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
      title: 'Build Foundations',
      tagline: "Learn the fundamentals you need to save hours every week with AI. Best for knowledge workers new to AI, professionals building a foundation, and teams preparing for the series.",
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
        { month: 'JUL', day: '14', date: 'July 14' },
        { month: 'AUG', day: '11', date: 'August 11' },
      ],
      levelIndex: 0,
      price: '$999',
      reversed: false,
      learnMoreUrl: 'https://www.joinleland.com/bootcamps/ai-mastery-build-foundations',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69af7ea5b3a78d3ad6852270)',
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
        { month: 'MAY', day: '19', date: 'May 19' },
        { month: 'JUN', day: '16', date: 'June 16' },
        { month: 'JUL', day: '14', date: 'July 14' },
        { month: 'AUG', day: '11', date: 'August 11' },
      ],
      levelIndex: 1,
      price: '$999',
      reversed: true,
      learnMoreUrl: 'https://www.joinleland.com/bootcamps/ai-mastery-intelligent-automation',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69b1975df61c38f9e9bb5550)',
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
        { month: 'JUN', day: '16', date: 'June 16' },
        { month: 'JUL', day: '14', date: 'July 14' },
        { month: 'AUG', day: '11', date: 'August 11' },
      ],
      levelIndex: 2,
      price: '$999',
      reversed: false,
      learnMoreUrl: 'https://www.joinleland.com/bootcamps/ai-mastery-agentic-workflows',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)',
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
        { month: 'JUL', day: '14', date: 'July 14' },
        { month: 'AUG', day: '11', date: 'August 11' },
      ],
      levelIndex: 3,
      price: '$999',
      reversed: true,
      learnMoreUrl: 'https://www.joinleland.com/bootcamps/ai-mastery-ai-systems-design',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)',
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
        { month: 'AUG', day: '11', date: 'August 11' },
      ],
      levelIndex: 4,
      price: '$999',
      reversed: false,
      learnMoreUrl: 'https://www.joinleland.com/bootcamps/ai-mastery-advanced-ai-architecture',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69b19cc2f61c38f9e9bc9066)',
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
    {
      q: 'What tools will I learn?',
      a: 'You\'ll work with ChatGPT, Claude, automation platforms like n8n and Zapier, coding tools, and more. We update the curriculum as tools evolve, so you\'re always learning what\'s current, not what was popular six months ago.',
    },
    {
      q: 'How long is each course?',
      a: 'Each course runs for 3 weeks with 6 live sessions (Tuesdays and Fridays). Sessions are 60-90 minutes. Plan for 3-5 hours per week including hands-on work.',
    },
    {
      q: "What's the Best Course Guarantee?",
      a: 'Complete our course, then take a competitor\'s course and complete it too. If you think theirs was better, we\'ll refund you up to the value of that competitor course. We\'re that confident in the quality.',
    },
    {
      q: 'Can I retake the course?',
      a: 'Yes. You can retake any course for a full year after your original enrollment. The curriculum updates as tools change, so retaking isn\'t just a refresher, it\'s new content.',
    },
    {
      q: 'What if AI tools change after I take the course?',
      a: 'They will, and that\'s exactly why we built the retake policy. Our curriculum is updated continuously. When you retake, you get the latest version with new tools, new techniques, and new workflows.',
    },
    {
      q: 'Is there a payment plan?',
      a: 'Yes. Payment plans are available at checkout. Reach out to our team if you need a custom arrangement.',
    },
    {
      q: 'What happens after I enroll?',
      a: 'You\'ll receive a welcome email with access to the course community, pre-work materials, and calendar invites for all live sessions. Everything you need to hit the ground running on day one.',
    },
    {
      q: 'Will I get a certificate?',
      a: 'Yes. Each course includes a verified certificate of completion. Finish all five courses and earn the full AI Mastery designation, a credential you can add to LinkedIn and your resume.',
    },
    {
      q: 'Who are the instructors?',
      a: 'Our instructors are practitioners from companies like OpenAI, Google, Spotify, and Amazon. They don\'t just teach AI, they build with it every day. You\'ll also get weekly office hours for direct Q&A.',
    },
  ]

  const toolPills = [
    { name: 'ChatGPT', logo: 'new-ChatGPT-icon-white-png-large-size.png', size: 42 },
    { name: 'Claude', logo: 'claude-ai.png' },
    { name: 'Gemini', logo: 'gemini-ai.png' },
    { name: 'Perplexity', logo: 'perlexity.png', size: 56 },
    { name: 'Cursor', logo: 'cursor-1.png', size: 42 },
    { name: 'n8n', logo: '682c6141f8ac4babe589ee0d_n8n_white_new.png', size: 84 },
  ]
  const skillPills = ['Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Workflow automation', 'Report generation', 'Client communication', 'Project management', 'Content creation', 'Financial modeling', 'Strategic planning']

  const trackItems = [
    { num: '01', name: 'Build Foundations', tagline: "Learn the fundamentals you need to save hours every week with AI.", href: '#course-1', thumb: 'Image-1.png', cohort: 'Next cohort: April 21' },
    { num: '02', name: 'Intelligent Automation', tagline: 'Make AI work for you. Automate the tasks eating your week.', href: '#course-2', thumb: 'Image-2.png' },
    { num: '03', name: 'Agentic Workflows', tagline: 'Build AI agents that plan, decide, and execute without babysitting.', href: '#course-3', thumb: 'Image-3.png' },
    { num: '04', name: 'AI Systems Design', tagline: 'Design AI-powered systems that scale across your org.', href: '#course-4', thumb: 'Image-4.png' },
    { num: '05', name: 'Advanced AI Architecture', tagline: 'Orchestrate multi-agent systems and enterprise-grade AI infrastructure.', href: '#course-5', thumb: 'Image-5.png' },
  ]

  return (
    <>
      {/* ====== 1. Navigation ====== */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <a
            href={ENROLL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textTransform: 'uppercase', borderRadius: '4px', fontSize: '12px' }}
          >
            Enroll Now
          </a>
        </div>
      </nav>

      {/* ====== 2. Hero ====== */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-bg">
          <Squares
            direction="diagonal"
            borderColor="#1a1a1a"
            hoverFillColor="#111111"
            squareSize={40}
            speed={0.4}
          />
        </div>
        <div className="hero-image-bg"></div>
        <div className="container">
          <Countdown />

          <h1>Master AI to <br className="mobile-br" /><RotatingText items={['advance your career', 'reach your audience', 'build new products', 'grow your business', 'automate manual work', '100x your impact', 'scale your mind']} interval={2500} /></h1>

          <p className="hero-sub">Leland's AI Mastery Program helps you build tools that 100x your impact, so you have more time and leverage to pursue what you love.</p>

          <div className="logo-ticker" style={{ marginTop: 32, marginBottom: 48 }}>
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

          <div className="track-cards-section" id="courses">
            <div className="track-card-start-bar">Start Here</div>
            <div className="track-cards">
              {trackItems.map((item, idx) => (
                <div className={`track-card${idx === 0 ? ' track-card-featured' : ''}`} key={item.num} {...(idx === 0 ? { onClick: () => document.getElementById('course-accordion')?.scrollIntoView({ behavior: 'smooth' }) } : {})}>
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
                    </div>
                    {idx === 0 && (
                      <>
                        <div className="track-card-cohort">{item.cohort}</div>
                        <a
                          href={ENROLL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm track-card-enroll"
                          style={{ textTransform: 'uppercase' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Enroll Now <span className="arrow">&rarr;</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== 3. "Why This Course" ====== */}
      <section className="why-section" id="about">
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <h2 className="why-headline">Build an AI foundation for your work in 3 weeks</h2>
              <p className="why-skills-label">Updated weekly, so you're always learning at the frontier of AI. We'll teach you best practices for AI in:</p>
              <div className="why-pills why-pills-skills">
                {skillPills.map(skill => (
                  <span className="why-pill why-pill-skill" key={skill}>{skill}</span>
                ))}
              </div>
            </div>
            <div className="why-right">
              <p className="why-tools-label">Learn how to use all the best tools</p>
              <div className="why-tools-grid">
                {toolPills.map(tool => (
                  <div className="why-tool" key={tool.name}>
                    {tool.logo && <img src={`${import.meta.env.BASE_URL}assets/logos/tools/${tool.logo}`} alt={tool.name} className="why-tool-logo" style={tool.size ? { width: tool.size, height: tool.size } : undefined} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== VP1 — after Why This Course ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(${import.meta.env.BASE_URL}assets/review-bg.png)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Become the AI expert your team turns to</h2>
            <p>Earn a credential and build skills your boss and colleagues will notice. Upon completion of the course, you'll have a certificate (and real AI outcomes) you can share on LinkedIn.</p>
          </div>
        </div>
      </section>

      {/* ====== 4. Testimonials — Consolidated 6 + Leland social proof ====== */}
      <section className="testimonials-new" id="testimonials">
        <div className="container">
          <div className="testimonials-stars-lg">
            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
          </div>
          <div className="testimonials-review-count">
            <span className="testimonials-review-number">30,000+ reviews</span>
            <span className="testimonials-review-community">in the Leland community</span>
          </div>
          <h2 className="testimonials-headline">Proven to transform how you work</h2>
          <div className="testimonials-grid testimonials-grid-6">
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;This course changed my workflow completely. I went from spending hours on repetitive tasks to having AI handle them in minutes. My team keeps asking how I'm getting so much done.&rdquo;</p>
              <span className="testimonial-author">Angela S.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;I was skeptical that a 3-week course could actually change how I work. By session two, I had already built an automation that saved me 3 hours a week. By the end, I had five.&rdquo;</p>
              <span className="testimonial-author">Hannah P.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;The hands-on approach is what sets this apart. Every session ended with something I could use at work the next day. Not theory, not slides, actual tools I still use months later.&rdquo;</p>
              <span className="testimonial-author">Tyler G.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;AI used to feel overwhelming and too complicated. This course broke it down in a way that finally made sense. I walked away with real tools I use every day.&rdquo;</p>
              <span className="testimonial-author">Chimerika A.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;You couldn't make this box long enough for me to describe what I got out of this program. The live instruction, the hands-on projects, the community. It completely changed how I work.&rdquo;</p>
              <span className="testimonial-author">Christina G.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;From learning how to prompt, vibe coding an app, to building AI agents, this series took me from curious to competent in weeks. Best investment in my career this year.&rdquo;</p>
              <span className="testimonial-author">Caroline D.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 5. Value Stack 1 (pricing anchor) ====== */}
      <ValueStack id="pricing" />

      {/* ====== 6. Save Time — Split Layout ====== */}
      <section className="save-time-section">
        <div className="container">
          <div className="save-time-split">
            <div className="save-time-left">
              <div className="save-time-calendar">
                <div className="save-time-week">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                    const savedStart = [6, 6, 6, 6, 5][i]
                    return (
                      <div className="save-time-day" key={day}>
                        <span className="save-time-day-label">{day}</span>
                        <div className="save-time-day-blocks">
                          {[...Array(8)].map((_, j) => (
                            <div
                              key={j}
                              className={`save-time-block${j >= savedStart ? ' save-time-block-saved' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="save-time-legend">
                  <div className="save-time-legend-item">
                    <span className="save-time-block-sample"></span>
                    <span>Your work week</span>
                  </div>
                  <div className="save-time-legend-item">
                    <span className="save-time-block-sample save-time-block-saved"></span>
                    <span>Time saved with AI</span>
                  </div>
                </div>
              </div>
              <p className="save-time-cite">Those who invest in AI training are 2x more productive, <strong>saving 11 hours per week</strong> compared with 5 hours for the untrained.</p>
              <a href="https://cep.lse.ac.uk/pubs/download/dp2048.pdf" target="_blank" rel="noopener noreferrer" className="save-time-source">Source: London School of Economics</a>
            </div>
            <div className="save-time-right">
              <h2 className="save-time-headline">Automate your work and 100x your impact</h2>
              <p className="save-time-sub">Save hours every week AND multiply your output. Build automations that handle the busywork while you focus on strategy, creativity, and leadership.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== VP3 — after Save Time ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(${import.meta.env.BASE_URL}assets/images/image2.jpg)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Work smarter with reusable skills and workflows</h2>
            <p>Advance beyond typing questions into ChatGPT by learning to build workflows, automate tasks, and create reusable skills that make AI work the way you want it to.</p>
          </div>
        </div>
      </section>

      {/* ====== 8. When & Where ====== */}
      <section className="when-where-section">
        <div className="container">
          <h2>A flexible and collaborative course structure to fit your busy schedule</h2>
          <div className="when-where-grid">
            <div className="when-where-item">
              <span className="when-where-icon"><LelandIcon name="calendar" /></span>
              <div>
                <h3>Next cohort: April 21</h3>
                <p>New cohorts start regularly. Pick the date that works for you.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon"><LelandIcon name="globe" /></span>
              <div>
                <h3>100% online</h3>
                <p>Attend live or watch recordings. All sessions available within 24 hours.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon"><LelandIcon name="clock" /></span>
              <div>
                <h3>Six 90-minute live sessions</h3>
                <p>Tuesdays and Fridays, plus weekly office hours</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </span>
              <div>
                <h3>Best Course Guarantee</h3>
                <p>If a competitor's course is better, we'll refund you up to the value of that course.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              </span>
              <div>
                <h3>Retake for 1 Year Guarantee</h3>
                <p>Curriculum updates as tools change. Retake anytime for a full year.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 10. Instructors (REMOVED — commented out) ====== */}
      {/*
      <section className="instructors-section">
        <div className="container">
          <h2>Built by experts who've helped hundreds learn AI skills</h2>
          <div className="instructors-grid">
            <div className="coach-card">
              <div className="coach-card-top">
                <img className="coach-card-photo" src={`${import.meta.env.BASE_URL}assets/instructors/kristen-h.jpg`} alt="Kristen H." />
                <div className="coach-card-info">
                  <h3 className="coach-card-name">Kristen H.</h3>
                  <span className="coach-card-role">Lead Instructor</span>
                </div>
              </div>
              <div className="coach-card-meta">
                <span className="coach-card-headline">Lead instructor, ex-Bain &amp; Co.</span>
                <span className="coach-card-divider"></span>
                <div className="coach-card-rating">
                  <StarIcon />
                  <span>5.0 (14 reviews)</span>
                </div>
              </div>
              <p className="coach-card-desc">AI-native builder who's taught dozens of non-technical professionals how to transform their work with AI.</p>
            </div>
            <div className="coach-card">
              <div className="coach-card-top">
                <img className="coach-card-photo" src={`${import.meta.env.BASE_URL}assets/instructors/andrew-q.jpg`} alt="Andrew Q." />
                <div className="coach-card-info">
                  <h3 className="coach-card-name">Andrew Q.</h3>
                  <span className="coach-card-role">Ex-OpenAI</span>
                </div>
              </div>
              <div className="coach-card-meta">
                <span className="coach-card-headline">Ex-OpenAI</span>
                <span className="coach-card-divider"></span>
                <div className="coach-card-rating">
                  <StarIcon />
                  <span>5.0 (13 reviews)</span>
                </div>
              </div>
              <p className="coach-card-desc">Expert in helping you build a custom AI stack that compounds.</p>
            </div>
            <div className="coach-card">
              <div className="coach-card-top">
                <img className="coach-card-photo" src={`${import.meta.env.BASE_URL}assets/instructors/dessy-k.jpg`} alt="Dessy K." />
                <div className="coach-card-info">
                  <h3 className="coach-card-name">Dessy K.</h3>
                  <span className="coach-card-role">TikTok Head of Product</span>
                </div>
              </div>
              <div className="coach-card-meta">
                <span className="coach-card-headline">TikTok Head of Product</span>
                <span className="coach-card-divider"></span>
                <div className="coach-card-rating">
                  <StarIcon />
                  <span>5.0 (14 reviews)</span>
                </div>
              </div>
              <p className="coach-card-desc">Expert at vibecoding and using AI to grow companies.</p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* ====== 12. Iceberg + 5-Course Accordion ====== */}
      <section className="accordion-section" id="course-accordion">
        <div className="container">
          <div className="accordion-section-header">
            <div className="accordion-section-header-text">
              <h2 className="accordion-section-headline">A program to fundamentally change the way you work</h2>
              <p className="accordion-section-sub">In our 5-course mastery program, each course builds on the last. We recommend starting with Level 1 to build a strong foundation.</p>
            </div>
            <IcebergVisualization />
          </div>
          <div className="accordion-list" style={{ marginTop: 48 }}>
            {courses.map((course, i) => (
              <CourseAccordionItem key={course.id} course={course} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== VP2 — before Certification ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/value-prop-2.jpg)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Each session, build something you'll use at work the next day</h2>
            <p>Every session ends with a deliverable you can put to work immediately. From automations to data analysis to personalized skills, you'll save hours every week.</p>
          </div>
        </div>
      </section>

      {/* ====== 13. Certification (CardSwap) ====== */}
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
                      <span className="cert-program">Build Foundations</span>
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

      {/* ====== 14. Advisor CTA ====== */}
      <section className="advisor-section">
        <div className="container">
          <div className="advisor-card">
            <h2>Not sure which course is right for you?</h2>
            <p>Book a free call with an advisor to find the right fit.</p>
            <a href="https://joinleland.typeform.com/to/Gp54Gdd4" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
              Schedule a Call
              <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====== 15. Enterprise / For Teams ====== */}
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
                <a href="https://calendly.com/d/cyhb-yjg-33f/leland-ai-transformation" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                  Talk to Our Team
                  <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 16. FAQ ====== */}
      <section className="faq" id="faq">
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

      {/* ====== Footer CTA ====== */}
      <section className="footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="footer-cta-sub">Our next cohort starts April 21</p>
          <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
            Enroll Now <span className="arrow">&rarr;</span>
          </a>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved.</p>
        </div>
      </footer>

      {/* Popups */}
      <DiscountPopup />
    </>
  )
}

export default App
