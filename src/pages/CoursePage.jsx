import React, { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { courseData, allCourses, ENROLL_URLS, COURSE_COHORTS, SESSION_SCHEDULES } from './courseData'
import './CoursePage.css'
import GetThisExpensed from '../components/GetThisExpensed'
import CountdownTimer from '../components/CountdownTimer'
import CardSwap, { Card } from '../components/CardSwap'
import CohortPicker from '../components/CohortPicker'

function getDefaultCohort(cohorts) {
  const now = new Date()
  return (
    cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now) ||
    cohorts.find(c => c.enrollUrl && !c.soldOut) ||
    cohorts[0]
  )
}

const SALES_URL = 'https://joinleland.typeform.com/to/Gp54Gdd4'

/* ─── Tool pills ─── */
const TOOL_PILLS = [
  { name: 'ChatGPT', logo: 'new-ChatGPT-icon-white-png-large-size.png', size: 42 },
  { name: 'Claude', logo: 'claude-ai.png' },
  { name: 'Gemini', logo: 'gemini-ai.png' },
  { name: 'Perplexity', logo: 'perlexity.png', size: 56 },
  { name: 'Cursor', logo: 'cursor-1.png', size: 42 },
  { name: 'n8n', logo: '682c6141f8ac4babe589ee0d_n8n_white_new.png', size: 84 },
]

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

