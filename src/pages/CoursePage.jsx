import React, { useState } from 'react'
import { courseData, allCourses, ENROLL_URLS, SESSION_SCHEDULES } from './courseData'
import './CoursePage.css'
import GetThisExpensed from '../components/GetThisExpensed'
import CountdownTimer from '../components/CountdownTimer'

/* ─── Shared data ─── */
const BUILD_IMAGES = [
  '/assets/builds/build-01.png',
  '/assets/builds/build-02.png',
  '/assets/builds/build-03.png',
  '/assets/builds/build-04.png',
  '/assets/builds/build-05.png',
  '/assets/builds/build-06.png',
  '/assets/builds/build-07.png',
  '/assets/builds/build-08.png',
  '/assets/builds/build-09.png',
  '/assets/builds/build-10.png',
  '/assets/builds/build-11.png',
]

const TESTIMONIALS = [
  {
    name: 'Angela S.',
    quote: 'This course changed my workflow completely. I went from spending hours on repetitive tasks to having AI handle them in minutes. My team keeps asking how I\'m getting so much done.',
  },
  {
    name: 'Hannah P.',
    quote: 'I was skeptical that a 3-week course could actually change how I work. By session two I had already built an automation that saved me 3 hours a week. By the end, I had five.',
  },
  {
    name: 'Tyler G.',
    quote: 'The hands-on approach is what sets this apart. Every session ended with something I could use at work the next day. Not theory, not slides — actual tools I still use months later.',
  },
]

/* ─── Shared icons ─── */
const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

/* ─── FAQ accordion ─── */
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
          <p>{answer}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Day-of-week helper ─── */
