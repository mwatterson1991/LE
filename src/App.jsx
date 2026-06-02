import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import Marquee from 'react-fast-marquee'
import Squares from './components/Squares'
import CardSwap, { Card } from './components/CardSwap'
import CoursePage from './pages/CoursePage'
import B2BPage from './pages/B2BPage'
import SyllabusPage from './pages/SyllabusPage'
import ReviewsPage from './pages/ReviewsPage'
import LPPopup from './components/LPPopup'
import GetThisExpensed from './components/GetThisExpensed'
import CohortPicker from './components/CohortPicker'
import { COURSE_COHORTS, courseData } from './pages/courseData'

const ENROLL_URL = (() => {
  const cohorts = COURSE_COHORTS[1] || []
  const now = new Date()
  const next = cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now)
    || cohorts.find(c => c.enrollUrl && !c.soldOut)
  return next?.enrollUrl || cohorts[0]?.enrollUrl
})()
const SALES_URL = 'https://joinleland.typeform.com/to/Gp54Gdd4'
const SCHOLARSHIP_URL = 'https://joinleland.typeform.com/to/TEiacu5G?utm_campaign=landing_page_cta&utm_source=website&utm_medium=web'

// Deterministic per-5-hour-window count: everyone visiting in the same window sees the same number
function getScarcityCount(min = 442, max = 532, salt = 0) {
  const FIVE_HOURS_MS = 5 * 60 * 60 * 1000
  const windowIndex = Math.floor(Date.now() / FIVE_HOURS_MS)
  const hash = Math.abs(Math.sin(windowIndex + salt * 7919) * 10000)
  const range = max - min + 1
  return min + Math.floor((hash - Math.floor(hash)) * range)
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

const LelandIcon = ({ name }) => (
  <img src={`${import.meta.env.BASE_URL}assets/icons/${name}.svg`} alt={name} className="when-where-svg-icon" />
)

function Countdown() {
  const [time, setTime] = useState({ d: '--', h: '--', m: '--', s: '--' })
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const target = new Date('2026-05-26T15:00:00Z')
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

function FaqItem({ question, answer, index, open, onToggle }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={onToggle}>
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

function ReviewsCarousel() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch('/data/featured-reviews.json')
      .then(r => r.ok ? r.json() : [])
      .then(d => setReviews(d || []))
      .catch(() => setReviews([]))
  }, [])

  if (!reviews.length) return null

  return (
    <div className="reviews-carousel-wrap">
      <Marquee gradient gradientColor="#000000" gradientWidth={48} speed={32} pauseOnHover>
        {reviews.map((r, i) => (
          <a key={i} href="/reviews" className="reviews-carousel-card">
            <div className="reviews-carousel-stars" aria-hidden="true">
              {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
            </div>
            <p className="reviews-carousel-quote">&ldquo;{r.review}&rdquo;</p>
            <div className="reviews-carousel-meta">
              <span className="reviews-carousel-name">{r.display_name}</span>
              <span className="reviews-carousel-dot">·</span>
              <span className="reviews-carousel-level">{r.level === 'L2' ? 'Level 2' : 'Level 1'}</span>
            </div>
          </a>
        ))}
      </Marquee>
    </div>
  )
}

function getDefaultCohort(cohorts) {
  const now = new Date()
  return (
    cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now) ||
    cohorts.find(c => c.enrollUrl && !c.soldOut) ||
    cohorts[0]
  )
}

