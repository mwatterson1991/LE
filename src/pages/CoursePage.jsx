import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { courseData, allCourses, ENROLL_URL } from './courseData'
import './CoursePage.css'

/* ─── Shared icons ─── */
const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

/* ─── Reuse main-page FAQ accordion pattern ─── */
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

/* ─── Session accordion ─── */
function SessionItem({ session, num, open, onToggle }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={onToggle} style={{ cursor: 'pointer' }}>
      <span className="faq-index">{String(num).padStart(2, '0')}</span>
      <div className="faq-body">
        <div className="faq-q">
          <h3>{session.title}</h3>
          <ChevronIcon />
        </div>
        <div className="faq-a">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <p><strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Concepts covered:</strong> {session.concepts}</p>
            <p><strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Build exercise:</strong> {session.build}</p>
            <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-meta)', fontSize: '13px', letterSpacing: '0.04em' }}>
              Practice environment included: You'll work through every exercise in a shared live business environment built for this course.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Enroll CTA block ─── */
function EnrollBlock({ nextCohort, size = 'normal' }) {
  const isLg = size === 'lg'
  return (
    <div className="cp-enroll-block">
      <a
        href={ENROLL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary${isLg ? ' btn-lg' : ''}`}
        style={{ textTransform: 'uppercase', minWidth: 200 }}
      >
        Enroll Now <span className="arrow">&rarr;</span>
      </a>
      <span className="value-stack-subtext">
        Next cohort: {nextCohort} &middot; Payment plans available &middot; Retake for 1 year
      </span>
    </div>
  )
}

/* ─── "Where this fits" — 5-course strip ─── */
function WhereThisFits({ currentId }) {
  return (
    <section style={{ padding: '60px 0', background: 'var(--bg)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Where this fits in the program</h2>
        <p style={{ marginBottom: 32, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {currentId < 5
            ? <>Complete this course, then continue to <Link to={`/courses/${currentId + 1}`} style={{ color: 'var(--accent)' }}>{allCourses[currentId].name}</Link> to go deeper.</>
            : <>This is the final course. You now have the full AI Builder skill set.</>
          }
          {' '}<Link to="/" style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontFamily: 'var(--font-meta)', letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: 2 }}>View full program &rarr;</Link>
        </p>
        <div className="cp-where-strip">
          {allCourses.map((c) => {
            const isCurrent = c.id === currentId
            return (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className={`cp-where-card ${isCurrent ? 'cp-where-card-active' : 'cp-where-card-inactive'}`}
              >
                <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: isCurrent ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                  Course {c.id}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {c.name}
                </span>
                <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                  Next: {c.nextCohort}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Main CoursePage ─── */
export default function CoursePage() {
  const { courseId } = useParams()
  const id = parseInt(courseId, 10)
  const course = courseData[id]

  const [openSession, setOpenSession] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Course not found</h2>
          <Link to="/" style={{ color: 'var(--accent)', marginTop: 12, display: 'inline-block' }}>Back to program &rarr;</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── NAV ── */}
      <nav>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src="/assets/logo-white.svg" alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textTransform: 'uppercase', fontSize: '12px' }}>
              Enroll Now
            </a>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-meta)' }}>Next cohort: {course.nextCohort}</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="cp-hero">
        <div className="cp-hero-image-bg" />
        <div className="container">
          {/* Breadcrumb */}
          <p className="cp-breadcrumb">
            <Link to="/">AI Builder Program</Link>
            {' '}&rsaquo;{' '}{course.name}
          </p>

          {/* Badge */}
          <div className="cp-badge">{course.badge}</div>

          <h1 className="cp-hero-headline">{course.heroHeadline}</h1>
          <p className="cp-hero-sub">{course.heroSubheadline}</p>

          {/* Enroll CTA */}
          <EnrollBlock nextCohort={course.nextCohort} size="lg" />
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
              <span className="cp-glance-label">6 Sessions, Learn by Building</span>
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
              <span className="cp-glance-sub">Always get the latest curriculum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ── */}
      <section className="cp-section" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container">
          <p className="cp-section-label">Who this is for</p>
          <h2>Is this course right for you?</h2>
          <p className="cp-who-text">{course.whoItsFor}</p>
        </div>
      </section>

      {/* ── WHAT YOU'LL BUILD ── */}
      <section className="cp-section" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container">
          <p className="cp-section-label">What you'll build</p>
          <h2>6 deliverables you'll take to work</h2>
          <div className="cp-build-list">
            {course.whatYoullBuild.map((item, i) => (
              <div className="cp-build-item" key={i}>
                <span className="cp-build-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cp-build-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENROLL CTA (after deliverables) ── */}
      <section style={{ padding: '48px 0', background: 'var(--bg)', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <div className="container">
          <EnrollBlock nextCohort={course.nextCohort} size="lg" />
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ── */}
      <section className="cp-section" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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
      <section className="cp-section" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container">
          <p className="cp-section-label">Session breakdown</p>
          <h2>6 sessions where you'll learn by building.</h2>
          <div className="cp-session-grid">
            {course.sessions.map((session, i) => (
              <SessionItem
                key={i}
                session={session}
                num={i + 1}
                open={openSession === i}
                onToggle={() => setOpenSession(openSession === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="cp-section" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container">
          <div className="cp-value-box">
            <h2>Everything included in <span style={{ color: 'var(--accent)' }}>{course.name}</span></h2>
            <div className="cp-value-list">
              {[
                '12+ hours of live, cohort-based instruction',
                '6+ hands-on deliverables you can use in your work',
                'Access to the private Leland AI Builder community',
                'Weekly office hours with instructors',
                'Full session recordings and access to future cohort recordings for 1 year',
                'Certification upon completion',
                '3 months of access to Leland+, with 5 specialized AI courses and 250+ AI resources',
                'Comprehensive practice environment to build everything covered in the course',
                '100+ skill.md files, folder templates, and tools to help you build your AI foundation',
                'Best Course Guarantee: money-back if you find better',
                'Unlimited course retakes for 1 year, so you always have the most current curriculum',
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
            <EnrollBlock nextCohort={course.nextCohort} size="lg" />
          </div>
        </div>
      </section>

      {/* ── WHERE THIS FITS ── */}
      <WhereThisFits currentId={id} />

      {/* ── FAQs ── */}
      <section className="faq" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {course.faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <EnrollBlock nextCohort={course.nextCohort} size="lg" />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