function formatSessionDate(iso, label, time) {
  const dow = new Date(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Denver' })
  const short = label.replace(/, \d{4}$/, '')
  return `${dow}, ${short} · ${time}`
}

/* ─── Session accordion ─── */
function SessionItem({ session, num, open, onToggle, sessionDate }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={onToggle} style={{ cursor: 'pointer' }}>
      <span className="faq-index">{String(num).padStart(2, '0')}</span>
      <div className="faq-body">
        <div className="faq-q">
          <h3>
            {session.title}
            {sessionDate && (
              <span className="session-date-inline">
                {formatSessionDate(sessionDate.iso, sessionDate.label, sessionDate.time)}
              </span>
            )}
          </h3>
          <ChevronIcon />
        </div>
        <div className="faq-a">
          <div className="cp-session-detail">
            <p><strong>Concepts covered:</strong> {session.concepts}</p>
            <p><strong>Build exercise:</strong> {session.build}</p>
            <p className="cp-session-note">
              Practice environment included: You'll work through every exercise in a shared live business environment built for this course.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Enroll CTA block ─── */
function EnrollBlock({ nextCohort, enrollUrl, size = 'normal', centered = false }) {
  const isLg = size === 'lg'
  return (
    <div className={`cp-enroll-block${centered ? ' cp-enroll-block--centered' : ''}`}>
      <a
        href={enrollUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary${isLg ? ' btn-lg' : ''}`}
      >
        Enroll Now <span className="arrow">&rarr;</span>
      </a>
      <span className="cp-enroll-meta">
        Next cohort: {nextCohort} &middot; Payment plans available &middot; Retake for 1 year
      </span>
    </div>
  )
}

/* ─── Tools section ─── */
const TOOL_ICONS = {
  OpenAI: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.77a5.85 5.85 0 0 0-.5-4.8 5.93 5.93 0 0 0-6.38-2.85A5.86 5.86 0 0 0 11 .48a5.93 5.93 0 0 0-5.66 4.11 5.86 5.86 0 0 0-3.92 2.84 5.93 5.93 0 0 0 .73 6.96 5.85 5.85 0 0 0 .5 4.8 5.93 5.93 0 0 0 6.38 2.85A5.86 5.86 0 0 0 13 23.52a5.93 5.93 0 0 0 5.66-4.1 5.86 5.86 0 0 0 3.92-2.85 5.93 5.93 0 0 0-.73-6.96l.43-.84zM13 21.98a4.4 4.4 0 0 1-2.82-1.02l.14-.08 4.68-2.7a.77.77 0 0 0 .39-.67v-6.6l1.98 1.14a.07.07 0 0 1 .04.06v5.46A4.42 4.42 0 0 1 13 21.98zM3.63 17.87a4.4 4.4 0 0 1-.53-2.97l.14.08 4.68 2.7a.77.77 0 0 0 .77 0l5.71-3.3v2.28a.08.08 0 0 1-.03.06L9.6 19.48a4.43 4.43 0 0 1-5.97-1.61zm-1.24-10.3A4.4 4.4 0 0 1 4.7 5.42v5.5a.77.77 0 0 0 .39.67l5.71 3.3-1.98 1.14a.08.08 0 0 1-.07 0L4.1 13.36a4.43 4.43 0 0 1-1.71-5.79zm16.27 3.8L13 8.07l1.98-1.14a.08.08 0 0 1 .07 0l4.66 2.69a4.42 4.42 0 0 1-.68 7.98v-5.5a.77.77 0 0 0-.37-.73zm1.97-3.02-.14-.08-4.68-2.7a.77.77 0 0 0-.77 0L9.33 8.87V6.59a.08.08 0 0 1 .03-.06l4.66-2.69a4.42 4.42 0 0 1 6.61 4.58v.03zm-12.4 4.08L6.24 11.3a.08.08 0 0 1-.04-.06V5.78a4.42 4.42 0 0 1 7.25-3.4l-.14.08-4.68 2.7a.77.77 0 0 0-.39.67v6.6l-1.98-1.15v.02zm1.08-2.32 2.54-1.47 2.54 1.47v2.94L11.85 14l-2.54-1.46V10.11z"/></svg>
  ),
  Claude: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.999 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.001 4.5c.674 0 1.33.086 1.955.248L8.14 15.238a8.25 8.25 0 0 1-1.89-5.238C6.25 5.612 8.74 4.5 12 4.5zm7.5 7.5c0 1.5-.42 2.9-1.15 4.09l-5.85-3.38v-6.1A7.5 7.5 0 0 1 19.5 12zm-7.501 7.5a7.46 7.46 0 0 1-4.26-1.33L12 9.33l4.26 2.46A7.46 7.46 0 0 1 12 19.5z"/></svg>
  ),
  Gemini: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 19.5c-.55 0-1-.45-1-1v-5h-5c-.55 0-1-.45-1-1s.45-1 1-1h5v-5c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1h-5v5c0 .55-.45 1-1 1z"/></svg>
  ),
  Perplexity: <span style={{fontWeight:700,fontSize:13,lineHeight:1}}>P</span>,
  Cursor: <span style={{fontWeight:700,fontSize:13,lineHeight:1}}>↗</span>,
  n8n: <span style={{fontWeight:700,fontSize:13,lineHeight:1}}>n8n</span>,
}

function ToolsSection({ course }) {
  if (!course.tools) return null
  return (
    <section className="cp-tools-section">
      <div className="container">
        <h2 className="cp-tools-headline">{course.toolsSectionHeadline}</h2>
        <p className="cp-tools-sub">Learn how to use all the best tools, including:</p>
        <div className="cp-tools-chips">
          {course.tools.map(t => (
            <span key={t} className="cp-tool-chip">
              <span className="cp-tool-icon">{TOOL_ICONS[t] || t[0]}</span>
              {t}
            </span>
          ))}
        </div>
        <p className="cp-tools-updated">Updated weekly, so you're always learning at the frontier of AI</p>
        <p className="cp-tools-sub" style={{marginTop:28}}>We'll teach you best practices for AI in&hellip;</p>
        <div className="cp-topics-chips">
          {course.topics.map(t => (
            <span key={t} className="cp-topic-chip">{t}</span>
          ))}
          <span className="cp-topic-chip cp-topic-more">+ more</span>
        </div>
      </div>
    </section>
  )
}

/* ─── Build collage ─── */
const COLLAGE_IMAGES = [
  '/assets/builds/build-01.png',
  '/assets/builds/build-02.png',
  '/assets/builds/build-03.png',
  '/assets/builds/build-05.png',
  '/assets/builds/build-06.png',
  '/assets/builds/build-09.png',
  '/assets/builds/build-10.png',
  '/assets/builds/build-15.png',
  '/assets/builds/build-16.png',
  '/assets/builds/build-17.png',
  '/assets/builds/build-19.png',
  '/assets/builds/build-21.png',
  '/assets/builds/build-23.png',
  '/assets/builds/build-25.png',
  '/assets/builds/build-27.png',
]

function BuildCollage() {
  return (
    <div className="cp-collage">
      {COLLAGE_IMAGES.map((src, i) => (
        <div key={i} className={`cp-collage-item cp-collage-item-${(i % 5) + 1}`}>
          <img src={src} alt={`Build example ${i + 1}`} loading="lazy" />
        </div>
      ))}
    </div>
  )
}

/* ─── Testimonial card ─── */
function TestimonialCard({ name, quote }) {
  return (
    <div className="cp-testimonial-card">
      <div className="cp-testimonial-stars">★★★★★</div>
      <p className="cp-testimonial-quote">{quote}</p>
      <span className="cp-testimonial-name">{name}</span>
    </div>
  )
}

/* ─── Where this fits ─── */
function WhereThisFits({ currentId }) {
  return (
    <section className="cp-where-section">
      <div className="container">
        <h2 className="cp-where-headline">Where this fits in the program</h2>
        <p className="cp-where-sub">
          {currentId < 5
            ? <>Complete this course, then continue to <a href={`/level-${currentId + 1}`} className="cp-accent-link">{allCourses[currentId].name}</a> to go deeper.</>
            : <>This is the final course. You now have the full AI Builder skill set.</>
          }
          {' '}<a href="/" className="cp-quiet-link">View full program &rarr;</a>
        </p>
        <div className="cp-where-strip">
          {allCourses.map((c) => {
            const isCurrent = c.id === currentId
            return (
              <a
                key={c.id}
                href={`/level-${c.id}`}
                className={`cp-where-card ${isCurrent ? 'cp-where-card-active' : 'cp-where-card-inactive'}`}
              >
                <span className="cp-where-level">Level {c.id}</span>
                <span className="cp-where-name">{c.name}</span>
                {c.whoShort && <span className="cp-where-who">{c.whoShort}</span>}
                <span className="cp-where-cohort">Next: {c.nextCohort}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Main CoursePage ─── */
export default function CoursePage({ courseId }) {
  const id = courseId
  const course = courseData[id]
  const enrollUrl = ENROLL_URLS[id]
  const schedule = SESSION_SCHEDULES[id] || []

  const [openSession, setOpenSession] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [showAllBuilds, setShowAllBuilds] = useState(false)
  const BUILD_VISIBLE = 6

  if (!course) {
    return (
      <div className="cp-not-found">
        <h2>Course not found</h2>
        <a href="/" className="cp-accent-link">Back to program &rarr;</a>
      </div>
    )
  }

  return (
    <div className="cp-page">

      {/* ── NAV ── */}
      <nav>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src="/assets/logo-white.svg" alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <div className="cp-nav-right">
            <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Enroll Now
            </a>
            <span className="cp-nav-cohort">Next cohort: {course.nextCohort}</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="cp-hero">
        <div className="cp-hero-image-bg" />
        <div className="container">

          <p className="cp-breadcrumb">
            <a href="/">AI Builder Program</a>
            {' '}&rsaquo;{' '}{course.name}
          </p>

          <div className="cp-badge">{course.badge}</div>

          <h1 className="cp-hero-headline">{course.heroHeadline}</h1>
          <p className="cp-hero-sub">{course.heroSubheadline}</p>

          <EnrollBlock nextCohort={course.nextCohort} enrollUrl={enrollUrl} size="lg" />

          {schedule.length > 0 && (
            <CountdownTimer targetIso={schedule[0].iso} />
          )}

          <div className="cp-hero-social">
            <span className="cp-hero-stars">★★★★★</span>
            <span className="cp-hero-social-text">4.9 from the Leland community &middot; 26,000+ reviews</span>
          </div>

        </div>
      </section>

      {/* ── TOOLS SECTION ── */}
      <ToolsSection course={course} />

      {/* ── TESTIMONIALS "Proven to transform how you work" ── */}
      <section className="cp-section cp-testimonials-section">
        <div className="container">
          <h2 className="cp-proven-headline">Proven to transform how you work</h2>
          <div className="cp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} name={t.name} quote={t.quote} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="cp-section cp-value-section">
        <div className="container">
          <div className="cp-value-box">
            <p className="cp-section-label">What's included</p>
            <h2>Everything in <span className="cp-accent-text">{course.name}</span></h2>
            <div className="cp-value-list">
              {[
                '12+ hours of live, cohort-based instruction',
                '6 hands-on deliverables you can use in your work immediately',
                'Access to the private Leland AI Builder community',
                'Weekly office hours with instructors',
                'Full session recordings, accessible for 1 year',
                'Certification upon completion',
                '3 months of Leland+ access — 5 AI courses and 250+ resources',
                'Comprehensive practice environment for every exercise',
                '100+ skill.md files, folder templates, and AI tools',
                'Best Course Guarantee: money-back if you find better',
                'Unlimited retakes for 1 year — always the latest curriculum',
              ].map((item, i) => (
                <div className="cp-value-item" key={i}>
                  <span className="cp-value-check">&#10003;</span>
                  <span className="cp-value-label">{item}</span>
                </div>
              ))}
            </div>
            <div className="cp-price-row">
              <span className="cp-price-crossed">$2,500+ value</span>
              <span className="cp-price">$999</span>
            </div>
            <EnrollBlock nextCohort={course.nextCohort} enrollUrl={enrollUrl} size="lg" centered />
          </div>
        </div>
      </section>

      {/* ── AT A GLANCE ── */}
      <section className="cp-glance">
        <div className="container">
          <div className="cp-glance-grid">
            <div className="cp-glance-item">
              <img src="/assets/icons/clock.svg" alt="" className="cp-glance-icon" />
              <span className="cp-glance-label">6 Live Sessions</span>
              <span className="cp-glance-sub">90 minutes each</span>
            </div>
            <div className="cp-glance-item">
              <img src="/assets/icons/play.svg" alt="" className="cp-glance-icon" />
              <span className="cp-glance-label">All Sessions Recorded</span>
              <span className="cp-glance-sub">Watch on demand, forever</span>
            </div>
            <div className="cp-glance-item">
              <img src="/assets/icons/tool.svg" alt="" className="cp-glance-icon" />
              <span className="cp-glance-label">Learn by Building</span>
              <span className="cp-glance-sub">One deliverable per session</span>
            </div>
            <div className="cp-glance-item">
              <img src="/assets/icons/shield.svg" alt="" className="cp-glance-icon" />
              <span className="cp-glance-label">Best Course Guarantee</span>
              <span className="cp-glance-sub">Money-back if you find better</span>
            </div>
            <div className="cp-glance-item">
              <img src="/assets/icons/calendar.svg" alt="" className="cp-glance-icon" />
              <span className="cp-glance-label">Retake for 1 Year</span>
              <span className="cp-glance-sub">Always the latest curriculum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ── */}
      <section className="cp-section">
        <div className="container">
          <p className="cp-section-label">Curriculum</p>
          <h2>What you'll learn</h2>
          <div className="cp-learn-grid">
            {course.whatYoullLearn.map((col, ci) => (
              <div className="cp-learn-col" key={ci}>
                {col.col.map((item, ii) => (
                  <p className="cp-learn-item" key={ii}>{item}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SESSION BREAKDOWN ── */}
      <section className="cp-section cp-sessions-section">
        <div className="container">
          <p className="cp-section-label">Session breakdown</p>
          <h2>6 sessions. Learn by building every time.</h2>
          <div className="cp-session-grid">
            {course.sessions.map((session, i) => (
              <SessionItem
                key={i}
                session={session}
                num={i + 1}
                open={openSession === i}
                onToggle={() => setOpenSession(openSession === i ? null : i)}
                sessionDate={schedule[i]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL BUILD (expandable) ── */}
      <section className="cp-section cp-build-section">
        <div className="container">
          <p className="cp-section-label">What you'll build</p>
          <h2>Build tools you can use at work the next day</h2>
          <div className="cp-build-list">
            {course.whatYoullBuild
              .slice(0, showAllBuilds ? undefined : BUILD_VISIBLE)
              .map((item, i) => (
                <div className="cp-build-item" key={i}>
                  <span className="cp-build-plus">+</span>
                  <span className="cp-build-text">{item}</span>
                </div>
              ))}
          </div>
          {course.whatYoullBuild.length > BUILD_VISIBLE && (
            <button
              className="cp-build-more-btn"
              onClick={() => setShowAllBuilds(v => !v)}
            >
              {showAllBuilds
                ? 'Show less'
                : `+ ${course.whatYoullBuild.length - BUILD_VISIBLE} more`}
            </button>
          )}
        </div>
      </section>

      {/* ── COLLAGE ── */}
      <section className="cp-section cp-collage-section">
        <div className="container">
          <h2 className="cp-collage-heading">See what previous cohort members built</h2>
          <BuildCollage />
        </div>
      </section>

      {/* ── WHERE THIS FITS ── */}
      <WhereThisFits currentId={id} />

      {/* ── GET THIS EXPENSED ── */}
      <GetThisExpensed />

      {/* ── FAQs ── */}
      <section className="faq cp-faq-section">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-grid">
            {[
              ...course.faqs,
              { q: 'Which AI tools do I need for this course?', a: "We focus on teaching concepts in a tool-agnostic way so you can bring whatever AI tools you already use. ChatGPT, Claude, and Gemini will work for the course. We'll use the terminal and workflow builders, and for these interfaces, you can choose from a variety of tool options." },
              { q: "My company doesn't let me connect AI to our internal systems. Can I still get value from this program?", a: "Yes, and we designed the program with this in mind. A core skill we teach is how to build effective AI workflows without connecting to your company's live data. You'll learn how to structure information manually, build automations around what you can access, and get real results within whatever constraints your IT policy sets. Connecting tools via MCP connectors is something we teach as an optional capability, not a requirement." },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <EnrollBlock nextCohort={course.nextCohort} enrollUrl={enrollUrl} size="lg" centered />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
