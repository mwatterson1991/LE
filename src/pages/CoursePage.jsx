import React, { useState, useEffect, useRef } from 'react'
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

/* ─── Build carousel ─── */
function BuildCarousel({ images }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const go = (idx) => {
    setCurrent((idx + images.length) % images.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 3500)
    return () => clearInterval(timerRef.current)
  }, [images.length])

  const handleNav = (idx) => {
    clearInterval(timerRef.current)
    go(idx)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 3500)
  }

  return (
    <div className="cp-carousel">
      <div className="cp-carousel-stage">
        <button className="cp-carousel-arrow cp-carousel-prev" onClick={() => handleNav(current - 1)} aria-label="Previous">&#8249;</button>
        <img
          key={current}
          src={images[current]}
          alt={`Build example ${current + 1}`}
          className="cp-carousel-img"
        />
        <button className="cp-carousel-arrow cp-carousel-next" onClick={() => handleNav(current + 1)} aria-label="Next">&#8250;</button>
      </div>
      <div className="cp-carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`cp-carousel-dot${i === current ? ' active' : ''}`}
            onClick={() => handleNav(i)}
            aria-label={`Go to ${i + 1}`}
          />
        ))}
      </div>
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

      {/* ── WHO THIS IS FOR ── */}
      <section className="cp-section cp-who-section">
        <div className="container">
          <p className="cp-section-label">Who this is for</p>
          <h2>Is this the right course for you?</h2>
          <div className="cp-who-block">
            <p className="cp-who-text">{course.whoItsFor}</p>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL BUILD ── */}
      <section className="cp-section cp-build-section">
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
          {(id === 1 || id === 2) && (
            <div className="cp-build-carousel-wrap">
              <p className="cp-build-carousel-label">Built by previous cohort members</p>
              <BuildCarousel images={BUILD_IMAGES} />
            </div>
          )}
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="cp-cta-section">
        <div className="container">
          <EnrollBlock nextCohort={course.nextCohort} enrollUrl={enrollUrl} size="lg" centered />
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

      {/* ── TESTIMONIALS ── */}
      <section className="cp-section cp-testimonials-section">
        <div className="container">
          <p className="cp-section-label">What students say</p>
          <h2>Real results from real professionals</h2>
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
