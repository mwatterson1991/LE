import React, { useState, useEffect, useRef } from 'react'
import { TextMorph } from 'torph/react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import Marquee from 'react-fast-marquee'
import LPPopup from '../components/LPPopup'
import GetThisExpensed from '../components/GetThisExpensed'
import CohortPicker from '../components/CohortPicker'
import { COURSE_COHORTS, courseData } from './courseData'
import './home-rebrand.css'

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
        href="#course-accordion"
        className="cd-link"
        onClick={(e) => {
          e.preventDefault()
          const el = document.querySelector('#course-accordion')
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

function TBoardStarRow({ count }) {
  return (
    <div className="review-card-stars">
      {[...Array(count)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="var(--gray-dark)">
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="tcard tcard-review">
      <div className="review-card-header">
        <img src={review.avatar} alt={review.name} className="review-card-avatar" />
        <div className="review-card-info">
          <span className="review-card-name">{review.name}</span>
          <span className="review-card-subtitle">{review.subtitle}</span>
        </div>
      </div>
      <div className="review-card-meta">
        <TBoardStarRow count={review.stars} />
      </div>
      <p className="review-card-text">&ldquo;{review.text}&rdquo;</p>
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
    avatar: `${import.meta.env.BASE_URL}assets/profile-photos/pic-${String((i % 15) + 1).padStart(2, '0')}.png`,
  }))

  // Distribute into 4 columns: cols 0,2 get 5 cards; cols 1,3 get 4 cards
  const columns = [[], [], [], []]
  mapped.forEach((review, i) => {
    columns[i % 4].push(review)
  })

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-container">
        <div className="testimonials-header">
          <p className="testimonials-label">
            <span className="testimonials-dot" />
            Testimonials
          </p>
          <h2 className="testimonials-heading">Don&rsquo;t just take our word for it.</h2>
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
      badgeWhite: true,
      crossed: '$2,500 value',
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
      name: 'AI Builder Core',
      sub: 'Levels 1–3',
      meta: 'The core program for all knowledge workers',
      badge: 'Most Popular',
      featured: true,
      crossed: '$7,500 value',
      price: '$1,999',
      monthly: '$514/mo with payment plan',
      cta: 'Enroll',
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
        ['12', 'shipped builds'],
        ['3', 'certifications'],
      ],
    },
    {
      key: 'advanced',
      name: 'AI Builder Advanced',
      sub: 'Levels 1–5',
      meta: 'The program for sophisticated builders',
      badge: 'Best Value',
      badgeWhite: true,
      crossed: '$12,500 value',
      price: '$2,999',
      monthly: '$772/mo with payment plan',
      cta: 'Enroll',
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
                    Learn more
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        <div className="value-stack-included">
          <span className="value-stack-included-eyebrow">Every tier also includes</span>
          <div className="value-stack-included-grid">
            {[
              ['1-Year Access Guarantee', 'Recordings and live sessions for every AI Builder cohort over the next 12 months.', 'scheduling.svg'],
              ['Best Course Guarantee', 'Money-back if you find a better AI course anywhere.', 'guarantee.svg'],
              ['Weekly Build Workshops', 'Optional live workshops with functional experts in marketing, sales, finance, ops, and more.', 'ideation.svg'],
              ['Unlimited Retakes', 'Take any cohort again for a full year, always with the latest curriculum.', 'retake.svg'],
              ['Private AI Community', 'Daily AI news, peer builds, and live perspectives from current AI Builders.', 'community.svg'],
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
        <div className="img-reveal-content">
          <h2 className="img-reveal-heading">Be the AI expert your team relies on.</h2>
          <p className="img-reveal-desc">
            Build skills, agents, and systems your colleagues notice. Upon completion of the course, you'll have a certificate (and real AI outcomes) you can share on LinkedIn.
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

  const imageUrl = `${import.meta.env.BASE_URL}assets/images/quote-bg.png`

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
        <div className="img-reveal-content">
          <h2 className="img-reveal-heading">Work smarter with reusable skills and workflows</h2>
          <p className="img-reveal-desc">
            Advance beyond typing questions into ChatGPT by learning to build workflows, automate tasks, and create reusable skills that make AI work the way you want it to.
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
            <h2 className="why-reveal-heading">Become an AI Builder in 6-10 weeks.</h2>
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
            <p className="why-reveal-desc">Updated weekly, so you're always learning at the frontier of AI. We'll teach you best practices for AI in:</p>
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

export default function HomePageRebrand() {
  return <HomePageRebrandInner />
}

function HomePageRebrandInner() {
  const heroRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [openAccordion, setOpenAccordion] = useState(0)
  const [activeSection, setActiveSection] = useState(null)
  const [scarcityCount, setScarcityCount] = useState(() => getScarcityCount(442, 532, 0))
  const [advancedScarcityCount, setAdvancedScarcityCount] = useState(() => getScarcityCount(75, 110, 1))
  const heroPhrases = ['10x your impact', 'future-proof your work', 'scale your business', 'accelerate your career', 'automate manual work']
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
    const handleScroll = () => setScrolled(window.scrollY > 200)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
      id: 'course-1', num: '01', type: 'LIVE COURSE',
      title: 'Use AI to 10x Your Impact',
      tagline: "You use AI chatbots to draft, summarize, and ask questions, but you haven't built anything that runs on its own.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build a Real Product with World-Class Design', sub: 'Create a new product in 90 minutes, without writing a line of code, using a design system that you love.', date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Automate Communication in Your Voice', sub: 'Connect your tools, teach AI how you write, build an email manager that runs on a schedule, and start building a custom automation for your own work.', date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Analyze Data and Design Presentations Instantly', sub: 'Go from a raw spreadsheet to clean insights and a polished, animated slide deck, no formulas or design tools required.', date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Launch Your Custom AI System + Demo Day', sub: 'Continue personalizing your AI system and show the cohort what you built.', date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' },
      ],
      cohorts: [
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f517038a2ab05f3e118b05)', fillingFast: true },
        { month: 'JUN', day: '22', date: 'June 22 (Copilot Only Track)', label: 'June 22 (Copilot Only)', iso: '2026-06-22-copilot', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '9am PT / 12pm ET', thursday: '9am PT / 12pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '9am PT / 12pm ET' }, { date: 'Mon, Jun 29', time: '9am PT / 12pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '9am PT / 12pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a0cf65f27431b42c5131e4b)' },
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
      id: 'course-2', num: '02', type: 'BOOTCAMP',
      title: 'Build Complex Agentic Workflows',
      tagline: "You've tried AI coding tools, MCP connectors, or workflow builders, but you haven't built specialized agents for most work tasks.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build and Ship Your Automation Roadmap', sub: 'Map where your time goes, build an AI automation roadmap, and deploy it as an interactive dashboard.', date: 'Mon, Jul 6', time: '10am PT / 1pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build a Cloud-Based Agentic Workflow and QA System', sub: 'Use n8n to design an agentic communication manager workflow that auto-responds to messages for you.', date: 'Thu, Jul 9', time: '10am PT / 1pm ET' },
        { title: 'Build Custom Agentic Automations', sub: 'Collaborate with AI to create automations that pull from real data to help you work more effectively.', date: 'Mon, Jul 13', time: '10am PT / 1pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Second Brain with AI + Demo Day', sub: 'Give your AI the domain knowledge it needs to run your automation well, and show the cohort what you built.', date: 'Thu, Jul 16', time: '10am PT / 1pm ET' },
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
      id: 'course-3', num: '03', type: 'LIVE COURSE',
      title: 'Create Autonomous Agents',
      tagline: "You've built multiple AI agents, but they don't run autonomously.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Build Your Agentic Operating System', sub: 'Set up your agent tool and create the foundational context files of your agentic operating system.', date: 'Tue, Jul 7', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Strengthen Your Agent with Skills, Tools, and Context', sub: 'Scope what your agent owns, expand context to cover your real work, and connect the tools it needs to do that work.', date: 'Fri, Jul 10', time: '8am PT / 11am ET' },
        { title: 'Test and Deploy Your Agent', sub: "Create a rubric and evals, wire an action logging system, and run tests to improve your agent until you're ready to deploy.", date: 'Tue, Jul 14', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Sub-Agents + Demo Day', sub: 'Get better, broader output by training your agent to spin up specialist sub-agents for research and other specific tasks.', date: 'Fri, Jul 17', time: '8am PT / 11am ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '4pm PT / 7pm ET' }, { date: 'Mon, Jun 15', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '4pm PT / 7pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)', soldOut: true },
        { month: 'JUL', day: '7', date: 'July 7', label: 'July 7', iso: '2026-07-07', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, cohortSessions: [{ date: 'Tue, Jul 7', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 10', time: '8am PT / 11am ET' }, { date: 'Tue, Jul 14', time: '8am PT / 11am ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 17', time: '8am PT / 11am ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a23265ae0ed35ab57e282b5)', fillingFast: true },
        { month: 'AUG', day: '3', date: 'August 3', label: 'August 3', iso: '2026-08-03', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '12pm PT / 3pm ET', thursday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Mon, Aug 3', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 6', time: '12pm PT / 3pm ET' }, { date: 'Mon, Aug 10', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 13', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a2326fd455a49d4abda3d0c)' },
      ],
      levelIndex: 2,
      price: '$999',
      reversed: false,
      learnMoreUrl: '/level-3',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a23265ae0ed35ab57e282b5)',
    },
    {
      id: 'course-4', num: '04', type: 'BOOTCAMP',
      title: 'Build Your Agent Workforce',
      tagline: "You have multiple autonomous agents running, but they don't operate as a unified system.",
      tags: ['2 Weeks', '4 Core Sessions', '+ Optional Build Workshops'],
      sessions: [
        { title: 'Scope Your Agent Team', sub: "Map your workflows, decide what belongs in each agent's domain, and architect a multi-agent system.", date: 'Tue, Jul 28', time: '2pm PT / 5pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Orchestrated Pipeline', sub: 'Wire your first real multi-agent system, connecting multiple specialized agents, coordinated by an orchestrator that decomposes tasks and routes work.', date: 'Fri, Jul 31', time: '2pm PT / 5pm ET' },
        { title: 'Wire Your Agents Together + Add Security', sub: 'Shift from task-based to goal-based agent design. Wire agent-to-agent communication, define what each agent can access, and update your team dashboard.', date: 'Tue, Aug 4', time: '2pm PT / 5pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Ship Your Agent Workforce + Demo Day', sub: 'Finalize your agent team, document how it works, define failure modes and fallbacks, and demo what you built.', date: 'Fri, Aug 7', time: '2pm PT / 5pm ET' },
      ],
      cohorts: [
        { month: 'JUL', day: '28', date: 'July 28', label: 'July 28', iso: '2026-07-28', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '2pm PT / 5pm ET', friday: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Tue, Jul 28', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 31', time: '2pm PT / 5pm ET' }, { date: 'Tue, Aug 4', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 7', time: '2pm PT / 5pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)' },
      ],
      levelIndex: 3,
      price: '$999',
      reversed: true,
      learnMoreUrl: '/level-4',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)',
    },
    {
      id: 'course-5', num: '05', type: 'LIVE COURSE',
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
    { name: 'ChatGPT', logo: 'new-ChatGPT-icon-white-png-large-size.png', size: 42, noInvert: true },
    { name: 'Claude', logo: 'claude-ai.png' },
    { name: 'Gemini', logo: 'gemini-ai.png' },
    { name: 'Perplexity', logo: 'perlexity.png', size: 72, revealSize: 40 },
    { name: 'Cursor', logo: 'cursor-1.png', size: 42 },
    { name: 'n8n', logo: 'n8n.png', size: 56, revealSize: 24 },
  ]
  const skillPills = ['Agent building', 'Workflow automation', 'Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Report generation', 'Client communication', 'Go-to-market systems', 'Content creation', 'Financial modeling']

  const trackItems = [
    { num: '01', tier: 'core', name: <>Use AI to 10x<br/>Your Impact</>, tagline: "Create AI tools and artifacts that amplify your impact.", href: '#course-1', learnMoreUrl: '/level-1', thumb: 'thumbnail-level1.png', cohortDate: 'June 22, 2026', fillingFast: true, featured: true },
    { num: '02', tier: 'core', name: <>Build Complex<br/>Agentic Workflows</>, tagline: 'Ship autonomous agents that handle real tasks end-to-end.', href: '#course-2', learnMoreUrl: '/level-2', thumb: 'thumbnail-level2.png', cohortDate: 'July 6, 2026', pastSoldOut: ['June 8'], secondary: true },
    { num: '03', tier: 'core', name: <>Create Autonomous<br/>Agents</>, tagline: 'Build AI automations that operate as an autonomous system.', href: '#course-3', learnMoreUrl: '/level-3', thumb: 'thumbnail-level3.png', cohortDate: 'July 7, 2026', pastSoldOut: ['June 8'] },
    { num: '04', tier: 'advanced', name: <>Build Your Agent<br/>Workforce</>, tagline: 'Orchestrate multiple agents that communicate and collaborate.', href: '#course-4', learnMoreUrl: '/level-4', thumb: 'thumbnail-level4.png', cohortDate: 'July 28, 2026' },
    { num: '05', tier: 'advanced', name: <>Design Your AI<br/>Orchestration Layer</>, tagline: 'Build production AI systems that proactively iterate toward goals.', href: '#course-5', learnMoreUrl: '/level-5', thumb: 'thumbnail-level5.png', cohortDate: 'September 1, 2026' },
  ]

  return (
    <>
      {/* ====== 1. Navigation ====== */}
      <div className={`rb-nav-wrapper${scrolled ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="https://www.joinleland.com" className="rb-nav-logo">
              {scrolled
                ? <img className="rb-logo-dark" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
                : <img className="rb-logo-white" src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" />
              }
            </a>
            <span className="rb-nav-lockup-divider" />
            <img
              className="rb-nav-aibp-logo"
              src={`${import.meta.env.BASE_URL}assets/logos/${scrolled ? 'AIBP-Logo-Blue-Dark' : 'AIBP-Logo-Blue'}.png`}
              alt="AI Builder Program"
            />
          </div>
          <div className="rb-nav-actions">
            <a href={`${SALES_URL}?utm_content=nav-cta`} target="_blank" rel="noopener noreferrer" className="rb-nav-signin" onClick={() => posthog.capture('app--sales_cta_click', { source: 'nav' })}>Talk to our team</a>
            <a href="#pricing" className="rb-nav-getstarted" onClick={() => posthog.capture('app--enroll_cta_click', { source: 'nav' })}>
              Enroll now
            </a>
          </div>
        </nav>
      </div>

      {/* ====== 2. Hero ====== */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="container">
          <Countdown />

          <h1 className="hero-stagger hero-stagger-1">Build with AI to <br className="mobile-br" /><TextMorph className="rotating-text">{heroPhrase}</TextMorph></h1>

          <p className="hero-sub hero-stagger hero-stagger-2">Leland's AI Builder Program helps you build tools that transform how you work, so you have more time and leverage to pursue what matters.</p>

          <div className="hero-ctas hero-stagger hero-stagger-3">
            <a
              href="#pricing"
              className="btn btn-primary btn-lg"
              onClick={() => posthog.capture('app--enroll_cta_click', { source: 'hero' })}
            >
              Enroll now
            </a>
            <a href="#course-accordion" className="btn btn-ghost btn-lg hero-cta-ghost">
              Explore the levels
            </a>
          </div>

          <div className="hero-review-row hero-stagger hero-stagger-4">
            <div className="hero-review-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="#FFD667" width="18" height="18">
                  <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
                </svg>
              ))}
            </div>
            <span className="hero-review-text">4.9/5 from 143+ reviews</span>
          </div>

          <div className="track-cards-section track-cards-v2" id="courses">
          </div>

        </div>
      </section>

      <div className="track-v2-overlap">
        <div className="container">
          <div className="logo-ticker logo-ticker-cards">
            <span className="logo-ticker-label">Taught by experts from places like:</span>
            <Marquee gradient gradientColor="#222222" gradientWidth={48} speed={35}>
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
          {(
              <div className="v3-tiers">
                {[
                  { key: 'core', eyebrow: 'AI Builder Core', meta: '6 weeks', count: scarcityCount },
                  { key: 'advanced', eyebrow: 'AI Builder Advanced', meta: '10 weeks', count: advancedScarcityCount },
                ].map(tier => (
                  <div className={`v3-tier v3-tier-${tier.key}`} key={tier.key}>
                    <div className="v3-tier-header">
                      <div className="v3-tier-header-text">
                        <span className="v3-tier-eyebrow-row">
                          <span className="v3-tier-eyebrow">{tier.eyebrow}</span>
                          {tier.key === 'core' && <span className="v3-tier-popular">Most Popular</span>}
                        </span>
                        <span className="v3-tier-meta">{tier.meta} · <span className="v3-tier-purchased">{tier.count} purchased in the last week</span></span>
                      </div>
                      <div className="v3-tier-cta">
                        <a
                          href={tier.key === 'core' ? '#course-accordion' : '#course-4'}
                          className="v3-tier-arrow-btn"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Learn more"
                        >
                          &darr;
                        </a>
                      </div>
                    </div>
                    <div className="v3-tier-cards">
                      {trackItems.filter(item => item.tier === tier.key).map(item => {
                        const idx = trackItems.findIndex(t => t.num === item.num)
                        const cardClick = () => { setOpenAccordion(idx); setTimeout(() => { const el = document.querySelector(item.href); if (el) { const navHeight = document.querySelector('.rb-nav')?.offsetHeight || 60; const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16; window.scrollTo({ top, behavior: 'smooth' }); } }, 100); }
                        return (
                          <div className={`v3-card v3-card-${tier.key}`} key={item.num} onClick={cardClick}>
                            <div className={`v3-card-level-banner v3-card-level-banner-${tier.key}`}>Level {parseInt(item.num)}</div>
                            <div className="v3-card-body">
                            <div className="v3-card-title">{item.name}</div>
                            <div className="v3-card-desc">{item.tagline}</div>
                            {item.pastSoldOut && item.pastSoldOut.length > 0 && (
                              <span className="v3-card-sold-out">
                                {item.pastSoldOut.map((d, i) => (
                                  <React.Fragment key={d}>
                                    {i > 0 && <span className="v3-card-sold-out-sep"> · </span>}
                                    <span className="v3-card-sold-out-date">{d}</span>
                                  </React.Fragment>
                                ))}
                                <span className="v3-card-sold-out-tag"> Sold out</span>
                              </span>
                            )}
                            </div>
                            <div className="v3-card-footer-wrap">
                            {(() => {
                              const d = new Date(item.cohortDate)
                              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                              const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                              const formatted = `${days[d.getDay()]}, ${shortMonths[d.getMonth()]} ${d.getDate()}`
                              return (
                                <a
                                  href={item.href}
                                  className="v3-card-footer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    const el = document.querySelector(item.href)
                                    if (el) {
                                      const navHeight = document.querySelector('.rb-nav')?.offsetHeight || 60
                                      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16
                                      window.scrollTo({ top, behavior: 'smooth' })
                                    }
                                  }}
                                >
                                  <div className="v3-card-cal">
                                    <span className="v3-card-cal-month">{shortMonths[d.getMonth()]}</span>
                                    <span className="v3-card-cal-day">{d.getDate()}</span>
                                  </div>
                                  <div className="v3-card-cohort">
                                    <span className="v3-card-cohort-label">Next cohort starts</span>
                                    <span className="v3-card-cohort-date">{formatted}</span>
                                  </div>
                                </a>
                              )
                            })()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="cards-cta-line cards-cta-line-v2">
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
            </div>
          </div>
        </div>
      </section>

      {/* ====== VP1 — Image Reveal ====== */}
      <ImageRevealSection />

      {/* ====== 4. Testimonials — Masonry board ====== */}
      <TestimonialsBoard />

      {/* ====== 5. Value Stack 1 (pricing anchor) ====== */}
      <ValueStack id="pricing" />

      {/* ====== Why — skills + tools ====== */}
      <WhyRevealSection toolPills={toolPills} skillPills={skillPills} />

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
        </div>
      </section>

      {/* ====== Bundle callout — own section ====== */}
      <section className="bundle-section">
        <div className="container">
          <h2 className="bundle-section-headline">Bundle the full program and save</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                <span style={{ fontWeight: 600, fontSize: 15 }}>AI Builder Core (Levels 1–3)</span>
                <span style={{ color: 'var(--gray-dark)', fontSize: 11, fontFamily: 'var(--font-meta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>most popular</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>The full Core program — Levels 1, 2, and 3 — completed in 6 weeks. The right starting point for most builders.</p>
              <a href="https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                Get the Core bundle <span className="arrow">&rarr;</span>
              </a>
            </div>
            <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                <span style={{ fontWeight: 600, fontSize: 15 }}>AI Builder Advanced (Levels 1–5)</span>
                <span style={{ color: 'var(--gray-dark)', fontSize: 11, fontFamily: 'var(--font-meta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>best value</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>The complete journey — all five levels — for builders who want to ship production AI systems.</p>
              <a href="https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c433d93e28f6893acab6c9%2C69c433eddf04fb0e41cf2000)" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                Get the Advanced bundle <span className="arrow">&rarr;</span>
              </a>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>After you buy a bundle, we'll send you a form to select the cohort dates and times you want to enroll in.</p>
          <a
            href={`${SALES_URL}?utm_content=bundle-callout`}
            target="_blank"
            rel="noopener noreferrer"
            className="value-stack-teams-callout"
            onClick={() => posthog.capture('app--sales_cta_click', { source: 'bundle-callout' })}
          >
            <img src={`${import.meta.env.BASE_URL}assets/icons/modern-building-4.svg`} alt="" className="value-stack-teams-icon" />
            <span className="value-stack-teams-text">
              <strong>Not sure which bundle is right, or have other questions?</strong>
            </span>
            <span className="value-stack-teams-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>

      {/* ====== Use Cases by Role ====== */}
      <RoleUseCases />

      {/* ====== VP3 — Work Smarter (img-reveal layout) ====== */}
      <SkillsRevealSection />

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

          <div className="rb-cert-grid">
            <div className="rb-cert-card">
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
            </div>

            <div className="rb-cert-card">
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
            </div>

            <div className="rb-cert-card">
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
            </div>
          </div>
        </div>
      </section>

      {/* ====== Get This Expensed ====== */}
      <GetThisExpensed />

      {/* ====== Each-session value prop (moved away from VP3) ====== */}
      <section className="value-props-section rb-band-gray">
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
                <a href="https://calendly.com/d/ct7k-c45-dbx/leland-s-ai-builder-program-for-teams" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg enterprise-cta">
                  Talk with Our Team
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

      {/* ====== Pre-Footer CTA ====== */}
      <section className="prefooter">
        <div className="prefooter-inner">
          <h2 className="prefooter-heading">Take the next step toward your goals</h2>
          <a href="#pricing" className="prefooter-cta" onClick={() => posthog.capture('app--enroll_cta_click', { source: 'prefooter' })}>Get started</a>
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
                <li><a href="https://www.joinleland.com/category/mba" className="footer-col-link">MBA</a></li>
                <li><a href="https://www.joinleland.com/ai" className="footer-col-link">AI Productivity</a></li>
                <li><a href="https://www.joinleland.com/category/management-consulting" className="footer-col-link">Management Consulting</a></li>
                <li><a href="https://www.joinleland.com/category/gre" className="footer-col-link">GRE</a></li>
                <li><a href="https://www.joinleland.com/category/private-equity" className="footer-col-link">Private Equity</a></li>
                <li><a href="https://www.joinleland.com/category/product-management" className="footer-col-link">Product Management</a></li>
                <li><a href="https://www.joinleland.com/category/career-development" className="footer-col-link">Career Development</a></li>
                <li><a href="https://www.joinleland.com/category/college" className="footer-col-link">College</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-heading">Partnerships</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/partnerships" className="footer-col-link">Partner with Leland</a></li>
                <li><a href="https://www.joinleland.com/universities" className="footer-col-link">For Universities</a></li>
                <li><a href="https://www.joinleland.com/ai-transformation" className="footer-col-link">AI Transformation</a></li>
                <li><a href="https://www.joinleland.com/outplacement" className="footer-col-link">Outplacement</a></li>
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

      <LPPopup />
    </>
  )
}