/* ─── Icons ─── */
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

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
            {session.description && (
              <p>{session.description}</p>
            )}
            {session.concepts && (
              <p><strong>Concepts covered:</strong> {session.concepts}</p>
            )}
            {session.build && (
              <p><strong>Build exercise:</strong> {session.build}</p>
            )}
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
function EnrollBlock({ nextCohort, enrollUrl, size = 'normal', centered = false, onClick }) {
  const isLg = size === 'lg'
  return (
    <div className={`cp-enroll-block${centered ? ' cp-enroll-block--centered' : ''}`}>
      {enrollUrl ? (
        <a
          href={enrollUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-primary${isLg ? ' btn-lg' : ''}`}
          onClick={onClick}
        >
          Enroll Now <span className="arrow">&rarr;</span>
        </a>
      ) : (
        <span className={`btn btn-primary${isLg ? ' btn-lg' : ''}`} style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>
          Coming Soon
        </span>
      )}
    </div>
  )
}

/* ─── Build collage ─── */
function BuildCollage() {
  const VISIBLE_COUNT = 6
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const visible = expanded ? COLLAGE_IMAGES : COLLAGE_IMAGES.slice(0, VISIBLE_COUNT)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((prev) => (prev + 1) % COLLAGE_IMAGES.length)
      if (e.key === 'ArrowLeft') setLightbox((prev) => (prev - 1 + COLLAGE_IMAGES.length) % COLLAGE_IMAGES.length)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [lightbox])

  return (
    <>
      <div className="cp-collage">
        {visible.map((src, i) => (
          <div key={i} className="cp-collage-item" onClick={() => setLightbox(i)} style={{ cursor: 'pointer' }}>
            <img src={src} alt={`Build example ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
      {COLLAGE_IMAGES.length > VISIBLE_COUNT && (
        <button className="cp-collage-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {lightbox !== null && (
        <div className="cp-lightbox" onClick={() => setLightbox(null)}>
          <button className="cp-lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
          <button className="cp-lightbox-arrow cp-lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + COLLAGE_IMAGES.length) % COLLAGE_IMAGES.length) }}>&lsaquo;</button>
          <img src={COLLAGE_IMAGES[lightbox]} alt={`Build example ${lightbox + 1}`} onClick={(e) => e.stopPropagation()} />
          <button className="cp-lightbox-arrow cp-lightbox-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % COLLAGE_IMAGES.length) }}>&rsaquo;</button>
        </div>
      )}
    </>
  )
}

/* ─── Level pyramid ─── */
function LevelPyramid({ activeId }) {
  const rows = [
    { id: 5, width: 50 },
    { id: 4, width: 60 },
    { id: 3, width: 70 },
    { id: 2, width: 80 },
    { id: 1, width: 90 },
  ]
  return (
    <div className="iceberg-levels">
      {rows.map(({ id, width }) => {
        const c = allCourses.find(c => c.id === id)
        return (
          <a
            key={id}
            href={`/level-${id}`}
            className={`iceberg-level${id === activeId ? ' iceberg-level-active' : ''}`}
            style={{ width: `${width}%` }}
          >
            <span className="iceberg-level-name">{c ? c.name : `Level ${id}`}</span>
          </a>
        )
      })}
    </div>
  )
}


/* ─── Main CoursePage ─── */
export default function CoursePage({ courseId }) {
  const id = courseId
  const course = courseData[id]
  const cohorts = COURSE_COHORTS[id] || []
  const [selectedCohort, setSelectedCohort] = useState(() => getDefaultCohort(cohorts))
  const enrollUrl = selectedCohort?.enrollUrl ?? null
  const schedule = SESSION_SCHEDULES[id] || []

  const handleCohortChange = (cohort) => {
    setSelectedCohort(cohort)
    posthog.capture('cp--cohort_selected', { level: id, cohort: cohort.iso })
  }

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

  const nextLevelCourse = allCourses.find(c => c.id === id + 1)

  return (
    <div className="cp-page">

      {/* ── NAV ── */}
      <nav>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src="/assets/logo-white.svg" alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <span className="cp-nav-cohort">
            <span className="cp-nav-cohort-label">Next cohort</span>
            <span className="cp-nav-cohort-date">Starts {selectedCohort?.label ?? course.nextCohort.split(' – ')[0]}</span>
          </span>
          <div className="cp-nav-right">
            <a href={`${SALES_URL}?utm_content=nav-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm cp-nav-sales-btn">
              Talk with Our Team
            </a>
            {enrollUrl ? (
              <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" onClick={() => posthog.capture('cp--enroll_cta_click', { source: 'nav', level: id, cohort: selectedCohort?.iso })}>
                Enroll Now
              </a>
            ) : (
              <span className="btn btn-primary btn-sm" style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>Coming Soon</span>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="cp-hero">
        <div className="cp-hero-image-bg" />
        <div className="container">

          <div className="cp-badge-row">
            <a href="/" className="cp-badge cp-badge-back"><span className="cp-badge-chevron">&lsaquo;</span> Back to all levels</a>
            <div className="cp-badge">{course.badge}</div>
          </div>

          <h1 className="cp-hero-headline">{course.heroHeadline}</h1>

          {schedule.length > 0 && (
            <CountdownTimer targetIso={schedule[0].iso} />
          )}
          <p className="cp-hero-sub">
            {course.heroSubheadline}
            {course.ableToBlurb && <> After this 2-week course, you'll be able to {course.ableToBlurb}</>}
          </p>

          <CohortPicker cohorts={cohorts} selected={selectedCohort} onChange={handleCohortChange} />
          <EnrollBlock nextCohort={course.nextCohort} enrollUrl={enrollUrl} size="lg" onClick={() => posthog.capture('cp--enroll_cta_click', { source: 'hero', level: id, cohort: selectedCohort?.iso })} />

          <div className="cp-hero-social">
            <span className="cp-hero-stars">★★★★★</span>
            <span className="cp-hero-social-text"><span style={{ color: 'var(--accent)' }}>4.9</span> from the Leland community &middot; 26,000+ reviews</span>
          </div>

        </div>
      </section>

      {/* ── WHY THIS COURSE ── */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <h2 className="why-headline">{course.whyHeadline}</h2>
              <p className="why-skills-label">Updated weekly, so you're always learning at the frontier of AI. We'll teach you best practices for AI in:</p>
              <div className="why-pills why-pills-skills">
                {(course.skillPills || []).map(skill => (
                  <span className="why-pill why-pill-skill" key={skill}>{skill}</span>
                ))}
              </div>
            </div>
            <div className="why-right">
              <p className="why-tools-label">Learn how to use all the best tools</p>
              <div className="why-tools-grid">
                {TOOL_PILLS.map(tool => (
                  <div className="why-tool" key={tool.name}>
                    <img
                      src={`/assets/logos/tools/${tool.logo}`}
                      alt={tool.name}
                      className="why-tool-logo"
                      style={tool.size ? { width: tool.size, height: tool.size } : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VP1: Become the AI expert your team turns to ── */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(/assets/review-bg.png)' }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Become the AI expert<br />your team turns to</h2>
            <p>Earn a credential and build skills your boss and colleagues will notice. Upon completion of the course, you'll have a certificate (and real AI outcomes) you can share on LinkedIn.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-new">
        <div className="container">
          <div className="testimonials-stars-lg">
            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
          </div>
          <div className="testimonials-review-count">
            <span className="testimonials-review-number">26,132 reviews</span>
            <span className="testimonials-review-community">in the Leland community</span>
          </div>
          <h2 className="testimonials-headline">Proven to transform how you work</h2>
          <div className="testimonials-grid testimonials-grid-6">
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;This course changed my workflow completely. I went from spending hours on repetitive tasks to having AI handle them in minutes. My team keeps asking how I'm getting so much done.&rdquo;</p>
              <span className="testimonial-author">Angela S.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;I was skeptical that a 2-week course could actually change how I work. By session two, I had already built an automation that saved me 3 hours a week. By the end, I had five.&rdquo;</p>
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

      {/* ── VALUE STACK ── */}
      <section className="value-stack" id="pricing">
        <div className="container">
          <div className="value-stack-box">
            <h2 className="value-stack-headline">Everything you get with our <span style={{ color: 'var(--accent)' }}>{course.name}</span> Course</h2>
            <div className="value-stack-list">
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">4 core 90-minute live sessions over 2 weeks</span>
              </div>
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">Optional Wednesday Build Workshops with functional experts, included free for a year</span>
              </div>
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">Hands-on deliverables you can use in your work the next day</span>
              </div>
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">Access to private Leland AI Builder community</span>
              </div>
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">Weekly office hours with instructors</span>
              </div>
              <div className="value-stack-item">
                <span className="value-stack-check">&#10003;</span>
                <span className="value-stack-label">Full session recordings + access to every future AI Builder cohort for 1 year</span>
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
            {enrollUrl ? (
              <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg value-stack-cta" onClick={() => posthog.capture('cp--enroll_cta_click', { source: 'value-stack', level: id, cohort: selectedCohort?.iso })}>
                Enroll Now <span className="arrow">&rarr;</span>
              </a>
            ) : (
              <span className="btn btn-primary btn-lg value-stack-cta" style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>Coming Soon</span>
            )}
            <span className="value-stack-subtext">Next cohort: {course.nextCohort} &middot; Payment plans available</span>
          </div>
        </div>
      </section>

      {/* ── SAVE TIME ── */}
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
              <p className="save-time-cite">Those who invest in AI training are 2x more productive than those who try to use AI on their own, <strong>saving an average of 11 hours per week</strong>.</p>
              <span className="save-time-source">Source: London School of Economics</span>
            </div>
            <div className="save-time-right">
              <h2 className="save-time-headline">{course.saveTimeCopy}</h2>
              <p className="save-time-sub">Build automations that handle repetitive, manual work so you can spend more time focusing on higher-impact strategic and creative work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VP3: Work smarter with reusable skills ── */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(/assets/images/image2.jpg)' }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Work smarter with<br className="mobile-br" /> reusable skills and workflows</h2>
            <p>Advance beyond typing questions into ChatGPT by learning to build workflows, automate tasks, and create reusable skills that make AI work the way you want it to.</p>
          </div>
        </div>
      </section>

      {/* ── WHEN & WHERE ── */}
      <section className="when-where-section">
        <div className="container">
          <h2>A flexible and collaborative course structure to fit your busy schedule</h2>
          <div className="when-where-grid">
            <div className="when-where-item">
              <span className="when-where-icon">
                <img src="/assets/icons/calendar.svg" alt="calendar" className="when-where-svg-icon" />
              </span>
              <div>
                <h3>New cohort every 2 weeks</h3>
                <p>Next cohort: {course.nextCohort}. Pick the start date that works for you.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon">
                <img src="/assets/icons/globe.svg" alt="globe" className="when-where-svg-icon" />
              </span>
              <div>
                <h3>100% online</h3>
                <p>Attend live or watch recordings. All sessions available within 24 hours.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon">
                <img src="/assets/icons/clock.svg" alt="clock" className="when-where-svg-icon" />
              </span>
              <div>
                <h3>4 core sessions over 2 weeks</h3>
                <p>Two 90-minute sessions per week, plus weekly office hours.</p>
              </div>
            </div>
            <div className="when-where-item">
              <span className="when-where-icon">
                <img src="/assets/icons/clock.svg" alt="clock" className="when-where-svg-icon" />
              </span>
              <div>
                <h3>Optional Wednesday Build Workshops</h3>
                <p>Optional live workshops with functional experts across marketing, sales, finance, ops, and more — included free for a year.</p>
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
            <div className="when-where-item">
              <span className="when-where-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </span>
              <div>
                <h3>Access to Leland's exclusive AI community</h3>
                <p>Get daily AI news, tips to improve your workflow, and perspectives from peers in the AI Builder Program</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SESSION BREAKDOWN ── */}
      <section className="cp-section cp-sessions-section">
        <div className="container">
          <p className="cp-section-label">Session breakdown</p>
          <h2>4 core sessions, plus optional Build Workshops. Learn by building every time.</h2>
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

      {/* ── COLLAGE (levels 1-2 only) ── */}
      {id <= 2 && (
        <section className="cp-section cp-collage-section">
          <div className="container">
            <h2 className="cp-collage-heading">See what previous cohort members built</h2>
            <BuildCollage />
          </div>
        </section>
      )}

      {/* ── GET THIS EXPENSED ── */}
      <GetThisExpensed />

      {/* ── PROGRAM OVERVIEW ── */}
      <section className="accordion-section">
        <div className="container">
          <div className="accordion-section-header">
            <div className="accordion-section-header-text">
              <h2 className="accordion-section-headline">A program to fundamentally change the way you work</h2>
              <p className="accordion-section-sub">A 5-level sequence. Each level builds on the last.</p>
            </div>
            <LevelPyramid activeId={id} />
          </div>
          <div className="cp-program-next">
            {nextLevelCourse
              ? <p>Complete this course, then continue to <a href={`/level-${nextLevelCourse.id}`} className="cp-accent-link">{nextLevelCourse.name}</a> to go deeper.</p>
              : <p>You've reached the top. You now have the full AI Builder skill set.</p>
            }
            {' '}<a href="https://joinleland.typeform.com/to/Gp54Gdd4" target="_blank" rel="noopener noreferrer" className="cp-which-level-link">Not sure which level is right for you? &rarr;</a>
          </div>
        </div>
      </section>

      {/* ── VP2: Each session, build something ── */}
      <section className="value-props-section value-props-bg" style={{ backgroundImage: 'url(/assets/images/value-prop-2.jpg)' }}>
        <div className="container">
          <div className="value-prop-text">
            <h2>Each session, build something you'll use at work the next day</h2>
            <p>Every session ends with a deliverable you can put to work immediately. From automations to data analysis to personalized skills, you'll save hours every week.</p>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATION ── */}
      <section className="certification">
        <div className="container">
          <div className="cert-intro">
            <h2>Walk away certified.</h2>
            <p className="cert-desc">
              Every course in the series culminates in a verified certificate of completion from Leland. Finish all five and earn the full AI Builder designation, a signal to employers, clients, and colleagues that you operate at the highest level of AI proficiency.
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
                  <img src="/assets/seal.png" alt="Leland Verified Seal" className="cert-seal" />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src="/assets/logo-white.svg" alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed the</span>
                      <span className="cert-program">AI Builder Program</span>
                      <span className="cert-subprogram">Use AI to 10x Your Impact &middot; Build Agents That Work for You &middot; Create Autonomous Systems &middot; Design Multi-Agent Systems &middot; Ship AI Systems That Scale</span>
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
                  <img src="/assets/seal.png" alt="Leland Verified Seal" className="cert-seal" />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src="/assets/logo-white.svg" alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed</span>
                      <span className="cert-program">{course.name}</span>
                      <span className="cert-subprogram">Level 0{id} &middot; AI Builder Program</span>
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
                  <img src="/assets/seal.png" alt="Leland Verified Seal" className="cert-seal" />
                  <div className="cert-inner">
                    <div className="cert-header">
                      <img src="/assets/logo-white.svg" alt="Leland" className="cert-logo" />
                      <span className="cert-header-label">Certificate of Completion</span>
                    </div>
                    <div className="cert-body">
                      <span className="cert-awarded">This certifies that</span>
                      <span className="cert-name">Your Name Here</span>
                      <span className="cert-divider"></span>
                      <span className="cert-achievement">has successfully completed</span>
                      <span className="cert-program">Build Agents That Work for You</span>
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

      {/* ── ADVISOR CTA ── */}
      <section className="advisor-section">
        <div className="container">
          <div className="advisor-card">
            <h2>Not sure which course is right for you?</h2>
            <p>Book a free call with an advisor to find the right fit.</p>
            <a href={`${SALES_URL}?utm_content=advisor-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
              Schedule a Call <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOR TEAMS ── */}
      <section className="enterprise">
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
                  Talk with Our Team <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <p className="footer-cta-sub">Our next cohort starts {course.nextCohort}</p>
          <div className="cta-pair">
            <a href={`${SALES_URL}?utm_content=footer-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
              Talk with Our Team
            </a>
            {enrollUrl ? (
              <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('cp--enroll_cta_click', { source: 'footer', level: id, cohort: selectedCohort?.iso })}>
                Enroll Now <span className="arrow">&rarr;</span>
              </a>
            ) : (
              <span className="btn btn-primary btn-lg" style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>Coming Soon</span>
            )}
          </div>
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