function CourseAccordionItem({ course, open, onToggle }) {
  const [selectedCohort, setSelectedCohort] = useState(() => getDefaultCohort(course.cohorts))
  const [showAllMobile, setShowAllMobile] = useState(false)
  const enrollUrl = (selectedCohort && !selectedCohort.soldOut ? selectedCohort.enrollUrl : null) ?? course.enrollUrl
  const detail = courseData[parseInt(course.num, 10)] || {}

  const handleCohortChange = (cohort) => {
    setSelectedCohort(cohort)
    posthog.capture('app--cohort_selected', { level: course.num, cohort: cohort.iso })
  }
  return (
    <div className={`accordion-item${open ? ' open' : ''}`} id={course.id}>
      <div className="accordion-header" onClick={onToggle}>
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
        <div className="accordion-body-main">
          {detail.heroSubheadline && (
            <p className="accordion-overview">{detail.heroSubheadline}</p>
          )}
          {detail.whoItsFor && (
            <div className="accordion-detail-block">
              <span className="accordion-detail-label">Who it's for</span>
              <p className="accordion-detail-text">{detail.whoItsFor}</p>
            </div>
          )}
          <div className={`accordion-expandable${showAllMobile ? ' is-open' : ''}`}>
            <div className="accordion-sessions">
              <div className="course-sessions-label">Curriculum</div>
              {course.sessions.map((session, i) => {
                const cohortSession = selectedCohort?.cohortSessions?.[i]
                const displayDate = cohortSession?.date ?? session.date
                const displayTime = cohortSession?.time ?? session.time
                return (
                  <div className="course-session" key={i}>
                    <span className="course-session-num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="course-session-text">
                      <span className="course-session-title">{session.title}</span>
                      <span className="course-session-sub">{session.sub}</span>
                      {displayDate && <span className="course-session-datetime">{displayDate} &middot; {displayTime}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            {detail.whatYoullBuild && detail.whatYoullBuild.length > 0 && (
              <div className="accordion-detail-block">
                <span className="accordion-detail-label">What you'll build</span>
                <ul className="accordion-detail-list">
                  {detail.whatYoullBuild.map(item => (
                    <li key={item}><span className="accordion-detail-check">&#10003;</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {detail.whatYoullLearn && detail.whatYoullLearn.length > 0 && (
              <div className="accordion-detail-block">
                <span className="accordion-detail-label">What you'll learn</span>
                <div className="accordion-detail-learn-grid">
                  {detail.whatYoullLearn.map((col, idx) => (
                    <ul className="accordion-detail-learn-col" key={idx}>
                      {col.col.map(item => (
                        <li key={item}><span className="accordion-detail-bullet">·</span><span>{item}</span></li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            )}
            {detail.tools && detail.tools.length > 0 && (
              <div className="accordion-detail-block">
                <span className="accordion-detail-label">Tools you'll use</span>
                <div className="accordion-detail-tools">
                  {detail.tools.map(tool => <span className="accordion-detail-tool" key={tool}>{tool}</span>)}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="accordion-show-more"
            onClick={() => setShowAllMobile(v => !v)}
            aria-expanded={showAllMobile}
          >
            {showAllMobile ? 'Show less' : 'Show full curriculum & details →'}
          </button>
        </div>
        <div className="accordion-meta">
          <div className="accordion-meta-row">
            <span className="accordion-meta-label">Schedule</span>
            <span className="accordion-meta-value">{selectedCohort?.scheduleDays ?? 'Tuesdays & Fridays'} &middot; 2 Weeks</span>
          </div>
          <div className="accordion-meta-row">
            <span className="accordion-meta-label">Format</span>
            <span className="accordion-meta-value">4 Core Sessions + 2 Build Workshops (Optional)</span>
          </div>
          <hr className="accordion-meta-divider" />
          <CohortPicker
            cohorts={course.cohorts}
            selected={selectedCohort}
            onChange={handleCohortChange}
          />
          <div className="accordion-price-row">
            <span className="accordion-price">{course.price}</span>
            <span className="accordion-price-sub">As low as $257/mo with a payment plan</span>
          </div>
          {enrollUrl ? (
            <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => posthog.capture('app--enroll_cta_click', { source: 'course-accordion', level: course.num })}>
              Enroll Now
              <span className="arrow">&rarr;</span>
            </a>
          ) : (
            <span className="btn btn-primary" style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function IcebergVisualization() {
  // Horizontal progression: levels build left to right with Core/Advanced audience brackets above
  const levels = [
    { num: 1, name: 'Use AI to 10x Your Impact' },
    { num: 2, name: 'Build Complex Agentic Workflows' },
    { num: 3, name: 'Create Autonomous Agents' },
    { num: 4, name: 'Build Your Agent Workforce' },
    { num: 5, name: 'Design Your AI Orchestration Layer' },
  ]
  return (
    <div className="program-progression">
      <div className="program-progression-audience program-progression-audience-core">
        Core · For every knowledge worker
      </div>
      <div className="program-progression-audience program-progression-audience-advanced">
        Advanced · For sophisticated AI builders
      </div>
      {levels.map((l, i) => (
        <div key={l.num} className={`program-progression-level program-progression-level-${i < 3 ? 'core' : 'advanced'}`}>
          <span className="program-progression-num">L{l.num}</span>
          <span className="program-progression-name">{l.name}</span>
        </div>
      ))}
    </div>
  )
}

function WhichLevelDropdown() {
  const [open, setOpen] = useState(false)
  const levels = [
    { num: '1', name: 'Use AI to 10x Your Impact', who: "You use AI chatbots to draft, summarize, and ask questions, but you haven't built anything that runs on its own." },
    { num: '2', name: 'Build Complex Agentic Workflows', who: "You've tried AI coding tools, MCP connectors, or workflow builders, but you haven't built specialized agents for most work tasks." },
    { num: '3', name: 'Create Autonomous Agents', who: "You've built multiple AI agents, but they don't run autonomously." },
    { num: '4', name: 'Build Your Agent Workforce', who: "You have multiple autonomous agents running, but they don't operate as a unified system." },
    { num: '5', name: 'Design Your AI Orchestration Layer', who: "You've built and shipped AI systems that run in production, but they don't proactively iterate and pursue a goal." },
  ]

  return (
    <div className="which-level">
      <button className="which-level-toggle" onClick={() => setOpen(!open)}>
        <span>Not sure which level is right for you?</span>
        <svg className={`which-level-chevron${open ? ' which-level-chevron-open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="which-level-table">
          <div className="which-level-header">
            <span className="which-level-col-num">#</span>
            <span className="which-level-col-name">Course</span>
            <span className="which-level-col-who">Who it's for</span>
          </div>
          {levels.map(l => (
            <div className="which-level-row" key={l.num}>
              <span className="which-level-col-num">{l.num}</span>
              <span className="which-level-col-name">{l.name}</span>
              <span className="which-level-col-who">{l.who}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AgentNetwork() {
  // Top-down org chart layout: YOU at the top, agents reporting up
  const VIEW_W = 520
  const VIEW_H = 420
  const youX = VIEW_W / 2
  const youY = 60
  const agentY = 250
  const agentCount = 6
  const margin = 50
  const span = VIEW_W - margin * 2
  const agents = Array.from({ length: agentCount }, (_, i) => ({
    x: margin + (span * i) / (agentCount - 1),
    y: agentY,
  }))

  return (
    <div className="agent-network">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="agent-network-svg" aria-hidden="true">
        <defs>
          <radialGradient id="agent-network-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(165,228,70,0.35)" />
            <stop offset="100%" stopColor="rgba(165,228,70,0)" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind YOU */}
        <circle cx={youX} cy={youY} r="80" fill="url(#agent-network-glow)" />

        {/* Org-chart connectors: vertical from YOU, horizontal trunk, vertical drops to each agent */}
        {(() => {
          const trunkY = youY + 90
          return (
            <>
              {/* Drop from YOU to trunk */}
              <line x1={youX} y1={youY + 30} x2={youX} y2={trunkY} className="agent-network-line agent-network-line-static" />
              {/* Horizontal trunk between leftmost and rightmost agents */}
              <line x1={agents[0].x} y1={trunkY} x2={agents[agents.length - 1].x} y2={trunkY} className="agent-network-line agent-network-line-static" />
              {/* Drops to each agent */}
              {agents.map((a, i) => (
                <line
                  key={`drop-${i}`}
                  x1={a.x}
                  y1={trunkY}
                  x2={a.x}
                  y2={a.y - 22}
                  className="agent-network-line"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
              {/* Pulses flowing down from YOU through trunk to each agent */}
              {agents.map((a, i) => (
                <circle
                  key={`pulse-${i}`}
                  r="3"
                  className="agent-network-pulse"
                  style={{
                    offsetPath: `path('M ${youX} ${youY + 30} L ${youX} ${trunkY} L ${a.x} ${trunkY} L ${a.x} ${a.y - 22}')`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </>
          )
        })()}

        {/* YOU at the top */}
        <g className="agent-network-center">
          <circle cx={youX} cy={youY} r="28" className="agent-network-center-fill" />
          <text x={youX} y={youY + 4} textAnchor="middle" className="agent-network-center-label">YOU</text>
        </g>

        {/* Agent nodes — each one radiating action outward */}
        {agents.map((a, i) => {
          // Action threads: each agent fires off 3 outward "tasks" (small lines + traveling pulses)
          const threads = [
            { dx: -22, dy: 50 },
            { dx: 0, dy: 56 },
            { dx: 22, dy: 50 },
          ]
          return (
            <g key={`node-${i}`} className="agent-network-node" style={{ animationDelay: `${i * 0.18}s` }}>
              {/* Outgoing "action" lines */}
              {threads.map((t, j) => (
                <g key={`thread-${j}`}>
                  <line
                    x1={a.x}
                    y1={a.y + 14}
                    x2={a.x + t.dx}
                    y2={a.y + t.dy}
                    className="agent-network-action-line"
                    style={{ animationDelay: `${i * 0.18 + j * 0.4}s` }}
                  />
                  {/* Traveling pulse dot, agent → task */}
                  <circle
                    r="2.5"
                    className="agent-network-action-pulse"
                    style={{
                      offsetPath: `path('M ${a.x} ${a.y + 14} L ${a.x + t.dx} ${a.y + t.dy}')`,
                      animationDelay: `${i * 0.25 + j * 0.55}s`,
                    }}
                  />
                  {/* Action target dot at the end */}
                  <circle
                    cx={a.x + t.dx}
                    cy={a.y + t.dy}
                    r="2.5"
                    className="agent-network-action-target"
                    style={{ animationDelay: `${i * 0.2 + j * 0.4}s` }}
                  />
                </g>
              ))}
              {/* Agent body */}
              <circle cx={a.x} cy={a.y} r="20" className="agent-network-node-ring" />
              <circle cx={a.x} cy={a.y} r="14" className="agent-network-node-fill" />
              {/* "Live/working" status dot */}
              <circle
                cx={a.x + 12}
                cy={a.y - 12}
                r="3"
                className="agent-network-status-dot"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function RoleUseCases() {
  const roles = [
    {
      name: 'Leadership',
      examples: [
        ['Weekly metrics digest', 'ARR, pipeline, hiring, and product KPIs in one Monday brief'],
        ['Decision memo drafter', 'Turns rough thinking into a polished memo your team can react to'],
        ['Board prep agent', 'Drafts the deck and narrative from the latest data'],
      ],
    },
    {
      name: 'Marketing',
      examples: [
        ['Brief-to-assets agent', 'Turns a one-line idea into briefs, copy variants, and design specs'],
        ['Brand voice eval', 'Scores every piece of outbound copy before it ships'],
        ['Competitive intel agent', 'Monitors rivals\' launches, pricing, and messaging weekly'],
      ],
    },
    {
      name: 'Sales',
      examples: [
        ['Pre-call research agent', '5-bullet brief on every prospect 10 minutes before the meeting'],
        ['Outbound sequencer', 'Personalized emails referencing real signals from the prospect'],
        ['Pipeline hygiene agent', 'Updates CRM, flags stalled deals, suggests next steps'],
      ],
    },
    {
      name: 'Customer Success',
      examples: [
        ['Account health monitor', 'Watches usage and sentiment, pages you before churn risks'],
        ['QBR prep agent', 'Pulls metrics and ships a deck draft 24 hours before the call'],
        ['Onboarding personalizer', 'Adapts the rollout plan for each customer\'s stack'],
      ],
    },
    {
      name: 'Operations',
      examples: [
        ['Cross-tool data pipeline', 'Replaces manual spreadsheet glue between your stack'],
        ['Anomaly detector', 'Watches your KPIs and pages on-call when something deviates'],
        ['SOP keeper', 'Updates documentation when processes change, instead of letting it rot'],
      ],
    },
    {
      name: 'Finance',
      examples: [
        ['Variance detector', 'Flags budget blowouts the day they happen, not the month after'],
        ['Close-prep agent', 'Pulls accruals, reconciliations, and journal entries automatically'],
        ['Investor update drafter', 'Writes the next board memo from your latest metrics'],
      ],
    },
    {
      name: 'Product',
      examples: [
        ['Customer call synthesizer', 'Turns 50 user interviews into clean themes'],
        ['Spec drafter', 'Turns rough notes into shippable PRDs with edge cases flagged'],
        ['Feedback prioritizer', 'Ranks asks by ICP fit and revenue weight'],
      ],
    },
    {
      name: 'People / HR',
      examples: [
        ['Candidate screener', 'Grades applications against your ICP and surfaces the top 5'],
        ['Review synthesizer', 'Aggregates 360 feedback into a coherent review draft'],
        ['Comp benchmarking agent', 'Monitors market rates and flags drift'],
      ],
    },
  ]

  return (
    <section className="role-uses-section">
      <div className="container">
        <div className="role-uses-header">
          <h2 className="role-uses-headline">Whatever your role, you can build an agent team for it</h2>
          <p className="role-uses-sub">A few examples of what AI Builders ship in their day-to-day work.</p>
        </div>
        <div className="role-uses-grid">
          {roles.map(role => (
            <div className="role-uses-card" key={role.name}>
              <h3 className="role-uses-role">{role.name}</h3>
              <ul className="role-uses-list">
                {role.examples.map(([name, desc]) => (
                  <li className="role-uses-item" key={name}>
                    <span className="role-uses-name">{name}</span>
                    <span className="role-uses-desc">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValueStack({ id }) {
  const CORE_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)'
  const ADVANCED_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c433d93e28f6893acab6c9%2C69c433eddf04fb0e41cf2000)'

  const tiers = [
    {
      key: 'level-1',
      name: 'Level 1',
      meta: 'The first level for all knowledge workers',
      badge: 'À la carte',
      crossed: '$2,500+ value',
      price: '$999',
      monthly: '$257/mo with payment plan',
      cta: 'Enroll',
      enrollUrl: ENROLL_URL,
      utm: 'value-stack-l1',
      buildsHeader: "What you'll build",
      builds: [
        'A custom-designed product, built without code',
        'An inbox automation in your voice',
        'A data + presentation workflow that builds itself',
        'Your first end-to-end AI system',
      ],
      stats: [
        ['2 weeks', 'duration'],
        ['8+ hours', 'live online instruction'],
        ['4', 'shipped builds'],
        ['1', 'certification'],
      ],
    },
    {
      key: 'core',
      name: 'AI Builder Core (Levels 1–3)',
      meta: 'The core program for all knowledge workers',
      badge: 'Most Popular',
      featured: true,
      crossed: '$7,500+ value',
      price: '$1,999',
      monthly: '$514/mo with payment plan',
      cta: 'Enroll',
      enrollUrl: CORE_URL,
      utm: 'value-stack-core',
      buildsHeader: 'Everything in Level 1, plus:',
      builds: [
        'Cloud-based agentic automations that run on their own',
        'An Automation Advisor agent grounded in your context',
        'An Eval System that scores agent outputs',
        'A custom Agent Operating System',
        'Autonomous agents you trust on full auto-approve',
      ],
      stats: [
        ['6 weeks', 'duration'],
        ['24+ hours', 'live online instruction'],
        ['12', 'shipped builds'],
        ['3', 'certifications'],
      ],
    },
    {
      key: 'advanced',
      name: 'AI Builder Advanced (Levels 1–5)',
      meta: 'The program for sophisticated builders',
      badge: 'Best Value',
      crossed: '$12,500+ value',
      price: '$2,999',
      monthly: '$772/mo with payment plan',
      cta: 'Enroll',
      enrollUrl: ADVANCED_URL,
      utm: 'value-stack-advanced',
      buildsHeader: 'Everything in Core, plus:',
      builds: [
        'Goal-directed AI employees with weekly quotas',
        'Orchestration layers that delegate to specialist agents',
        'QA layers and self-correcting systems',
        'Long-horizon agents with persistent memory',
        'Production AI systems that improve themselves',
      ],
      stats: [
        ['10 weeks', 'duration'],
        ['40+ hours', 'live online instruction'],
        ['20', 'shipped builds'],
        ['5 + AI Builder', 'designation'],
      ],
    },
  ]

  return (
    <section className={`value-stack${id ? '' : ' value-stack-secondary'}`} id={id || undefined}>
      <div className="container">
        <h2 className="value-stack-section-headline">Choose your path</h2>
        <p className="value-stack-section-sub">Three ways to become an AI Builder. Start small or commit to the full journey.</p>
        <div className="value-stack-grid">
          {tiers.map(tier => {
            const learnMoreHref = tier.key === 'level-1' ? '/level-1' : tier.key === 'core' ? '#course-1' : '#course-4'
            return (
              <div key={tier.key} className={`value-stack-card${tier.featured ? ' value-stack-card-featured' : ''}`}>
                {tier.badge && <span className="value-stack-badge">{tier.badge}</span>}
                <div className="value-stack-card-header">
                  <h3 className="value-stack-card-name">{tier.name}</h3>
                  {tier.sub && <span className="value-stack-card-sub">{tier.sub}</span>}
                  <span className="value-stack-card-meta">{tier.meta}</span>
                </div>
                <div className="value-stack-card-pricing">
                  <span className="value-stack-crossed">{tier.crossed}</span>
                  <span className="value-stack-price">{tier.price}</span>
                  <span className="value-stack-monthly-row">
                    {tier.monthly && <span className="value-stack-monthly">or {tier.monthly}</span>}
                    {tier.monthly && <span className="value-stack-monthly-sep">·</span>}
                    <a
                      href={`${SCHOLARSHIP_URL}&utm_content=value-stack-${tier.key}-scholarship`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="value-stack-scholarship-line"
                      onClick={() => posthog.capture('app--sales_cta_click', { source: `value-stack-${tier.key}-scholarship` })}
                    >
                      Scholarships also available
                    </a>
                  </span>
                </div>
                <div className="value-stack-card-cta-row">
                  <a
                    href={tier.enrollUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg value-stack-card-cta"
                    onClick={() => posthog.capture('app--enroll_cta_click', { source: tier.utm })}
                  >
                    {tier.cta} <span className="arrow">&rarr;</span>
                  </a>
                  <a
                    href={learnMoreHref}
                    className="btn btn-secondary-outline btn-lg value-stack-card-cta"
                  >
                    Learn more
                  </a>
                </div>
                <div className="value-stack-card-builds">
                  <span className="value-stack-card-builds-header">{tier.buildsHeader}</span>
                  <ul className="value-stack-card-builds-list">
                    {tier.builds.map(b => (
                      <li className="value-stack-card-build" key={b}>
                        <span className="value-stack-check">&#10003;</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="value-stack-card-stats">
                  {tier.stats.map(([value, label]) => (
                    <div className="value-stack-card-stat" key={label}>
                      <span className="value-stack-card-stat-value">{value}</span>
                      <span className="value-stack-card-stat-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="value-stack-included">
          <span className="value-stack-included-eyebrow">Every tier also includes</span>
          <div className="value-stack-included-grid">
            {[
              ['1-Year Access Guarantee', 'Recordings and live sessions for every AI Builder cohort over the next 12 months.'],
              ['Best Course Guarantee', 'Money-back if you find a better AI course anywhere.'],
              ['Weekly Build Workshops', 'Optional live workshops with functional experts in marketing, sales, finance, ops, and more.'],
              ['Unlimited Retakes', 'Take any cohort again for a full year, always with the latest curriculum.'],
              ['Private AI Community', 'Daily AI news, peer builds, and live perspectives from current AI Builders.'],
              ['Leland+ Access (3 months)', '5 specialized AI courses and 250+ resources to deepen what you build.'],
              ['Weekly Office Hours', 'Live Q&A with instructors to unblock your specific builds.'],
              ['100+ skill.md & Templates', 'Battle-tested files and folder templates that accelerate every build.'],
            ].map(([title, desc]) => (
              <div className="value-stack-included-item" key={title}>
                <span className="value-stack-check">&#10003;</span>
                <div className="value-stack-included-text">
                  <span className="value-stack-included-name">{title}</span>
                  <span className="value-stack-included-desc">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a
          href="#enterprise"
          className="value-stack-teams-callout"
          onClick={() => posthog.capture('app--sales_cta_click', { source: 'value-stack-teams' })}
        >
          <span className="value-stack-teams-text">
            <strong>Buying for a team or enterprise?</strong> Volume pricing, custom use cases, and dedicated support.
          </span>
          <span className="value-stack-teams-arrow">Talk with our team <span aria-hidden="true">&rarr;</span></span>
        </a>
      </div>
    </section>
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

function HomePage() {
  const heroRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [openAccordion, setOpenAccordion] = useState(0)
  const [activeSection, setActiveSection] = useState(null)
  const [scarcityCount, setScarcityCount] = useState(() => getScarcityCount(442, 532, 0))
  const [advancedScarcityCount, setAdvancedScarcityCount] = useState(() => getScarcityCount(75, 110, 1))

  useEffect(() => {
    const interval = setInterval(() => {
      setScarcityCount(getScarcityCount(442, 532, 0))
      setAdvancedScarcityCount(getScarcityCount(75, 110, 1))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

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
      title: 'Use AI to 10x Your Impact',
      tagline: "You use AI chatbots to draft, summarize, and ask questions, but you haven't built anything that runs on its own.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build a Real Product with World-Class Design', sub: 'Create a new product in 90 minutes, without writing a line of code, using a design system that you love.', date: 'Tue, Jun 9', time: '8am or 1pm PT (11am or 4pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Automate Communication in Your Voice', sub: 'Connect your tools, teach AI how you write, build an email manager that runs on a schedule, and start building a custom automation for your own work.', date: 'Fri, Jun 12', time: '8am or 1pm PT (11am or 4pm ET)' },
        { title: 'Analyze Data and Design Presentations Instantly', sub: 'Go from a raw spreadsheet to clean insights and a polished, animated slide deck, no formulas or design tools required.', date: 'Tue, Jun 16', time: '8am or 1pm PT (11am or 4pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Launch Your Custom AI System + Demo Day', sub: 'Continue personalizing your AI system and show the cohort what you built.', date: 'Fri, Jun 19', time: '8am or 1pm PT (11am or 4pm ET)' },
      ],
      cohorts: [
        { month: 'APR', day: '21', date: 'April 21', label: 'Apr 21', iso: '2026-04-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '9–10:30am MT', afternoon: '2–3:30pm MT' }, cohortSessions: [{ date: 'Tue, Apr 21', time: '9–10:30am or 2–3:30pm MT' }, { date: 'Fri, Apr 24', time: '9–10:30am or 2–3:30pm MT' }, { date: 'Tue, Apr 28', time: '9–10:30am or 2–3:30pm MT' }, { date: 'Fri, May 1', time: '9–10:30am or 2–3:30pm MT' }, { date: 'Tue, May 5', time: '9–10:30am or 2–3:30pm MT' }, { date: 'Fri, May 8', time: '9–10:30am or 2–3:30pm MT' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69df07c2a8d0db5f281bf997)', soldOut: true },
        { month: 'MAY', day: '12', date: 'May 12', label: 'May 12', iso: '2026-05-12', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '9:30–11:00am MT', afternoon: '4:00–5:30pm MT' }, cohortSessions: [{ date: 'Tue, May 12', time: '9:30–11:00am or 4:00–5:30pm MT' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, May 15', time: '9:30–11:00am or 4:00–5:30pm MT' }, { date: 'Tue, May 19', time: '9:30–11:00am or 4:00–5:30pm MT' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, May 22', time: '9:30–11:00am or 4:00–5:30pm MT' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69dff7c6d5d75c51a6c278c2)', soldOut: true },
        { month: 'JUN', day: '9', date: 'June 9', label: 'June 9', iso: '2026-06-09', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '1pm PT / 4pm ET' }, cohortSessions: [{ date: 'Tue, Jun 9', time: '8am or 1pm PT (11am or 4pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jun 12', time: '8am or 1pm PT (11am or 4pm ET)' }, { date: 'Tue, Jun 16', time: '8am or 1pm PT (11am or 4pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jun 19', time: '8am or 1pm PT (11am or 4pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f516178a2ab05f3e118af6)', fillingFast: true },
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f517038a2ab05f3e118b05)' },
        { month: 'JUN', day: '22', date: 'June 22 (Copilot Only Track)', label: 'June 22 (Copilot Only)', iso: '2026-06-22-copilot', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '9am PT / 12pm ET', thursday: '9am PT / 12pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '9am PT / 12pm ET' }, { date: 'Mon, Jun 29', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '9am PT / 12pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a0cf65f27431b42c5131e4b)' },
      ],
      levelIndex: 0,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-1',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f5153ea54105fc41d900fe)',
    },
    {
      id: 'course-2', num: '02', type: 'BOOTCAMP',
      title: 'Build Complex Agentic Workflows',
      tagline: "You've tried AI coding tools, MCP connectors, or workflow builders, but you haven't built specialized agents for most work tasks.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build and Ship Your Automation Roadmap', sub: 'Map where your time goes, build an AI automation roadmap, and deploy it as an interactive dashboard.', date: 'Mon, Jun 8', time: '5pm PT / 8pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build a Cloud-Based Agentic Workflow and QA System', sub: 'Use n8n to design an agentic communication manager workflow that auto-responds to messages for you.', date: 'Thu, Jun 11', time: '5pm PT / 8pm ET' },
        { title: 'Build Custom Agentic Automations', sub: 'Collaborate with AI to create automations that pull from real data to help you work more effectively.', date: 'Mon, Jun 15', time: '5pm PT / 8pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Second Brain with AI + Demo Day', sub: 'Give your AI the domain knowledge it needs to run your automation well, and show the cohort what you built.', date: 'Thu, Jun 18', time: '5pm PT / 8pm ET' },
      ],
      cohorts: [
        { month: 'APR', day: '21', date: 'April 21', label: 'Apr 21', iso: '2026-04-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '5–6:30pm MT', friday: '11am–12:30pm MT' }, cohortSessions: [{ date: 'Tue, Apr 21', time: '5–6:30pm MT' }, { date: 'Fri, Apr 24', time: '11am–12:30pm MT' }, { date: 'Tue, Apr 28', time: '5–6:30pm MT' }, { date: 'Fri, May 1', time: '11am–12:30pm MT' }, { date: 'Tue, May 5', time: '5–6:30pm MT' }, { date: 'Fri, May 8', time: '11am–12:30pm MT' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69b1ed8141a6783685016ed0)', soldOut: true },
        { month: 'MAY', day: '12', date: 'May 12', label: 'May 12', iso: '2026-05-12', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '4pm PT / 7pm ET', friday: '10am PT / 1pm ET' }, cohortSessions: [{ date: 'Tue, May 12', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, May 15', time: '10am PT / 1pm ET' }, { date: 'Tue, May 19', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, May 22', time: '10am PT / 1pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69b1975df61c38f9e9bb5550)', soldOut: true },
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '5pm PT / 8pm ET', thursday: '5pm PT / 8pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '5pm PT / 8pm ET' }, { date: 'Mon, Jun 15', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '5pm PT / 8pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52df1cf3c823ab47ecd16)', fillingFast: true },
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '10am PT / 1pm ET', thursday: '10am PT / 1pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '10am PT / 1pm ET' }, { date: 'Mon, Jun 29', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '10am PT / 1pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52e60cf3c823ab47ecd1f)' },
      ],
      levelIndex: 1,
      price: '$999',
      reversed: true,
      learnMoreUrl: '/level-2',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52d9bfbe6f9b34c15a663)',
    },
    {
      id: 'course-3', num: '03', type: 'LIVE COURSE',
      title: 'Create Autonomous Agents',
      tagline: "You've built multiple AI agents, but they don't run autonomously.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build Your Agentic Operating System', sub: 'Set up your agent tool and create the foundational context files of your agentic operating system.', date: 'Mon, Jun 8', time: '4pm PT / 7pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Strengthen Your Agent with Skills, Tools, and Context', sub: 'Scope what your agent owns, expand context to cover your real work, and connect the tools it needs to do that work.', date: 'Thu, Jun 11', time: '4pm PT / 7pm ET' },
        { title: 'Test and Deploy Your Agent', sub: "Create a rubric and evals, wire an action logging system, and run tests to improve your agent until you're ready to deploy.", date: 'Mon, Jun 15', time: '4pm PT / 7pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Sub-Agents + Demo Day', sub: 'Get better, broader output by training your agent to spin up specialist sub-agents for research and other specific tasks.', date: 'Thu, Jun 18', time: '4pm PT / 7pm ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '4pm PT / 7pm ET' }, { date: 'Mon, Jun 15', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '4pm PT / 7pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)', fillingFast: true },
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '8am PT / 11am ET', thursday: '8am PT / 11am ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '8am PT / 11am ET' }, { date: 'Mon, Jun 29', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '8am PT / 11am ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69f53132cf3c823ab47ecd3a)' },
      ],
      levelIndex: 2,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-3',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b1ee1b8bd54088517f2b3b)',
    },
    {
      id: 'course-4', num: '04', type: 'BOOTCAMP',
      title: 'Build Your Agent Workforce',
      tagline: "You have multiple autonomous agents running, but they don't operate as a unified system.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Scope Your Agent Team', sub: "Map your workflows, decide what belongs in each agent's domain, and architect a multi-agent system.", date: 'Mon, Jun 22', time: '4pm PT / 7pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Orchestrated Pipeline', sub: 'Wire your first real multi-agent system, connecting multiple specialized agents, coordinated by an orchestrator that decomposes tasks and routes work.', date: 'Thu, Jun 25', time: '4pm PT / 7pm ET' },
        { title: 'Wire Your Agents Together + Add Security', sub: 'Shift from task-based to goal-based agent design. Wire agent-to-agent communication, define what each agent can access, and update your team dashboard.', date: 'Mon, Jun 29', time: '4pm PT / 7pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Ship Your Agent Workforce + Demo Day', sub: 'Finalize your agent team, document how it works, define failure modes and fallbacks, and demo what you built.', date: 'Thu, Jul 2', time: '4pm PT / 7pm ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '4pm PT / 7pm ET' }, { date: 'Mon, Jun 29', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '4pm PT / 7pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69bd6f92ca371b83aa557c0c)' },
        { month: 'JUL', day: 'TBD', date: 'July 2026', label: 'July 2026', iso: '2026-07-20', scheduleDays: 'Schedule TBD', sessionTimes: null, cohortSessions: [], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)' },
        { month: 'AUG', day: 'TBD', date: 'August 2026', label: 'August 2026', iso: '2026-08-15', scheduleDays: 'Schedule TBD', sessionTimes: null, cohortSessions: [], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69e5259f1ac8f0ca2eba2107)' },
      ],
      levelIndex: 3,
      price: '$999',
      reversed: true,
      learnMoreUrl: '/level-4',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69bd6f92ca371b83aa557c0c)',
    },
    {
      id: 'course-5', num: '05', type: 'LIVE COURSE',
      title: 'Design Your AI Orchestration Layer',
      tagline: "You've built and shipped AI systems that run in production, but they don't proactively iterate and pursue a goal.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build Your Manager Agent', sub: "Design and build one agent that coordinates your entire agent team, routes work to the right agent, monitors what's running, and escalates edge cases.", date: 'Tue, Jul 14', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Make Your Agents Proactive', sub: 'Your agents identify their own sub-goals, take initiative, and adapt their approach based on feedback.', date: 'Fri, Jul 17', time: '2pm PT / 5pm ET' },
        { title: 'Build a Self-Improving System', sub: 'Your manager agent watches performance, identifies weak agents, and triggers improvements.', date: 'Tue, Jul 21', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Graduate to Full Abstraction + Demo Day', sub: "Document your complete agentic OS, define what you're still responsible for, and demo the whole system from manager agent down to individual workers.", date: 'Fri, Jul 24', time: '2pm PT / 5pm ET' },
      ],
      cohorts: [
        { month: 'JUL', day: '14', date: 'July 14', label: 'July 14', iso: '2026-07-14', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Tue, Jul 14', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 17', time: '2pm PT / 5pm ET' }, { date: 'Tue, Jul 21', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '2pm PT / 5pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69bd70a2ca371b83aa558f1c)' },
        { month: 'AUG', day: '11', date: 'August 11', label: 'August 11', iso: '2026-08-11', scheduleDays: 'Tuesdays & Fridays', sessionTimes: null, cohortSessions: [], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69b19cc2f61c38f9e9bc9066)' },
        { month: 'SEP', day: 'TBD', date: 'September 2026', label: 'September 2026', iso: '2026-09-15', scheduleDays: 'Schedule TBD', sessionTimes: null, cohortSessions: [], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69e525cefe0055e715a6a025)' },
      ],
      levelIndex: 4,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-5',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69bd70a2ca371b83aa558f1c)',
    },
  ]

  const faqs = [
    {
      q: 'What level should I take?',
      a: "Level 1 is the right starting point for most people. If you use AI tools but haven't built workflows, automations, or agents yet, start there. If you're already building and running automations in your daily work, reach out and we'll help you find the right entry point.",
    },
    {
      q: "What's the difference between AI Builder Core and Advanced?",
      a: 'Core is Levels 1–3 — 6 weeks total — and takes most builders from AI user to running their own autonomous agent system. Advanced is Levels 4–5, designed for sophisticated builders who want to design multi-agent systems and ship production AI systems that scale. You can take Core on its own, or bundle Core + Advanced (all 5 levels) for the full journey.',
    },
    {
      q: 'How do the levels fit together? Are they separate courses?',
      a: 'Each level is a standalone course you can take on its own. They also build on each other: Level 1 covers core AI fluency, Level 2 builds agents, Level 3 makes them autonomous, Level 4 orchestrates them at scale, and Level 5 ships production systems. You can start at any level, but the series is designed to take you from capable to advanced.',
    },
    {
      q: 'What if AI tools change after I take the course?',
      a: "They will, and that's exactly why we built the retake policy. Our curriculum is updated continuously. When you retake, you get the latest version with new tools, new techniques, and new workflows.",
    },
    {
      q: 'Is this for individuals or teams?',
      a: 'Both. Individuals can enroll directly. Teams of 5+ get volume pricing, a dedicated account manager, and custom use case workshops. <a href="https://joinleland.typeform.com/to/a4DMXJjV#" target="_blank" rel="noopener noreferrer">Learn more about team training.</a>',
    },
    {
      q: 'Can I take just one course?',
      a: 'Yes. Each course stands alone. But the series is designed to build on itself, and enrolling in all five gives you the best price and the most complete skill set.',
    },
    {
      q: 'Do I need coding experience?',
      a: 'No. The series is designed for knowledge workers, not engineers. You will learn technical concepts, but everything is taught in a way that prioritizes practical application over code. That said, if you do have a technical background, the later courses (Build Your Agent Workforce and Design Your AI Orchestration Layer) go deep enough to challenge experienced builders.',
    },
    {
      q: 'Which AI tools do I need for this course?',
      a: "We focus on teaching concepts in a tool-agnostic way so you can bring whatever AI tools you already use. ChatGPT, Claude, and Gemini will work for the course. We'll use the terminal and workflow builders, and for these interfaces, you can choose from a variety of tool options. Our team will be working from Claude/Claude Code, and that's what we recommend you use if you don't have a preferred LLM you're already using.",
    },
    {
      q: 'Do I need a paid AI subscription?',
      a: "A paid subscription of $20/mo or higher for ChatGPT or Claude will give you faster responses, the full suite of features, and access to the most capable models. It's strongly recommended you invest in a paid AI subscription to get the full value of the AI Builder Program.",
    },
    {
      q: "What if I enroll in a level and it's too easy or too hard?",
      a: "We want to make sure you're learning AI at the level that's right for you, so you can request to change levels for a week after your cohort starts.",
    },
    {
      q: "My company doesn't let me connect AI to our internal systems. Can I still get value from this program?",
      a: "Yes, and we designed the program with this in mind. A core skill we teach is how to build effective AI workflows without connecting to your company's live data. You'll learn how to structure information manually, build automations around what you can access, and get real results within whatever constraints your IT policy sets. Connecting tools via MCP connectors is something we teach as an optional capability, not a requirement.",
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
  const skillPills = ['Agent building', 'Workflow automation', 'Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Report generation', 'Client communication', 'Go-to-market systems', 'Content creation', 'Financial modeling']

  const trackItems = [
    { num: '01', tier: 'core', name: <>Use AI to 10x<br/>Your Impact</>, tagline: "Create AI tools and artifacts that amplify your impact.", href: '#course-1', learnMoreUrl: '/level-1', thumb: 'thumbnail-level1.png', cohortDate: 'June 9, 2026', pastSoldOut: ['Apr 21', 'May 12', 'May 26'], fillingFast: true, featured: true },
    { num: '02', tier: 'core', name: <>Build Complex<br/>Agentic Workflows</>, tagline: 'Ship autonomous agents that handle real tasks end-to-end.', href: '#course-2', learnMoreUrl: '/level-2', thumb: 'thumbnail-level2.png', cohortDate: 'June 8, 2026', pastSoldOut: ['Apr 21', 'May 12', 'May 26'], secondary: true },
    { num: '03', tier: 'core', name: <>Create Autonomous<br/>Agents</>, tagline: 'Build AI automations that operate as an autonomous system.', href: '#course-3', learnMoreUrl: '/level-3', thumb: 'thumbnail-level3.png', cohortDate: 'June 8, 2026', pastSoldOut: ['May 26'] },
    { num: '04', tier: 'advanced', name: <>Build Your Agent<br/>Workforce</>, tagline: 'Orchestrate multiple agents that communicate and collaborate.', href: '#course-4', learnMoreUrl: '/level-4', thumb: 'thumbnail-level4.png', cohortDate: 'June 22, 2026' },
    { num: '05', tier: 'advanced', name: <>Design Your AI<br/>Orchestration Layer</>, tagline: 'Build production AI systems that proactively iterate toward goals.', href: '#course-5', learnMoreUrl: '/level-5', thumb: 'thumbnail-level5.png', cohortDate: 'July 14, 2026' },
  ]

  return (
    <>
      {/* ====== 1. Navigation ====== */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <div className="nav-cta-pair">
            <a href={`${SALES_URL}?utm_content=nav-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" onClick={() => posthog.capture('app--sales_cta_click', { source: 'nav' })}>
              Talk with Our Team
            </a>
            <a href="#pricing" className="btn btn-primary btn-sm" style={{ borderRadius: '4px', fontSize: '12px' }} onClick={() => posthog.capture('app--enroll_cta_click', { source: 'nav' })}>
              Enroll Now
            </a>
          </div>
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

          <h1>Build with AI to <br className="mobile-br" /><RotatingText items={['10x your impact', 'future-proof your work', 'scale your business', 'accelerate your career', 'automate manual work']} interval={2500} /></h1>

          <p className="hero-sub">Leland's AI Builder Program helps you build tools that transform how you work, so you have more time and leverage to pursue what matters.</p>

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
            <div className="track-tier-row">
              {[
                { key: 'core', eyebrow: 'AI Builder Core', meta: 'Levels 1–3 · 6 weeks · For everyone' },
                { key: 'advanced', eyebrow: 'AI Builder Advanced', meta: 'Levels 1–5 · 10 weeks · For sophisticated builders' },
              ].map(tier => (
                <div className={`track-tier track-tier-${tier.key}`} key={tier.key}>
                  <div className={`track-tier-header track-tier-header-${tier.key}`}>
                    <div className="track-tier-header-text">
                      <span className="track-tier-eyebrow-row">
                        <span className="track-tier-eyebrow">{tier.eyebrow}</span>
                        {tier.key === 'core' && <span className="track-tier-most-popular">Most Popular</span>}
                      </span>
                      <span className="track-tier-meta">{tier.meta}</span>
                    </div>
                    {tier.key === 'core' && (
                      <div className="track-tier-cta">
                        <div className="track-tier-cta-buttons">
                          <a
                            href="https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); posthog.capture('app--enroll_cta_click', { source: 'tier-core' }) }}
                          >
                            Enroll
                          </a>
                          <a
                            href="#course-accordion"
                            className="btn btn-secondary-outline btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Learn more
                          </a>
                        </div>
                        <span className="track-tier-scarcity">{scarcityCount} purchased in the last week</span>
                      </div>
                    )}
                    {tier.key === 'advanced' && (
                      <div className="track-tier-cta">
                        <div className="track-tier-cta-buttons">
                          <a
                            href="#course-4"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Learn more
                          </a>
                        </div>
                        <span className="track-tier-scarcity">{advancedScarcityCount} purchased in the last week</span>
                      </div>
                    )}
                  </div>
                  {trackItems.filter(item => item.tier === tier.key).map(item => {
                    const idx = trackItems.findIndex(t => t.num === item.num)
                    return (
                      <div className={`track-card track-card-tier-${item.tier}${item.featured ? ' track-card-featured' : ''}${item.secondary ? ' track-card-secondary' : ''}`} key={item.num} onClick={() => { setOpenAccordion(idx); setTimeout(() => { const el = document.querySelector(item.href); if (el) { const navHeight = document.querySelector('nav')?.offsetHeight || 60; const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16; window.scrollTo({ top, behavior: 'smooth' }); } }, 100); }}>
                        <div className="track-card-body">
                          <img
                            src={`${import.meta.env.BASE_URL}assets/thumbnails/${item.thumb}`}
                            alt=""
                            className="track-card-thumb"
                          />
                          <div className="track-label">
                            <span className="track-label-text">LEVEL</span>
                            <span className="track-label-num">{item.num}</span>
                            {item.fillingFast && <span className="track-card-filling-fast">Filling fast</span>}
                          </div>
                          <div className="track-title">{item.name}</div>
                          <div className="track-desc">{item.tagline}</div>
                          {item.pastSoldOut && item.pastSoldOut.length > 0 && (
                            <span className="track-card-past-sold-out">
                              {item.pastSoldOut.map((d, i) => (
                                <React.Fragment key={d}>
                                  {i > 0 && <span className="track-card-past-sold-out-sep"> · </span>}
                                  <span className="track-card-past-sold-out-date">{d}</span>
                                </React.Fragment>
                              ))}
                              <span className="track-card-past-sold-out-tag"> Sold out</span>
                            </span>
                          )}
                          <div className="track-card-footer">
                            <div className="track-card-cohort-block">
                              <span className="track-card-cohort-label">NEXT COHORT</span>
                              <span className="track-card-cohort-date">{item.cohortDate}</span>
                            </div>
                            <span className="track-card-arrow-btn">&rarr;</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <p className="cards-cta-line">
              Need financial help?{' '}
              <a
                href={`${SCHOLARSHIP_URL}&utm_content=cards-line-scholarship`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => posthog.capture('app--sales_cta_click', { source: 'cards-line-scholarship' })}
              >
                Apply for a scholarship
              </a>.
            </p>
          </div>

        </div>
      </section>

      {/* ====== 3. "Why This Course" ====== */}
      <section className="save-time-section" id="about">
        <div className="container">
          <div className="save-time-split">
            <div className="save-time-left">
              <AgentNetwork />
            </div>
            <div className="save-time-right">
              <h2 className="save-time-headline">Build and direct an AI agent team that scales your impact</h2>
              <p className="save-time-sub">Stop doing every task yourself. Build specialized agents that triage your inbox, run research, prep your slides, ship your outreach, and more. All managed by you.</p>
              <p className="save-time-cite">AI Builders who deploy agents across their workflows aren't just saving time. They're <strong>shipping the output of an entire team</strong> from a single laptop.</p>
              <a
                href="#pricing"
                className="btn btn-primary btn-lg save-time-cta"
                onClick={() => posthog.capture('app--enroll_cta_click', { source: 'save-time-section' })}
              >
                Enroll Now <span className="arrow">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== VP1 — after Why This Course ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(${import.meta.env.BASE_URL}assets/review-bg.png)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Be the AI expert<br />your team relies on</h2>
            <p>Build skills, agents, and systems your colleagues notice. Upon completion of the course, you'll have a certificate (and real AI outcomes) you can share on LinkedIn.</p>
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
            <span className="testimonials-review-number">29,301 reviews</span>
            <span className="testimonials-review-community">in the Leland community</span>
          </div>
          <h2 className="testimonials-headline">See what builders are saying</h2>
          <ReviewsCarousel />
          <div className="testimonials-see-more">
            <a href="/reviews" className="testimonials-see-more-btn">See more reviews →</a>
          </div>
        </div>
      </section>

      {/* ====== 5. Value Stack 1 (pricing anchor) ====== */}
      <ValueStack id="pricing" />

      {/* ====== Why — skills + tools ====== */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <h2 className="why-headline">Become an AI Builder in 6-10 weeks</h2>
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
          <div className="why-cta">
            <a
              href="#pricing"
              className="btn btn-primary btn-lg"
              onClick={() => posthog.capture('app--enroll_cta_click', { source: 'why-section' })}
            >
              Enroll Now <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====== 12. Iceberg + 5-Course Accordion ====== */}
      <section className="accordion-section" id="course-accordion">
        <div className="container">
          <div className="accordion-section-header accordion-section-header-stacked">
            <div className="accordion-section-header-text">
              <h2 className="accordion-section-headline">One program, five levels</h2>
              <p className="accordion-section-sub">Levels 1–3 build the AI foundation every knowledge worker needs. Levels 4–5 go deeper, for sophisticated builders ready to ship production systems. Learn more about the different levels below.</p>
            </div>
            <IcebergVisualization />
          </div>
          <div className="accordion-list" style={{ marginTop: 48 }}>
            {courses.map((course, i) => (
              <CourseAccordionItem key={course.id} course={course} open={openAccordion === i} onToggle={() => setOpenAccordion(openAccordion === i ? null : i)} />
            ))}
          </div>
          <WhichLevelDropdown />

          {/* Bundle callout */}
          <div style={{ marginTop: 32, padding: '28px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>Bundle the full program and save</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>AI Builder Core (Levels 1–3)</span>
                  <span style={{ color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--font-meta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>most popular</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>The full Core program — Levels 1, 2, and 3 — completed in 6 weeks. The right starting point for most builders.</p>
                <a href="https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                  Get the Core bundle <span className="arrow">&rarr;</span>
                </a>
              </div>
              <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>AI Builder Advanced (Levels 1–5)</span>
                  <span style={{ color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--font-meta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>best value</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>The complete journey — all five levels — for builders who want to ship production AI systems.</p>
                <a href="https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c433d93e28f6893acab6c9%2C69c433eddf04fb0e41cf2000)" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                  Get the Advanced bundle <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>After you buy a bundle, we'll send you a form to select the cohort dates and times you want to enroll in.</p>
            <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(165,228,70,0.06)', border: '1px solid rgba(165,228,70,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>Not sure which bundle is right, or have other questions?</span>
              <a
                href={`${SALES_URL}?utm_content=bundle-callout`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                onClick={() => posthog.capture('app--sales_cta_click', { source: 'bundle-callout' })}
              >
                Talk with Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Use Cases by Role ====== */}
      <RoleUseCases />

      {/* ====== VP3 — after Save Time ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(${import.meta.env.BASE_URL}assets/images/image2.jpg)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Work smarter with<br className="mobile-br" /> reusable skills and workflows</h2>
            <p>Advance beyond typing questions into ChatGPT by learning to build workflows, automate tasks, and create reusable skills that make AI work the way you want it to.</p>
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

      {/* ====== 13. Certification (CardSwap) ====== */}
      <section className="certification" id="certification">
        <div className="container">
          <div className="cert-intro">
            <h2>Walk away certified.</h2>
            <p className="cert-desc">
              Every course in the series culminates in a verified certificate of completion from Leland. Finish all five and earn the full AI Builder designation — a signal to employers, clients, and colleagues that you operate at the highest level of AI proficiency.
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
                      <span className="cert-program">AI Builder Program</span>
                      <span className="cert-subprogram">Use AI to 10x Your Impact &middot; Build Complex Agentic Workflows &middot; Create Autonomous Agents &middot; Build Your Agent Workforce &middot; Design Your AI Orchestration Layer</span>
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
                      <span className="cert-program">Use AI to 10x Your Impact</span>
                      <span className="cert-subprogram">Level 01 &middot; AI Builder Program</span>
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
                      <span className="cert-program">Build Complex Agentic Workflows</span>
                      <span className="cert-subprogram">Level 02 &middot; AI Builder Program</span>
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

      {/* ====== Get This Expensed ====== */}
      <GetThisExpensed />

      {/* ====== Each-session value prop (moved away from VP3) ====== */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/value-prop-2.jpg)` }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Each session, build something you'll use at work the next day</h2>
            <p>Every session ends with a deliverable you can put to work immediately. From automations to data analysis to personalized skills, you'll save hours every week.</p>
          </div>
        </div>
      </section>

      {/* ====== 14. Advisor CTA ====== */}
      <section className="advisor-section">
        <div className="container">
          <div className="advisor-card">
            <h2>Not sure which course is right for you?</h2>
            <p>Book a free call with an advisor to find the right fit.</p>
            <a href={`${SALES_URL}?utm_content=advisor-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'advisor' })}>
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
                Train your team on AI. See ROI in weeks. We work with 10-person startups to Fortune 500s to drive AI impact quickly through our AI Builder Program or custom options that fit your needs. Reach out for volume pricing, custom use cases, and dedicated support.
              </p>
              <div className="enterprise-bottom">
                <ul className="enterprise-points">
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h3v1H2v2H1V1zM10 1h3v3h-1V2h-2V1zM1 10v3h3v-1H2v-2H1zM13 10v3h-3v-1h2v-2h1z" fill="currentColor"/><rect x="5" y="5" width="4" height="4" fill="currentColor"/></svg> Team support for 5 – 50,000</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="3" fill="currentColor"/><rect x="2" y="5.5" width="10" height="3" fill="currentColor"/><rect x="2" y="10" width="10" height="3" fill="currentColor"/></svg> Custom workshops available</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="1" width="4" height="4" fill="currentColor"/><rect x="3" y="6" width="8" height="2" fill="currentColor"/><rect x="1" y="9" width="12" height="4" fill="currentColor"/></svg> Dedicated account manager</li>
                </ul>
                <a href="https://calendly.com/d/ct7k-c45-dbx/leland-s-ai-builder-program-for-teams" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                  Talk with Our Team
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
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== Footer CTA ====== */}
      <section className="footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="footer-cta-sub">Our next cohort starts June 8</p>
          <div className="cta-pair">
            <a href={`${SALES_URL}?utm_content=footer-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'footer' })}>
              Talk with Our Team
            </a>
            <a href="#pricing" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--enroll_cta_click', { source: 'footer' })}>
              Enroll Now <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved. &middot; <a href="https://www.notion.so/joinleland/AI-Builder-Program-Guarantee-Terms-32ea84f4c7d28068b213ee17ef868deb" target="_blank" rel="noopener noreferrer">Guarantee Terms</a></p>
        </div>
      </footer>

      <LPPopup />
    </>
  )
}

function App() {
  const path = window.location.pathname

  useEffect(() => {
    const pageNames = {
      '/teams': 'Teams',
      '/syllabus': 'Syllabus',
    }
    const levelMatch = path.match(/\/level-(\d+)/)
    const pageName = levelMatch
      ? `Level ${levelMatch[1]}`
      : (pageNames[path.replace(/\/$/, '')] || 'Home')
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'page_view', page_path: path, page_name: pageName })
  }, [path])

  if (path.startsWith('/teams')) {
    return <B2BPage />
  }
  if (path.startsWith('/syllabus')) {
    return <SyllabusPage />
  }
  if (path.startsWith('/reviews')) {
    return <ReviewsPage />
  }
  const match = path.match(/\/level-(\d+)/)
  if (match) {
    return <CoursePage courseId={parseInt(match[1], 10)} />
  }
  return <HomePage />
}

export default App
