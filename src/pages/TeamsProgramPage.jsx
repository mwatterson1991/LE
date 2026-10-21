import React, { useState, useEffect, useRef } from 'react'
import { TextMorph } from 'torph/react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import Marquee from 'react-fast-marquee'
import Nav from '../components/Nav'
import LPPopup from '../components/LPPopup'
import GetThisExpensed from '../components/GetThisExpensed'
import CohortPicker from '../components/CohortPicker'
import ReviewCard, { orderReviews } from '../components/ReviewCard'
import { COURSE_COHORTS, courseData } from './courseData'
import { BorderBeam } from 'border-beam'
import './home-rebrand.css'
import './leland-ai.css'
import './program-for-teams.css'

const ENROLL_URL = (() => {
  const cohorts = COURSE_COHORTS[1] || []
  const now = new Date()
  const next = cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now)
    || cohorts.find(c => c.enrollUrl && !c.soldOut)
  return next?.enrollUrl || cohorts[0]?.enrollUrl
})()

const NEXT_COHORT_DISPLAY = (() => {
  const l1 = COURSE_COHORTS[1] || []
  const now = new Date()
  const next = l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso) && new Date(c.iso + 'T15:00:00Z') >= now)
    || l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso))
  const target = next ? new Date(next.iso + 'T15:00:00Z') : new Date('2026-06-22T15:00:00Z')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[target.getUTCMonth()]} ${target.getUTCDate()}`
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
  <div className="star-row" style={{ color: 'var(--gray-dark)' }}>
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
  const [cohortDate, setCohortDate] = useState(null)

  useEffect(() => {
    const now0 = new Date()
    const l1 = COURSE_COHORTS[1] || []
    const nextCohort =
      l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso) && new Date(c.iso + 'T15:00:00Z') >= now0) ||
      l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso))
    const target = nextCohort ? new Date(nextCohort.iso + 'T15:00:00Z') : new Date('2026-05-26T15:00:00Z')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    setCohortDate({
      month: months[target.getUTCMonth()].toUpperCase(),
      day: target.getUTCDate(),
      display: `${fullMonths[target.getUTCMonth()]} ${target.getUTCDate()}`,
    })
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
      <a
        href="#level-accordion"
        className="cd-link"
        onClick={(e) => {
          e.preventDefault()
          const el = document.querySelector('#level-accordion')
          if (el) {
            const navHeight = document.querySelector('.rb-nav')?.offsetHeight || 60
            const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16
            window.scrollTo({ top, behavior: 'smooth' })
          }
        }}
      >
        {cohortDate && (
          <div className="cd-cal">
            <span className="cd-cal-month">{cohortDate.month}</span>
            <span className="cd-cal-day">{cohortDate.day}</span>
          </div>
        )}
        <div className="cd-info">
          <span className="cd-info-title">Next cohort</span>
          <span className="cd-info-date">Starts {cohortDate?.display}</span>
        </div>
        <span className="cd-arrow">&rarr;</span>
      </a>
      <div className="cd-units">
        <div className="cd-unit">
          <span className="cd-num">{time.d}</span>
          <span className="cd-lbl">Days</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.h}</span>
          <span className="cd-lbl">Hrs</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.m}</span>
          <span className="cd-lbl">Min</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{time.s}</span>
          <span className="cd-lbl">Sec</span>
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

function TestimonialsBoard() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch('/data/featured-reviews.json')
      .then(r => r.ok ? r.json() : [])
      .then(d => setReviews(d || []))
      .catch(() => setReviews([]))
  }, [])

  if (!reviews.length) return null

  const mapped = reviews.map((r, i) => ({
    name: r.display_name,
    subtitle: r.level === 'L2' ? 'Completed Level 2' : 'Completed Level 1',
    date: '',
    stars: r.rating,
    text: r.review,
    photo_url: r.photo_url || null,
  }))

  // Keep anonymous reviews out of the first 8, then sprinkle them in among the rest
  const ordered = orderReviews(mapped)

  // Distribute into 4 columns: cols 0,2 get 5 cards; cols 1,3 get 4 cards
  const columns = [[], [], [], []]
  ordered.forEach((review, i) => {
    columns[i % 4].push(review)
  })

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-container">
        <div className="testimonials-header">
          <p className="testimonials-label">
            <span className="testimonials-dot" />
            Verified Reviews
          </p>
          <h2 className="testimonials-heading">Here&rsquo;s what people are saying.</h2>
        </div>

        <div className="tboard-wrap">
          <div className="tboard">
            {columns.map((col, i) => (
              <div className="tboard-col" key={i}>
                {col.map((review, j) => (
                  <ReviewCard review={review} key={j} />
                ))}
              </div>
            ))}
          </div>
          <div className="tboard-fade" />
          <div className="tboard-cta">
            <a href="/reviews" className="tboard-show-more">See all reviews</a>
          </div>
        </div>
      </div>
    </section>
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
      <Marquee gradient gradientColor="#FFFFFF" gradientWidth={48} speed={32} pauseOnHover>
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
          <span className="accordion-level">{String(course.num).padStart(2, '0')}</span>
          <div className="accordion-header-text">
            <h3 className="accordion-title">{course.title}</h3>
            <p className="accordion-tagline">{course.tagline.split('.')[0]}.</p>
          </div>
        </div>
        <div className="accordion-header-right">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}>
            <ChevronIcon />
          </motion.div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
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
                    {(() => {
                      let lastMonth = null
                      return course.sessions.map((session, i) => {
                        const cohortSession = selectedCohort?.cohortSessions?.[i]
                        const displayDate = cohortSession?.date ?? session.date
                        const displayTime = cohortSession?.time ?? session.time
                        // Parse "Mon, Jun 22" → { month: 'JUN', day: '22' }
                        const dateMatch = displayDate?.match(/\w+,\s*(\w+)\s+(\d+)/)
                        const calMonth = dateMatch ? dateMatch[1].toUpperCase() : lastMonth
                        const calDay = dateMatch ? dateMatch[2] : 'TBD'
                        if (dateMatch) lastMonth = calMonth
                        return (
                          <div className="course-session" key={i}>
                            <div className="course-session-cal">
                              <span className="course-session-cal-month">{calMonth || '—'}</span>
                              <span className={`course-session-cal-day${calDay === 'TBD' ? ' course-session-cal-day-tbd' : ''}`}>{calDay}</span>
                            </div>
                            <div className="course-session-text">
                              <span className="course-session-title">{session.title}</span>
                              <span className="course-session-sub">{session.sub}</span>
                              {displayDate && <span className="course-session-datetime">{displayDate} &middot; {displayTime}</span>}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  {detail.whatYoullBuild && detail.whatYoullBuild.length > 0 && (
                    <div className="accordion-detail-block">
                      <span className="accordion-detail-label">What you'll build</span>
                      <ul className="accordion-detail-list">
                        {detail.whatYoullBuild.map(item => (
                          <li key={item}><img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="accordion-detail-check" /><span>{item}</span></li>
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
                  <span className="accordion-price-sub">Volume pricing on consult. Team members can switch cohorts as schedules change.</span>
                </div>
                <a href="https://calendly.com/d/ct7k-c45-dbx/leland-s-ai-builder-program-for-teams" target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => posthog.capture('app--sales_cta_click', { source: 'course-accordion', level: course.num })}>
                  Talk to our team
                  <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            <stop offset="0%" stopColor="rgba(128,172,237,0.30)" />
            <stop offset="100%" stopColor="rgba(128,172,237,0)" />
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

const AGENT_ICONS = {
  'Weekly metrics digest': 'analytics.svg',
  'Decision memo drafter': 'session-notes.svg',
  'Board prep agent': 'digital-products.svg',
  'Brief-to-assets agent': 'ideation.svg',
  'Brand voice eval': 'reviews.svg',
  'Competitive intel agent': 'analytics.svg',
  'Pre-call research agent': 'profile-page.svg',
  'Outbound sequencer': 'message.svg',
  'Pipeline hygiene agent': 'goal-tracking.svg',
  'Account health monitor': 'analytics.svg',
  'QBR prep agent': 'session-notes.svg',
  'Onboarding personalizer': 'scheduling.svg',
  'Cross-tool data pipeline': 'asset.svg',
  'Anomaly detector': 'goal-tracking.svg',
  'SOP keeper': 'session-notes.svg',
  'Variance detector': 'analytics.svg',
  'Close-prep agent': 'payments.svg',
  'Investor update drafter': 'digital-products.svg',
  'Customer call synthesizer': 'video-calls.svg',
  'Spec drafter': 'session-notes.svg',
  'Feedback prioritizer': 'survey.svg',
  'Candidate screener': 'client-acquisition.svg',
  'Review synthesizer': 'reviews.svg',
  'Comp benchmarking agent': 'payments.svg',
}

function RoleUseCases() {
  const [activeRole, setActiveRole] = useState(0)
  const roles = [
    {
      name: 'Executives',
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
          <h2 className="role-uses-headline">Built for the teams that drive your business.</h2>
          <p className="role-uses-sub">Engineering already has AI. The teams that haven't been served yet are the ones that drive your numbers. Pick a function below for examples of what Leland-trained builders ship in their day-to-day.</p>
        </div>
        <div className="role-tabs" role="tablist">
          {roles.map((role, i) => (
            <button
              key={role.name}
              className={'role-tab' + (i === activeRole ? ' role-tab-active' : '')}
              onClick={() => setActiveRole(i)}
              role="tab"
              aria-selected={i === activeRole}
            >
              {role.name}
            </button>
          ))}
        </div>
        <div className="role-agents" key={activeRole}>
          {roles[activeRole].examples.map(([name, desc], j) => (
            <div className="role-agent-card" key={name} style={{ animationDelay: `${j * 0.07}s` }}>
              <div className="role-agent-illo">
                <img src={`${import.meta.env.BASE_URL}assets/product-illustrations/${AGENT_ICONS[name] || 'asset.svg'}`} alt="" loading="lazy" />
              </div>
              <div className="role-agent-name">{name}</div>
              <div className="role-agent-desc">{desc}</div>
            </div>
          ))}
          <div className="role-agent-card role-agent-more">
            <div className="role-agent-illo" aria-hidden="true">+</div>
            <div className="role-agent-name">…and whatever your team dreams up</div>
            <div className="role-agent-desc">Your team will have the skills to build for any workflow that drains them.</div>
          </div>
        </div>
        <div className="role-uses-capper">
          <p className="role-uses-capper-text">Every session, your team ships something they use at work the next day.</p>
          <p className="role-uses-capper-sub">Structure and expert support to build for their actual work, not generic exercises.</p>
        </div>
      </div>
    </section>
  )
}

function TeamPricingSection({ id, variant = 'solution', headline = 'Bring AI Builder to your team.', sub = 'More than training. An end-to-end engagement to make your team AI-fluent and keep them there.', eyebrow = '› 03 / The Solution' }) {
  const CALENDLY = 'https://calendly.com/d/ct7k-c45-dbx/leland-s-ai-builder-program-for-teams'

  const pillars = [
    {
      num: '01',
      icon: 'group-sessions.svg',
      title: 'The AI Builder Program',
      desc: 'The core engagement. Five-level curriculum, live cohorts, hands-on building from week one.',
      bullets: [
        'AI Builder (Levels 1–3) for every knowledge worker',
        'AI Architect (Levels 4–5) for technical champions',
        '4 core 90-min sessions + optional build workshops per level',
        'All sessions recorded; team members can switch cohorts',
      ],
    },
    {
      num: '02',
      icon: 'ideation.svg',
      title: 'Custom Build Workshops',
      desc: 'Functional experts running tailored sessions for your team’s actual workflows, embedded inside your cohort schedule.',
      bullets: [
        'Sales, marketing, finance, ops, recruiting, CS tracks',
        'Sessions built around the systems your team actually uses',
        'Pre-built skill files and templates your team adapts',
        'Available for engagements of 25+ seats',
      ],
    },
    {
      num: '03',
      icon: 'scheduling.svg',
      title: 'Implementation & Program Management',
      desc: 'We run the program so your team doesn’t have to. From kickoff to leadership reporting.',
      bullets: [
        'Dedicated account manager from day one',
        'Admin dashboard for enrollment, progress, shipped builds',
        'Capability assessment and level placement per team member',
        'Outcome reporting your leadership can act on',
      ],
    },
    {
      num: '04',
      icon: 'retake.svg',
      title: 'Ongoing Partnership',
      desc: 'The capability compounds long after the first cohort wraps. Your team keeps building.',
      bullets: [
        '1 year of access to every subsequent cohort',
        'Unlimited retakes with the latest curriculum',
        'Builder community across all enrolled orgs',
        'Curriculum refreshed continuously as AI evolves',
      ],
    },
  ]

  if (variant === 'cta') {
    return (
      <section className="team-solution" id={id || undefined}>
        <div className="container">
          <div className="b2b-section-head" style={{ marginBottom: 32 }}>
            <h2 className="b2b-section-headline">{headline}</h2>
            <p className="b2b-section-sub">{sub}</p>
          </div>
          <div className="team-solution-cta">
            <div className="team-solution-cta-text">
              <span className="team-solution-cta-eyebrow">› One conversation</span>
              <h3 className="team-solution-cta-title">A roadmap your leadership can act on.</h3>
              <p className="team-solution-cta-sub">Even if you don’t move forward with us, you’ll walk away with a tailored plan and clear next steps.</p>
            </div>
            <div className="team-solution-cta-actions">
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                onClick={() => posthog.capture('app--sales_cta_click', { source: `team-pricing-${id || 'secondary'}` })}
              >
                Talk to our team
              </a>
              <a href="/program" className="team-solution-cta-secondary">Buying for yourself? See the individual program &rarr;</a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="team-solution" id={id || undefined}>
      <div className="container">
        <div className="b2b-section-head">
          {eyebrow && <span className="b2b-eyebrow">{eyebrow}</span>}
          <h2 className="b2b-section-headline">{headline}</h2>
          <p className="b2b-section-sub">{sub}</p>
        </div>
        <div className="team-solution-grid">
          {pillars.map(p => (
            <div className="team-solution-card" key={p.num}>
              <div className="team-solution-card-head">
                <div className="team-solution-card-icon">
                  <img src={`${import.meta.env.BASE_URL}assets/product-illustrations/${p.icon}`} alt="" />
                </div>
                <div className="team-solution-card-meta">
                  <span className="team-solution-card-num">{p.num} · Component</span>
                  <h3 className="team-solution-card-title">{p.title}</h3>
                </div>
              </div>
              <p className="team-solution-card-desc">{p.desc}</p>
              <ul className="team-solution-card-list">
                {p.bullets.map(b => <li key={b}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="engagement-details">
          <div className="engagement-details-head">
            <h3 className="engagement-details-title">Engagement details</h3>
            <span className="engagement-details-eyebrow">› At a glance</span>
          </div>
          <div className="engagement-details-rows">
            <div className="engagement-details-row">
              <span className="engagement-details-key">Per-seat (Levels 1–3)</span>
              <span className="engagement-details-val">From $2,000 / seat</span>
            </div>
            <div className="engagement-details-row">
              <span className="engagement-details-key">Volume discounts</span>
              <span className="engagement-details-val">Tiered at 25 / 100 / 500+ seats</span>
            </div>
            <div className="engagement-details-row">
              <span className="engagement-details-key">Minimum engagement</span>
              <span className="engagement-details-val">5 seats</span>
            </div>
            <div className="engagement-details-row">
              <span className="engagement-details-key">Custom workshops</span>
              <span className="engagement-details-val">Unlocked at 25+ seats</span>
            </div>
            <div className="engagement-details-row">
              <span className="engagement-details-key">Standard kickoff</span>
              <span className="engagement-details-val">Within 7 days of consult</span>
            </div>
            <div className="engagement-details-row">
              <span className="engagement-details-key">Cohort access</span>
              <span className="engagement-details-val">1 year of retakes included</span>
            </div>
          </div>
          <div className="engagement-details-foot">
            <p className="engagement-details-foot-text">Portfolio, partnership, and education discounts available. We size each engagement to your seat count, function mix, and security requirements.</p>
            <div className="team-solution-cta-actions">
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                onClick={() => posthog.capture('app--sales_cta_click', { source: `team-pricing-${id || 'secondary'}` })}
              >
                Talk to our team
              </a>
              <a href="/program" className="team-solution-cta-secondary">Buying for yourself? See /program &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueStack({ id, showIncludes = true, showAdvisor = false, headline = 'Choose your path', sub = 'Three ways to become an AI Builder. Start small or commit to the full journey.' }) {
  const CORE_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)'
  const ADVANCED_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c433d93e28f6893acab6c9%2C69c433eddf04fb0e41cf2000)'

  const tiers = [
    {
      key: 'level-1',
      name: 'Level 1',
      sub: 'Level 1',
      meta: 'Best for anyone just starting out',
      badge: 'À la carte',
      badgeWhite: true,
      crossed: '$2,500 value',
      price: '$999',
      monthly: '$257/mo with payment plan',
      cta: 'Start with Level 1',
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
      ],
    },
    {
      key: 'core',
      name: 'AI Builder Core',
      sub: 'Levels 1–3',
      meta: 'The essential program for all knowledge workers',
      badge: 'Most Popular',
      featured: true,
      crossed: '$7,500 value',
      price: '$1,999',
      monthly: '$514/mo with payment plan',
      cta: 'Enroll now',
      enrollUrl: CORE_URL,
      utm: 'value-stack-core',
      buildsHeader: 'Everything in Level 1, plus:',
      builds: [
        'Cloud-based automations that run on their own',
        'Automation Advisor agent grounded in your context',
        'An Eval System that scores agent outputs',
        'A custom Agent Operating System',
        'Autonomous agents you trust on full auto-approve',
      ],
      stats: [
        ['6 weeks', 'duration'],
        ['24+ hours', 'live online instruction'],
      ],
    },
    {
      key: 'advanced',
      name: 'AI Builder Advanced',
      sub: 'Levels 1–5',
      meta: 'For sophisticated builders who want to go all-in',
      badge: 'Best Value',
      badgeWhite: true,
      crossed: '$12,500 value',
      price: '$2,999',
      monthly: '$772/mo with payment plan',
      cta: 'Get all 5 levels',
      enrollUrl: ADVANCED_URL,
      utm: 'value-stack-advanced',
      buildsHeader: 'Everything in Core, plus:',
      builds: [
        'Goal-directed AI employees with weekly quotas',
        'Orchestration layers delegating to sub-agents',
        'QA layers and self-correcting systems',
        'Long-horizon agents with persistent memory',
        'Production AI systems that improve themselves',
      ],
      stats: [
        ['10 weeks', 'duration'],
        ['40+ hours', 'live online instruction'],
      ],
    },
  ]

  return (
    <section className={`value-stack${id ? '' : ' value-stack-secondary'}`} id={id || undefined}>
      <div className="container">
        <h2 className="value-stack-section-headline">{headline}</h2>
        <p className="value-stack-section-sub">{sub}</p>
        <div className="value-stack-grid">
          {tiers.map(tier => {
            const learnMoreHref = tier.key === 'level-1' ? '#level-1' : tier.key === 'core' ? '#level-1' : '#level-4'
            return (
              <div key={tier.key} className={`value-stack-card${tier.featured ? ' value-stack-card-featured' : ''}`}>
                {tier.badge && <span className={`value-stack-badge${tier.badgeWhite ? ' value-stack-badge-white' : ''}`}>{tier.badge}</span>}
                <div className="value-stack-card-header">
                  <h3 className="value-stack-card-name">{tier.name}</h3>
                  <span className="value-stack-card-meta">{tier.meta}</span>
                  {tier.sub && (
                    <div className="value-stack-card-tags">
                      <span className="value-stack-card-sub">{tier.sub}</span>
                    </div>
                  )}
                </div>
                <div className="value-stack-card-stats">
                  {tier.stats.map(([value, label]) => (
                    <div className="value-stack-card-stat" key={label}>
                      <span className="value-stack-card-stat-value">{value}</span>
                      <span className="value-stack-card-stat-label">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="value-stack-card-builds">
                  <span className="value-stack-card-builds-header">{tier.buildsHeader}</span>
                  <ul className="value-stack-card-builds-list">
                    {tier.builds.map(b => (
                      <li className="value-stack-card-build" key={b}>
                        <img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="value-stack-check" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
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
                      Scholarships available
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
                    {tier.cta}
                  </a>
                  <a href={learnMoreHref} className="value-stack-learn-more">
                    See details
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        <a
          href="#enterprise"
          className="value-stack-teams-callout"
          onClick={() => posthog.capture('app--sales_cta_click', { source: 'value-stack-teams' })}
        >
          <img src={`${import.meta.env.BASE_URL}assets/icons/modern-building-4.svg`} alt="" className="value-stack-teams-icon" />
          <span className="value-stack-teams-text">
            <strong>Buying for a team or enterprise?</strong> Volume pricing, custom use cases, and dedicated support.
          </span>
          <span className="value-stack-teams-arrow" aria-hidden="true">&rarr;</span>
        </a>
        {showAdvisor && (
        <div className="advisor-card value-stack-advisor">
          <h2>Still not sure which path is right?</h2>
          <p>Book a free call with an advisor to find your fit.</p>
          <a href={`${SALES_URL}?utm_content=advisor-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'advisor' })}>
            Schedule a call
            <span className="arrow">&rarr;</span>
          </a>
        </div>
        )}
        {showIncludes && (
        <div className="value-stack-included">
          <span className="value-stack-included-eyebrow">Each tier includes&hellip;</span>
          <div className="value-stack-included-grid">
            {[
              ['1-Year Access Guarantee', 'Recordings and live sessions for every AI Builder cohort over the next 12 months.', 'scheduling.svg'],
              ['Best Program Guarantee', 'Money-back if you find a better AI program anywhere.', 'guarantee.svg'],
              ['Weekly Build Workshops', 'Optional live workshops with functional experts in marketing, sales, finance, ops, and more.', 'ideation.svg'],
              ['Unlimited Retakes', 'Take any cohort again for a full year, always with the latest curriculum.', 'retake.svg'],
              ['Builder Community', 'Join other professionals leveling up their work — trade ideas, get unstuck, and keep each other motivated.', 'community.svg'],
              ['Leland+ Access (3 months)', '5 specialized AI courses and 250+ resources to deepen what you build.', 'digital-products.svg'],
              ['Weekly Office Hours', 'Live Q&A with instructors to unblock your specific builds.', 'office-hours.svg'],
              ['100+ skill.md & Templates', 'Battle-tested files and folder templates that accelerate every build.', 'survey.svg'],
            ].map(([title, desc, illustration]) => (
              <div className="value-stack-included-item" key={title}>
                <img
                  src={`${import.meta.env.BASE_URL}assets/product-illustrations/${illustration}`}
                  alt=""
                  className="value-stack-included-icon"
                />
                <span className="value-stack-included-name">{title}</span>
                <span className="value-stack-included-desc">{desc}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  )
}


function ImageRevealSection() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh
      const end = 0
      const raw = 1 - (rect.top - end) / (start - end)
      setProgress(Math.min(1, Math.max(0, raw)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2

  const containerScale = 0.8 + eased * 0.2
  const imageScale = 1 / containerScale

  const imageUrl = `${import.meta.env.BASE_URL}assets/images/value-prop-1.jpg`

  return (
    <section className="img-reveal-section" ref={sectionRef}>
      <div
        className="img-reveal-container"
        style={{ transform: `scale(${containerScale})` }}
      >
        <img
          className="img-reveal-bg"
          src={imageUrl}
          alt=""
          style={{ transform: `scale(${imageScale})` }}
        />
        <div className="img-reveal-overlay" aria-hidden="true"></div>
        <div className="img-reveal-content">
          <h2 className="img-reveal-heading">Build the team your competitors envy.</h2>
          <p className="img-reveal-desc">
            Move beyond sporadic AI adoption. Get coordinated upskilling that produces internal champions, real shipped systems, and a team that compounds learning instead of sitting through another webinar.
          </p>
        </div>
      </div>
    </section>
  )
}

function SkillsRevealSection() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh
      const end = 0
      const raw = 1 - (rect.top - end) / (start - end)
      setProgress(Math.min(1, Math.max(0, raw)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2

  const containerScale = 0.8 + eased * 0.2
  const imageScale = 1 / containerScale

  const imageUrl = `${import.meta.env.BASE_URL}assets/images/quote-bg.jpg`

  return (
    <section className="img-reveal-section" ref={sectionRef}>
      <div
        className="img-reveal-container"
        style={{ transform: `scale(${containerScale})` }}
      >
        <img
          className="img-reveal-bg"
          src={imageUrl}
          alt=""
          style={{ transform: `scale(${imageScale})` }}
        />
        <div className="img-reveal-overlay" aria-hidden="true"></div>
        <div className="img-reveal-content">
          <h2 className="img-reveal-heading">Reusable skills your team shares, not one-off prompts</h2>
          <p className="img-reveal-desc">
            Build agentic systems, automations, and skill files that get passed around your org. Everyone compounds on each other’s work instead of starting from scratch in their own ChatGPT tab.
          </p>
        </div>
      </div>
    </section>
  )
}

function WhyRevealSection({ toolPills, skillPills }) {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh
      const end = 0
      const raw = 1 - (rect.top - end) / (start - end)
      setProgress(Math.min(1, Math.max(0, raw)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2

  const containerScale = 0.8 + eased * 0.2
  const mediaScale = 1 / containerScale
  const videoUrl = `${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4`

  return (
    <section className="why-reveal-section" ref={sectionRef}>
      <div
        className="why-reveal-container"
        style={{ transform: `scale(${containerScale})` }}
      >
        <video
          className="why-reveal-bg"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{ transform: `scale(${mediaScale})` }}
        />
        <div className="why-reveal-content">
          <div className="why-reveal-left">
            <h2 className="why-reveal-heading">Your team, AI Builders in 6–10 weeks.</h2>
            <div className="why-reveal-tools">
              {toolPills.map(tool => {
                const style = {}
                if (tool.noInvert) style.filter = 'none'
                if (tool.revealSize) style.height = tool.revealSize
                return (
                  <img
                    key={tool.name}
                    src={`${import.meta.env.BASE_URL}assets/logos/tools/${tool.logo}`}
                    alt={tool.name}
                    className="why-reveal-tool-logo"
                    style={Object.keys(style).length ? style : undefined}
                  />
                )
              })}
            </div>
          </div>
          <div className="why-reveal-right">
            <p className="why-reveal-desc">Curriculum updated weekly, tool-agnostic by design, so your team always learns at the frontier of AI. Best practices your builders will master:</p>
            <div className="why-reveal-pills">
              {skillPills.map(skill => (
                <span className="why-reveal-pill" key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const CALENDLY_URL = 'https://calendly.com/d/ct7k-c45-dbx/leland-s-ai-builder-program-for-teams'

export default function TeamsProgramPage() {
  return <TeamsProgramPageInner />
}

function TeamsProgramPageInner() {
  const heroRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')

    const ogImg = 'https://leland.ai/assets/OG-Image.png?v=2'
    const ogMeta = document.querySelector('meta[property="og:image"]')
    const twMeta = document.querySelector('meta[name="twitter:image"]')
    const prevOg = ogMeta?.getAttribute('content')
    const prevTw = twMeta?.getAttribute('content')
    if (ogMeta) ogMeta.setAttribute('content', ogImg)
    if (twMeta) twMeta.setAttribute('content', ogImg)

    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
      if (ogMeta) ogMeta.setAttribute('content', prevOg)
      if (twMeta) twMeta.setAttribute('content', prevTw)
    }
  }, [])

  // Scroll to the #hash section on load (e.g. arriving at /program#pricing from /reviews).
  // The target is React-rendered, so the browser's native hash jump misses it — we re-align
  // for ~1s as the long page settles, offsetting for the sticky nav, and bail on user scroll.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    let stop = false
    let count = 0
    let timer
    const navHeight = () => {
      const nav = document.querySelector('.rb-nav-wrapper')
      return nav ? nav.offsetHeight : 64
    }
    const settle = () => {
      if (stop) return
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight() - 12
        window.scrollTo(0, Math.max(0, top))
      }
      count += 1
      if (count < 8) timer = setTimeout(settle, 120)
    }
    const detach = () => {
      window.removeEventListener('wheel', onUser)
      window.removeEventListener('touchmove', onUser)
      window.removeEventListener('keydown', onUser)
    }
    const onUser = () => { stop = true; clearTimeout(timer); detach() }
    window.addEventListener('wheel', onUser, { passive: true })
    window.addEventListener('touchmove', onUser, { passive: true })
    window.addEventListener('keydown', onUser)
    timer = setTimeout(settle, 60)
    return () => { stop = true; clearTimeout(timer); detach() }
  }, [])

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const navRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [openAccordion, setOpenAccordion] = useState(0)
  const [activeSection, setActiveSection] = useState(null)
  const [scarcityCount, setScarcityCount] = useState(() => getScarcityCount(442, 532, 0))
  const [advancedScarcityCount, setAdvancedScarcityCount] = useState(() => getScarcityCount(75, 110, 1))
  const heroPhrases = ['build real systems', 'ship work, not slides', 'stop falling behind engineering', 'turn AI from tools into capability', 'compound across the whole org']
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0)
  const heroPhrase = heroPhrases[heroPhraseIndex]
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhraseIndex(i => (i + 1) % heroPhrases.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

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
    const wrapper = navRef.current?.closest('.rb-nav-wrapper')
    const onScroll = () => {
      setScrolled(window.scrollY > 200)
      if (wrapper) wrapper.classList.toggle('rb-nav-cta-visible', window.scrollY > 500)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = scrolled ? '#ffffff' : '#000000'
    return () => { if (meta.parentNode) meta.content = '#ffffff' }
  }, [scrolled])

  useEffect(() => {
    if (!menuOpen) return
    const onScroll = () => setMenuOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('rb-nav-menu-open', menuOpen)
    return () => document.body.classList.remove('rb-nav-menu-open')
  }, [menuOpen])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const wrapper = nav.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => {
      wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`)
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
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
      id: 'level-1', num: '01', type: 'LIVE COURSE',
      title: 'Use AI to 10x Your Impact',
      tagline: "You use AI chatbots to draft, summarize, and ask questions, but you haven't built anything that runs on its own.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build a Real Product with World-Class Design', sub: 'Create a new product in 90 minutes, without writing a line of code, using a design system that you love.', date: 'Tue, Aug 4', time: '8am or 2pm PT (11am or 5pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Automate Communication in Your Voice', sub: 'Connect your tools, teach AI how you write, build an email manager that runs on a schedule, and start building a custom automation for your own work.', date: 'Fri, Aug 7', time: '8am or 2pm PT (11am or 5pm ET)' },
        { title: 'Analyze Data and Design Presentations Instantly', sub: 'Go from a raw spreadsheet to clean insights and a polished, animated slide deck, no formulas or design tools required.', date: 'Tue, Aug 11', time: '8am or 2pm PT (11am or 5pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Launch Your Custom AI System + Demo Day', sub: 'Continue personalizing your AI system and show the cohort what you built.', date: 'Fri, Aug 14', time: '8am or 2pm PT (11am or 5pm ET)' },
      ],
      cohorts: [
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f517038a2ab05f3e118b05)', fillingFast: true },
        { month: 'JUL', day: '7', date: 'July 7 (Copilot Only Track)', label: 'July 7 (Copilot Only)', iso: '2026-07-07-copilot', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '9am PT / 12pm ET', friday: '9am PT / 12pm ET' }, cohortSessions: [{ date: 'Tue, Jul 7', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 10', time: '9am PT / 12pm ET' }, { date: 'Tue, Jul 14', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 17', time: '9am PT / 12pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a0cf65f27431b42c5131e4b)' },
        { month: 'JUL', day: '6', date: 'July 6', label: 'July 6', iso: '2026-07-06', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Mon, Jul 6', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 9', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'Mon, Jul 13', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 16', time: '8am or 2pm PT (11am or 5pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a20503acfe499ed72d285e9)' },
        { month: 'JUL', day: '21', date: 'July 21', label: 'July 21', iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '3pm PT / 6pm ET' }, cohortSessions: [{ date: 'Tue, Jul 21', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'Tue, Jul 28', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 31', time: '8am or 3pm PT (11am or 6pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231ba2455a49d4abda3c39)' },
        { month: 'AUG', day: '4', date: 'August 4', label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Tue, Aug 4', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 7', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'Tue, Aug 11', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 14', time: '8am or 2pm PT (11am or 5pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231e65e0ed35ab57e2820e)' },
        { month: 'AUG', day: '17', date: 'August 17', label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Aug 17', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 20', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Aug 24', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 27', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231fa5e0ed35ab57e28232)' },
      ],
      levelIndex: 0,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-1',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f517038a2ab05f3e118b05)',
    },
    {
      id: 'level-2', num: '02', type: 'BOOTCAMP',
      title: 'Build Complex Agentic Workflows',
      tagline: "You've tried AI coding tools, MCP connectors, or workflow builders, but you haven't built specialized agents for most work tasks.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build and Ship Your Automation Roadmap', sub: 'Map where your time goes, build an AI automation roadmap, and deploy it as an interactive dashboard.', date: 'Tue, Aug 4', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build a Cloud-Based Agentic Workflow and QA System', sub: 'Use n8n to design an agentic communication manager workflow that auto-responds to messages for you.', date: 'Fri, Aug 7', time: '12pm PT / 3pm ET' },
        { title: 'Build Custom Agentic Automations', sub: 'Collaborate with AI to create automations that pull from real data to help you work more effectively.', date: 'Tue, Aug 11', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Second Brain with AI + Demo Day', sub: 'Give your AI the domain knowledge it needs to run your automation well, and show the cohort what you built.', date: 'Fri, Aug 14', time: '12pm PT / 3pm ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '5pm PT / 8pm ET', thursday: '5pm PT / 8pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '5pm PT / 8pm ET' }, { date: 'Mon, Jun 15', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '5pm PT / 8pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52df1cf3c823ab47ecd16)', soldOut: true },
        { month: 'JUL', day: '6', date: 'July 6', label: 'July 6', iso: '2026-07-06', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '10am PT / 1pm ET', thursday: '10am PT / 1pm ET' }, cohortSessions: [{ date: 'Mon, Jul 6', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 9', time: '10am PT / 1pm ET' }, { date: 'Mon, Jul 13', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 16', time: '10am PT / 1pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a23213b455a49d4abda3c87)', fillingFast: true },
        { month: 'JUL', day: '21', date: 'July 21', label: 'July 21', iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '10am PT / 1pm ET', friday: '10am PT / 1pm ET' }, cohortSessions: [{ date: 'Tue, Jul 21', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '10am PT / 1pm ET' }, { date: 'Tue, Jul 28', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 31', time: '10am PT / 1pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a232210455a49d4abda3c91)' },
        { month: 'AUG', day: '4', date: 'August 4', label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '12pm PT / 3pm ET', friday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Tue, Aug 4', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 7', time: '12pm PT / 3pm ET' }, { date: 'Tue, Aug 11', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 14', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a23232e455a49d4abda3c9d)' },
        { month: 'AUG', day: '17', date: 'August 17', label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '2pm PT / 5pm ET', thursday: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Mon, Aug 17', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 20', time: '2pm PT / 5pm ET' }, { date: 'Mon, Aug 24', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 27', time: '2pm PT / 5pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a2324f5e0ed35ab57e28294)' },
      ],
      levelIndex: 1,
      price: '$999',
      reversed: true,
      learnMoreUrl: '/level-2',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a23213b455a49d4abda3c87)',
    },
    {
      id: 'level-3', num: '03', type: 'LIVE COURSE',
      title: 'Create Autonomous Agents',
      tagline: "You've built multiple AI agents, but they don't run autonomously.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build Your Agentic Operating System', sub: 'Set up your agent tool and create the foundational context files of your agentic operating system.', date: 'Mon, Aug 3', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Strengthen Your Agent with Skills, Tools, and Context', sub: 'Scope what your agent owns, expand context to cover your real work, and connect the tools it needs to do that work.', date: 'Thu, Aug 6', time: '12pm PT / 3pm ET' },
        { title: 'Test and Deploy Your Agent', sub: "Create a rubric and evals, wire an action logging system, and run tests to improve your agent until you're ready to deploy.", date: 'Mon, Aug 10', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Sub-Agents + Demo Day', sub: 'Get better, broader output by training your agent to spin up specialist sub-agents for research and other specific tasks.', date: 'Thu, Aug 13', time: '12pm PT / 3pm ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '4pm PT / 7pm ET' }, { date: 'Mon, Jun 15', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '4pm PT / 7pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)', soldOut: true },
        { month: 'AUG', day: '3', date: 'August 3', label: 'August 3', iso: '2026-08-03', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '12pm PT / 3pm ET', thursday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Mon, Aug 3', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 6', time: '12pm PT / 3pm ET' }, { date: 'Mon, Aug 10', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 13', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a2326fd455a49d4abda3d0c)' },
        { month: 'SEP', day: '15', date: 'September 15', label: 'September 15', iso: '2026-09-15', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, cohortSessions: [{ date: 'Tue, Sep 15', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 18', time: '8am PT / 11am ET' }, { date: 'Tue, Sep 22', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 25', time: '8am PT / 11am ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a0e389d129db847ae4d17f9)' },
        { month: 'OCT', day: '6', date: 'October 6', label: 'October 6', iso: '2026-10-06', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, cohortSessions: [{ date: 'Tue, Oct 6', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Oct 9', time: '8am PT / 11am ET' }, { date: 'Tue, Oct 13', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Oct 16', time: '8am PT / 11am ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a511c7f04bd393e57d039f7)' },
      ],
      levelIndex: 2,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-3',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a23265ae0ed35ab57e282b5)',
    },
    {
      id: 'level-4', num: '04', type: 'BOOTCAMP',
      title: 'Build Your Agent Workforce',
      tagline: "You have multiple autonomous agents running, but they don't operate as a unified system.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Scope Your Agent Team', sub: "Map your workflows, decide what belongs in each agent's domain, and architect a multi-agent system.", date: 'Tue, Oct 20', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Orchestrated Pipeline', sub: 'Wire your first real multi-agent system, connecting multiple specialized agents, coordinated by an orchestrator that decomposes tasks and routes work.', date: 'Fri, Oct 23', time: '8am PT / 11am ET' },
        { title: 'Wire Your Agents Together + Add Security', sub: 'Shift from task-based to goal-based agent design. Wire agent-to-agent communication, define what each agent can access, and update your team dashboard.', date: 'Tue, Oct 27', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Ship Your Agent Workforce + Demo Day', sub: 'Finalize your agent team, document how it works, define failure modes and fallbacks, and demo what you built.', date: 'Fri, Oct 30', time: '8am PT / 11am ET' },
      ],
      cohorts: [
        { month: 'OCT', day: '20', date: 'October 20', label: 'October 20', iso: '2026-10-20', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, cohortSessions: [{ date: 'Tue, Oct 20', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Oct 23', time: '8am PT / 11am ET' }, { date: 'Tue, Oct 27', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Oct 30', time: '8am PT / 11am ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69e5259f1ac8f0ca2eba2107)' },
      ],
      levelIndex: 3,
      price: '$999',
      reversed: true,
      learnMoreUrl: '/level-4',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69e5259f1ac8f0ca2eba2107)',
    },
    {
      id: 'level-5', num: '05', type: 'LIVE COURSE',
      title: 'Design Your AI Orchestration Layer',
      tagline: "You've built and shipped AI systems that run in production, but they don't proactively iterate and pursue a goal.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build Your Manager Agent', sub: "Design and build one agent that coordinates your entire agent team, routes work to the right agent, monitors what's running, and escalates edge cases.", date: 'Tue, Sep 1', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Make Your Agents Proactive', sub: 'Your agents identify their own sub-goals, take initiative, and adapt their approach based on feedback.', date: 'Fri, Sep 4', time: '12pm PT / 3pm ET' },
        { title: 'Build a Self-Improving System', sub: 'Your manager agent watches performance, identifies weak agents, and triggers improvements.', date: 'Tue, Sep 8', time: '12pm PT / 3pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Graduate to Full Abstraction + Demo Day', sub: "Document your complete agentic OS, define what you're still responsible for, and demo the whole system from manager agent down to individual workers.", date: 'Fri, Sep 11', time: '12pm PT / 3pm ET' },
      ],
      cohorts: [
        { month: 'SEP', day: '1', date: 'September 1', label: 'September 1', iso: '2026-09-01', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '12pm PT / 3pm ET', friday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Tue, Sep 1', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 4', time: '12pm PT / 3pm ET' }, { date: 'Tue, Sep 8', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 11', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69e525cefe0055e715a6a025)' },
      ],
      levelIndex: 4,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-5',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69e525cefe0055e715a6a025)',
    },
  ]

  const faqs = [
    {
      q: 'Why this program instead of hiring an AI lead?',
      a: 'Hiring one AI lead concentrates the capability in one person. AI Builder spreads it across your team and surfaces 3–4 internal champions who carry it forward, all for a fraction of the cost of an AI Lead role. Most teams find this is the better first move, and the right complement to whatever AI hires you make later.',
    },
    {
      q: 'How does this compare to a one-off workshop or async course?',
      a: 'Workshops are forgotten by Monday. Async courses see 5–15% completion. AI Builder runs as a live cohort, so your team builds working systems in the sessions, with accountability and an instructor unblocking them in real time. We see 85% completion and shipped output, not slide decks.',
    },
    {
      q: 'Will our security and compliance team approve this?',
      a: 'The program is designed with enterprise security in mind. The curriculum is tool-agnostic, so your team can build inside whatever tools your security team has approved (Claude Enterprise, ChatGPT Enterprise, Copilot, on-prem options). For HIPAA-aware orgs and other regulated environments, we offer a security consultation for larger implementations and can scope engagements around your specific constraints.',
    },
    {
      q: 'What does it cost?',
      a: 'Standard per-seat pricing on Levels 1–3 starts at $2,000, with volume discounts that scale with seat count, and portfolio or partnership discounts where applicable. Most teams hit a payback period within their first cohort. We give you a clear, customized quote on the consult.',
    },
    {
      q: 'What’s the time commitment per employee?',
      a: 'Each level is 2 weeks: 4 core 90-minute live sessions plus optional build workshops. About 3 hours a week of live instruction. Sessions are recorded for anyone who can’t attend live. Most teams place their employees across Levels 1–3, run over 6 weeks total.',
    },
    {
      q: 'How fast can we start?',
      a: 'New cohorts run every 2 weeks. Most teams kick off within days of the consult. Your champions can ship their first automation in week one of Level 1.',
    },
    {
      q: 'How do you handle scheduling conflicts across our team?',
      a: 'Cohorts run on staggered schedules with morning and afternoon slots. Team members can switch between cohorts as their schedules change, and all sessions are recorded so anyone can catch up. Your dedicated AM handles scheduling logistics so you don’t have to.',
    },
    {
      q: 'What admin tools do team leaders get?',
      a: 'Dedicated dashboard for team management: enrollment, cohort assignment, progress tracking, and engagement reporting. Your AM also generates outcome reports for leadership review.',
    },
    {
      q: 'How do you place each team member at the right level?',
      a: 'On the consult, we run a quick capability assessment with you and your team leads. Most non-technical employees start at Level 1; team members already running their own automations often jump in at Level 2 or 3. Levels 4–5 are reserved for AI specialists who want to build production multi-agent systems.',
    },
    {
      q: 'What if AI tools change after our team takes the program?',
      a: 'Our curriculum updates continuously. Every seat includes 1 year of access to subsequent cohorts, so your team always learns at the frontier, and can retake levels with the latest tools and techniques.',
    },
    {
      q: 'What do our employees walk away with?',
      a: 'Working tools and automations they use at work, not just notes. Each level produces 4+ shipped builds per employee: prompt systems, research agents, content automations, autonomous agents, or full agentic operating systems depending on the level. Plus a verified Leland certificate they can post on LinkedIn.',
    },
    {
      q: 'Is this for engineering teams, non-technical teams, or both?',
      a: 'Both, but especially non-technical teams. Most engineering orgs are already progressing on AI through Copilot, Cursor, and direct API work. Where companies fall behind is non-technical teams — marketing, ops, finance, sales, HR, CS. AI Builder is designed to coordinate that upskilling so it doesn’t stay sporadic.',
    },
  ]

  const toolPills = [
    { name: 'ChatGPT', logo: 'new-ChatGPT-icon-white-png-large-size.png', size: 42, noInvert: true },
    { name: 'Claude', logo: 'claude-ai.png' },
    { name: 'Gemini', logo: 'gemini-ai.png' },
    { name: 'Perplexity', logo: 'perlexity.png', size: 72, revealSize: 40 },
    { name: 'Cursor', logo: 'cursor-1.png', size: 42 },
    { name: 'n8n', logo: 'n8n.png', size: 56, revealSize: 24 },
  ]
  const skillPills = ['Agent building', 'Workflow automation', 'Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Report generation', 'Client communication', 'Go-to-market systems', 'Content creation', 'Financial modeling']

  const trackItems = [
    { num: '01', tier: 'core', name: <>Use AI to 10x<br/>Your Impact</>, tagline: "Create AI tools and artifacts that amplify your impact.", href: '#level-1', learnMoreUrl: '/level-1', thumb: 'thumbnail-level1.png', cohortDate: 'August 4, 2026', fillingFast: true, featured: true },
    { num: '02', tier: 'core', name: <>Build Complex<br/>Agentic Workflows</>, tagline: 'Ship autonomous agents that handle real tasks end-to-end.', href: '#level-2', learnMoreUrl: '/level-2', thumb: 'thumbnail-level2.png', cohortDate: 'August 4, 2026', pastSoldOut: ['June 8'], secondary: true },
    { num: '03', tier: 'core', name: <>Create Autonomous<br/>Agents</>, tagline: 'Build AI automations that operate as an autonomous system.', href: '#level-3', learnMoreUrl: '/level-3', thumb: 'thumbnail-level3.png', cohortDate: 'August 3, 2026', pastSoldOut: ['June 8'] },
    { num: '04', tier: 'advanced', name: <>Build Your Agent<br/>Workforce</>, tagline: 'Orchestrate multiple agents that communicate and collaborate.', href: '#level-4', learnMoreUrl: '/level-4', thumb: 'thumbnail-level4.png', cohortDate: 'October 20, 2026' },
    { num: '05', tier: 'advanced', name: <>Design Your AI<br/>Orchestration Layer</>, tagline: 'Build production AI systems that proactively iterate toward goals.', href: '#level-5', learnMoreUrl: '/level-5', thumb: 'thumbnail-level5.png', cohortDate: 'September 1, 2026' },
  ]

  return (
    <>
      {/* ====== 1. Navigation (shared leland.ai nav) ====== */}
      <Nav variant="transparent" mobileLabel="For Teams" />

      {/* ====== 2. Hero ====== */}
      <section className="hero hero-teams" id="hero" ref={heroRef}>
        <video
          className="rb-hero-video"
          src={`${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="container">
          <div className="hero-teams-grid">
            <div className="hero-teams-left">
              <h1 className="hero-stagger hero-stagger-1">Your team, trained to <br className="mobile-br" /><TextMorph className="rotating-text hero-morph-desktop">{heroPhrase}</TextMorph><span className="hero-morph-mobile">build real systems</span></h1>

              <p className="hero-sub hero-stagger hero-stagger-2">Engineering is racing ahead on AI. Everyone else is falling behind. AI Builder is the cohort program that closes the gap, with a clean rollout your security team will sign off on.</p>

              <div className="hero-ctas hero-stagger hero-stagger-3">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  onClick={() => posthog.capture('app--sales_cta_click', { source: 'hero', page: 'program-for-teams' })}
                >
                  Talk to our team
                </a>
                <BorderBeam size="sm" colorVariant="colorful" theme="dark" strength={1} borderRadius={999}>
                  <a href="#how-it-works" className="lai-cta-primary lai-cta-beam">
                    See how it works
                  </a>
                </BorderBeam>
              </div>
            </div>

            <aside className="hero-brief hero-stagger hero-stagger-4" aria-label="Program Brief">
              <p className="hero-brief-label" />
              <div className="hero-brief-rows">
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Cohort cadence</span>
                  <span className="hero-brief-val">Every <span className="accent">2 weeks</span></span>
                </div>
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Seat range</span>
                  <span className="hero-brief-val">5 – 50,000</span>
                </div>
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Time to first build</span>
                  <span className="hero-brief-val">Week <span className="accent">1</span></span>
                </div>
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Levels available</span>
                  <span className="hero-brief-val">1 – 5 + custom</span>
                </div>
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Kickoff timeline</span>
                  <span className="hero-brief-val">≤ 7 days post-call</span>
                </div>
                <div className="hero-brief-row">
                  <span className="hero-brief-key">Security review</span>
                  <span className="hero-brief-val">Included, 100+ seats</span>
                </div>
              </div>
              <div className="hero-brief-foot">
                <b>› Builders from:</b> AppFolio · Datavant · Miro · Verizon · McKinsey · McDonald's
              </div>
            </aside>
          </div>

          <div className="track-cards-section track-cards-v2" id="courses">
          </div>

        </div>
      </section>


      <section className="b2b-section" id="shift">
        <div className="container">
          <div className="b2b-section-head">
            <span className="b2b-eyebrow">› The Shift</span>
            <h2 className="b2b-section-headline">AI is changing how work gets done across every function.</h2>
          </div>
          <div className="shift-callout">
            <div className="shift-stat">
              <span className="num">4</span><span className="post">×</span><span className="floor">+</span>
            </div>
            <div className="shift-text">
              <div className="shift-eyebrow">› Productivity growth in AI-exposed industries</div>
              <p>Engineering went first. Now every other function is seeing the same gains.</p>
              <p className="shift-kicker">Employees building with agents are pulling far ahead.</p>
              <div className="shift-source">PwC AI Jobs Barometer · 2025 (industry-level floor)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 3. "Why This Course" (AgentNetwork) ====== */}
      <section className="save-time-section" id="about">
        <div className="container">
          <div className="save-time-split">
            <div className="save-time-left">
              <AgentNetwork />
            </div>
            <div className="save-time-right">
              <h2 className="save-time-headline">Every employee, directing their own AI agent team</h2>
              <p className="save-time-sub">Your people stop doing every task themselves. They build specialized agents that triage inboxes, run research, prep decks, ship outreach, and more.</p>
              <p className="save-time-cite">One VP Marketing built a system that <strong>automated the work of a 2-year full-time role.</strong></p>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary save-time-explore-cta" onClick={() => posthog.capture('app--sales_cta_click', { source: 'save-time' })}>Talk to our team</a>
            </div>
          </div>
        </div>
      </section>

      <section className="b2b-section" id="problem">
        <div className="container">
          <div className="b2b-section-head">
            <span className="b2b-eyebrow">› The Problem</span>
            <h2 className="b2b-section-headline">Most teams know AI is important. Driving impactful adoption is slower than they want.</h2>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <span className="problem-card-num">› Reason 01</span>
              <h3 className="problem-card-title">The field moves faster than employees can keep up</h3>
              <p className="problem-card-body">New models monthly. New capabilities weekly. Without protected time and structure, the gap widens by default.</p>
            </div>
            <div className="problem-card">
              <span className="problem-card-num">› Reason 02</span>
              <h3 className="problem-card-title">Adoption requires behavior change</h3>
              <p className="problem-card-body">Using AI well isn't learning a new tool. It's changing how people work, new habits, new defaults, new mental models.</p>
            </div>
            <div className="problem-card">
              <span className="problem-card-num">› Reason 03</span>
              <h3 className="problem-card-title">Most training is too theoretical to translate</h3>
              <p className="problem-card-body">Slides on what AI can do. Webinars on prompt engineering. People come out aware, not able to ship.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="b2b-section" id="customers">
        <div className="container">
          <div className="b2b-section-head">
            <span className="b2b-eyebrow">› Team Outcomes</span>
            <h2 className="b2b-section-headline">What teams ship after the program.</h2>
            <p className="b2b-section-sub">Real systems shipped by real teams during the program. A few of the outcomes leaders have reported back.</p>
          </div>
          <div className="customer-wins">
            <div className="customer-win-card">
              <span className="customer-win-tag">Marketing</span>
              <p className="customer-win-quote">Our VP of Marketing built a system through the program that automated work we'd previously scoped as a 2-year full-time hire. The whole team now thinks differently about what's possible.</p>
              <div className="customer-win-meta">
                <span className="customer-win-who">Leadership · High-growth health tech</span>
                <span className="customer-win-co">Whole-team enablement, Levels 1–3</span>
              </div>
            </div>
            <div className="customer-win-card">
              <span className="customer-win-tag">Sales / GTM</span>
              <p className="customer-win-quote">Sales pipeline generation is now a multi-agent system, not a person. Reps spend their time on conversations, agents handle research, prep, and CRM hygiene end-to-end.</p>
              <div className="customer-win-meta">
                <span className="customer-win-who">Revenue org · Enterprise software</span>
                <span className="customer-win-co">Champions track, Levels 1–4</span>
              </div>
            </div>
            <div className="customer-win-card">
              <span className="customer-win-tag">Operations</span>
              <p className="customer-win-quote">We thought we needed a full-time AI lead. Instead the program surfaced 4 internal champions across ops, finance, and CS who are now driving every initiative.</p>
              <div className="customer-win-meta">
                <span className="customer-win-who">COO · Mid-market services</span>
                <span className="customer-win-co">Functional cohort, Levels 1–3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="b2b-section" id="how-it-works">
        <div className="container">
          <div className="b2b-section-head">
            <span className="b2b-eyebrow">› How It Works</span>
            <h2 className="b2b-section-headline">A clean rollout your leadership can sign off on.</h2>
          </div>
          <div className="engagement-flow">
            <div className="engagement-step">
              <span className="engagement-step-num">01 · Discovery</span>
              <h3 className="engagement-step-title">Map your team and goals</h3>
              <p className="engagement-step-desc">30-min working session with your AM. Team maturity, priority workflows, security constraints.</p>
              <span className="engagement-step-meta">Day 0</span>
            </div>
            <div className="engagement-step">
              <span className="engagement-step-num">02 · Placement</span>
              <h3 className="engagement-step-title">Place each person at the right level</h3>
              <p className="engagement-step-desc">Quick capability assessment. Most start at Level 1; power users at 2 or 3; specialists at 4–5.</p>
              <span className="engagement-step-meta">Week 1</span>
            </div>
            <div className="engagement-step">
              <span className="engagement-step-num">03 · Cohorts</span>
              <h3 className="engagement-step-title">Run live cohorts, ship real work</h3>
              <p className="engagement-step-desc">4 core 90-min sessions + optional build workshops per level. Cohorts every 2 weeks; members can switch.</p>
              <span className="engagement-step-meta">Weeks 1–10</span>
            </div>
            <div className="engagement-step">
              <span className="engagement-step-num">04 · Reporting</span>
              <h3 className="engagement-step-title">Measure and report impact</h3>
              <p className="engagement-step-desc">Admin dashboard tracks enrollment, completion, shipped builds. Outcome reports for leadership.</p>
              <span className="engagement-step-meta">Ongoing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Featured Pull-Quote — visual standout between How It Works and Solution ====== */}
      <section className="feature-quote-section" aria-label="Featured outcome">
        <div className="feature-quote">
          <div className="feature-quote-mark" aria-hidden="true">"</div>
          <div>
            <blockquote className="feature-quote-body">
              Our VP of Marketing built a system through the program that <strong>automated work we'd previously scoped as a 2-year full-time hire.</strong> The whole team now thinks differently about what's possible.
            </blockquote>
            <div className="feature-quote-meta">
              <span className="feature-quote-who">Leadership · High-growth health tech</span>
              <span className="feature-quote-tag">Levels 1–3 · Whole-team enablement</span>
            </div>
          </div>
        </div>
      </section>

      <TeamPricingSection id="pricing" eyebrow="› The Solution" />


      {/* ====== Use Cases by Role ====== */}
      <RoleUseCases />

      {/* Problem section moved up above Customer Wins */}

      <section className="b2b-section" id="security">
        <div className="container">
          <div className="b2b-section-head">
            <span className="b2b-eyebrow">› Security &amp; Compliance</span>
            <h2 className="b2b-section-headline">Your security team will sign off.</h2>
          </div>
          <div className="security-grid">
            <ul className="security-points">
              <li className="security-point">
                <span className="security-point-icon" aria-hidden="true">⚙</span>
                <div className="security-point-text">
                  <span className="security-point-title">Works inside your approved stack</span>
                  <span className="security-point-desc">Claude, ChatGPT Enterprise, Copilot, Gemini, n8n, on-prem. No new vendor approval needed.</span>
                </div>
              </li>
              <li className="security-point">
                <span className="security-point-icon" aria-hidden="true">🛡</span>
                <div className="security-point-text">
                  <span className="security-point-title">No live data connection required</span>
                  <span className="security-point-desc">We teach effective AI workflows that don't expose live company data, real outcomes inside any IT policy.</span>
                </div>
              </li>
              <li className="security-point">
                <span className="security-point-icon" aria-hidden="true">＋</span>
                <div className="security-point-text">
                  <span className="security-point-title">HIPAA-aware engagements supported</span>
                  <span className="security-point-desc">Security consultation and scoping for health, financial services, and regulated industries.</span>
                </div>
              </li>
              <li className="security-point">
                <span className="security-point-icon" aria-hidden="true">⤳</span>
                <div className="security-point-text">
                  <span className="security-point-title">Dedicated security review available</span>
                  <span className="security-point-desc">For larger rollouts, your AM coordinates a working session with your security team.</span>
                </div>
              </li>
            </ul>
            <div className="security-card">
              <p className="security-card-eyebrow">› Reality check</p>
              <h3 className="security-card-title">"Our security team is conservative."</h3>
              <p className="security-card-body">We hear this from almost every buyer, and we've never had it stop a rollout. Your team ships real builds inside the strictest IT policy. Champions widen the policy from inside, evidence in hand.</p>
              <div className="security-card-tags">
                <span className="security-card-tag">Tool-agnostic</span>
                <span className="security-card-tag">No data export</span>
                <span className="security-card-tag">HIPAA-aware</span>
                <span className="security-card-tag">SOC 2-ready</span>
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

      {/* ====== Pre-Footer CTA ====== */}
      <section className="rb-prefooter-video">
        <video
          className="rb-prefooter-bg"
          src={`${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="rb-prefooter-fade" />
        <div className="rb-prefooter-content">
          <img
            className="rb-prefooter-logo"
            src={`${import.meta.env.BASE_URL}assets/logos/aibp-light.png`}
            alt="AI Builder Program"
          />
          <h2 className="rb-prefooter-heading">Build your team into AI Builders.</h2>
          <p className="rb-prefooter-sub" style={{ maxWidth: 720, margin: '12px auto 24px', textAlign: 'center', color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', lineHeight: 1.5 }}>Six weeks of cohort-based building. Custom systems shipped in your team's actual workflows. Adoption that compounds long after the program ends.</p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
            onClick={() => posthog.capture('app--sales_cta_click', { source: 'prefooter', page: 'program-for-teams' })}
          >
            Talk to our team
          </a>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <img src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Icon/Icon-White.svg`} alt="Leland" className="footer-logo" />
            <div className="footer-bottom">
              <div className="footer-social">
                <a href="https://www.linkedin.com/school/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.instagram.com/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
              <p className="footer-copyright">Copyright 2026 Leland Inc.<br />All rights reserved.</p>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4 className="footer-col-heading">Platform</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com" className="footer-col-link">Home</a></li>
                <li><a href="https://www.joinleland.com/events" className="footer-col-link">Free Events</a></li>
                <li><a href="https://www.joinleland.com/bootcamps" className="footer-col-link">Bootcamps</a></li>
                <li><a href="https://www.joinleland.com/plus" className="footer-col-link">Leland+</a></li>
                <li><a href="https://www.joinleland.com/become-an-expert" className="footer-col-link">Become a coach</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-heading">Popular</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/search/school/mba" className="footer-col-link">MBA</a></li>
                <li><a href="https://www.joinleland.com/search/career/build-with-ai" className="footer-col-link">AI Productivity</a></li>
                <li><a href="https://www.joinleland.com/search/career/management-consulting" className="footer-col-link">Management Consulting</a></li>
                <li><a href="https://www.joinleland.com/search/test/gre" className="footer-col-link">GRE</a></li>
                <li><a href="https://www.joinleland.com/search/career/private-equity" className="footer-col-link">Private Equity</a></li>
                <li><a href="https://www.joinleland.com/search/career/product-management" className="footer-col-link">Product Management</a></li>
                <li><a href="https://www.joinleland.com/search/career/career-development" className="footer-col-link">Career Development</a></li>
                <li><a href="https://www.joinleland.com/search/school/college" className="footer-col-link">College</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-heading">Partnerships</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.leland.ai" className="footer-col-link">Partner with Leland</a></li>
                <li><a href="https://partner.joinleland.com/universities" className="footer-col-link">For Universities</a></li>
                <li><a href="https://www.leland.ai/services" className="footer-col-link">AI Transformation</a></li>
                <li><a href="https://partner.joinleland.com/outplacement" className="footer-col-link">Outplacement</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-heading">Company</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/reviews" className="footer-col-link">Reviews</a></li>
                <li><a href="https://www.joinleland.com/careers" className="footer-col-link">Careers</a></li>
                <li><a href="https://www.joinleland.com/library" className="footer-col-link">Library</a></li>
              </ul>
              <h4 className="footer-col-heading footer-col-heading-sub">Resources</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/support" className="footer-col-link">Support</a></li>
                <li><a href="https://www.joinleland.com/legal" className="footer-col-link">Legal</a></li>
                <li><a href="https://www.joinleland.com/privacy" className="footer-col-link">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </>
  )
}
