import React, { useState, useEffect } from 'react'
import { courseData, allCourses, ENROLL_URLS, SESSION_SCHEDULES } from './courseData'
import './SyllabusPage.css'

const ENROLL_URL = ENROLL_URLS[1]

const ChevronIcon = () => (
  <svg className="sy-session-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

function formatSessionDate(iso, label, time) {
  const dow = new Date(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Denver' })
  const short = label.replace(/, \d{4}$/, '')
  return `${dow}, ${short} · ${time}`
}

function SessionItem({ session, num, open, onToggle, schedule }) {
  return (
    <div className={`sy-session${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="sy-session-header">
        <span className="sy-session-num">{String(num).padStart(2, '0')}</span>
        <div className="sy-session-info">
          <div className="sy-session-title">{session.title}</div>
          <div className="sy-session-summary">{session.summary}</div>
          {schedule && (
            <div className="sy-session-schedule">
              {formatSessionDate(schedule.iso, schedule.label, schedule.time)} · 90 min
            </div>
          )}
        </div>
        <ChevronIcon />
      </div>
      <div className="sy-session-detail">
        <div className="sy-session-detail-inner">
          <p><strong>Concepts covered:</strong> {session.concepts}</p>
          <p><strong>Hands-on build:</strong> {session.build}</p>
          <p className="sy-session-practice">
            Build in the included practice environment with real business data, or apply directly to your own tools.
          </p>
        </div>
      </div>
    </div>
  )
}

function CourseSection({ course, id }) {
  const [openSession, setOpenSession] = useState(null)
  const data = courseData[id]
  if (!data) return null

  const learnItems = data.whatYoullLearn.flatMap(g => g.col)
  const buildItems = data.whatYoullBuild

  const sessions = data.sessions.map(s => ({
    ...s,
    summary: s.build,
  }))

  return (
    <section className="sy-course" id={`course-${id}`}>
      <div className="container">
        <div className="sy-course-header">
          <div className="sy-course-badge">Level {id} of 5</div>
          <h2>{data.name}</h2>
          <p className="sy-course-tagline">{data.heroSubheadline}</p>
        </div>

        <div className="sy-course-columns">
          <div>
            <div className="sy-col-label">What you'll learn</div>
            <ul className="sy-col-list">
              {learnItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div>
            <div className="sy-col-label">What you'll build</div>
            <ul className="sy-col-list">
              {buildItems.slice(0, 6).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="sy-sessions-label">Session-by-session breakdown</div>
        {sessions.map((session, i) => (
          <SessionItem
            key={i}
            session={session}
            num={i + 1}
            open={openSession === i}
            onToggle={() => setOpenSession(openSession === i ? null : i)}
            schedule={SESSION_SCHEDULES[id] ? SESSION_SCHEDULES[id][i] : null}
          />
        ))}

        <div className="sy-course-cta-row">
          <a
            href={ENROLL_URLS[id]}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textTransform: 'uppercase' }}
          >
            Enroll in Level {id} <span className="arrow">&rarr;</span>
          </a>
          <span className="sy-course-cohort-info">
            Next cohort: {data.nextCohort} &middot; $999
          </span>
        </div>
      </div>
    </section>
  )
}

const VALUE_ITEMS = [
  '12+ hours of live, cohort-based instruction per course',
  '6 hands-on deliverables you can use in your work',
  'Full practice environment with real business data',
  'Session recordings + access for 1 year',
  'Access to the private AI Builder community',
  'Weekly office hours with instructors',
  'Certification upon completion',
  '3 months of Leland+, with 5 specialized AI courses and 250+ resources',
  '100+ skill files, folder templates, and tools to build your AI foundation',
  'Unlimited course retakes for 1 year with updated curriculum',
  'Best Course Guarantee: find a better course, and we refund you',
  'Payment plans available',
]

export default function SyllabusPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ── Nav ── */}
      <nav className={`sy-nav${scrolled ? ' nav-scrolled' : ''}`}>
        <div className="container">
          <a href="/" className="logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" />
          </a>
          <a
            href={ENROLL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Enroll Now
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="sy-hero">
        <div className="sy-hero-image-bg" />
        <div className="container">
          <div className="sy-hero-label">AI Builder Program</div>
          <h1>The full curriculum, session by session</h1>
          <p className="sy-hero-sub">
            5 courses. 30 live sessions. Every one hands-on. You'll go from using AI chatbots
            to building fully autonomous systems that run business functions on their own.
            Here's exactly what you'll learn and build at every step.
          </p>
          <div className="sy-hero-ctas">
            <a
              href={ENROLL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              style={{ textTransform: 'uppercase' }}
            >
              Enroll Now <span className="arrow">&rarr;</span>
            </a>
            <a
              href="#course-1"
              className="btn btn-secondary btn-lg"
              style={{ textTransform: 'uppercase' }}
            >
              Jump to curriculum
            </a>
          </div>
        </div>
      </section>

      {/* ── Overview grid ── */}
      <section className="sy-overview">
        <div className="container">
          <div className="sy-overview-label">Program overview</div>
          <h2>Five courses that build on each other</h2>
          <p className="sy-overview-sub">
            Start wherever your current skill level is. Each course stands alone,
            but we recommend most people start with level 1 and take all 5 levels.
          </p>
          <div className="sy-overview-grid">
            {allCourses.map(c => (
              <a key={c.id} href={`#course-${c.id}`} className="sy-overview-card">
                <span className="sy-overview-num">Level {String(c.id).padStart(2, '0')}</span>
                <span className="sy-overview-name">{c.id === 1 ? <>Use AI to 10x Your<br />Impact</> : c.name}</span>
                <span className="sy-overview-outcome">{courseData[c.id].ableToBlurb.charAt(0).toUpperCase() + courseData[c.id].ableToBlurb.slice(1)}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course detail sections ── */}
      {[1, 2, 3, 4, 5].map(id => (
        <CourseSection key={id} id={id} />
      ))}

      {/* ── Value stack ── */}
      <section className="sy-value">
        <div className="container">
          <div className="sy-value-label">What's included</div>
          <h2>Everything you get with each course</h2>
          <div className="sy-value-grid">
            {VALUE_ITEMS.map((item, i) => (
              <div key={i} className="sy-value-item">
                <span className="sy-value-check">&#10003;</span>
                <span className="sy-value-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="sy-bottom-cta">
        <div className="container">
          <h2>Ready to start building?</h2>
          <p className="sy-bottom-cta-sub">
            Pick the level that matches where you are today. Every course runs for 3 weeks
            with 6 live sessions, and you can retake for a full year.
          </p>
          <a
            href={ENROLL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
            style={{ textTransform: 'uppercase' }}
          >
            Enroll Now <span className="arrow">&rarr;</span>
          </a>
          <div className="sy-bottom-cta-note">
            $999 per course &middot; Payment plans available &middot; <a href="/teams" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Team pricing for 5+</a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="sy-footer">
        <div className="container">
          <a href="/" className="sy-footer-logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" />
          </a>
          <span className="sy-footer-copy">&copy; {new Date().getFullYear()} Leland</span>
        </div>
      </footer>
    </>
  )
}
