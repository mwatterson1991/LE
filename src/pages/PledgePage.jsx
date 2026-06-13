import React, { useState, useEffect, useRef } from 'react'
import './home-rebrand.css'
import './leland-ai.css'
import './pledge.css'

const LELAND_ICON_WHITE = (
  <svg width="828" height="837" viewBox="0 0 828 837" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M416.453 623C525.88 623 624.257 667.51 692.244 738.336L602.778 827.49C590.719 839.506 571.181 838.906 557.874 828.289C520.213 798.241 470.696 780 416.453 780C362.171 780 312.622 798.266 274.95 828.351C261.624 838.995 242.04 839.587 229.98 827.528L140.724 738.271C208.709 667.484 307.059 623 416.453 623Z" fill="white"/>
    <path d="M221.116 448.049C282.094 427.309 347.87 416 416.453 416C572.955 416 714.84 474.876 818.452 570.369C830.536 581.506 830.363 600.376 818.736 611.99L729.44 701.183C651.686 621.758 540.243 572 416.453 572C292.889 572 181.628 621.575 103.893 700.746C90.5937 687.385 35.5412 631.9 8.71961 604.874C-0.163122 595.923 -2.50178 582.393 2.82555 570.964L258.185 23.1016C264.753 9.00953 278.892 0.000102792 294.44 0H429.953L221.116 448.049Z" fill="white"/>
    <path d="M600.871 0C622.813 0 637.332 22.7856 628.062 42.6738L472.944 375.472C454.013 373.838 434.837 373 415.453 373C379.199 373 343.671 375.922 309.122 381.527L486.953 0H600.871Z" fill="white"/>
  </svg>
)

const COUNTER_TARGET = 222742
const COUNTER_GOAL = 100000000

const TICKER_ITEMS = [
  { count: '+12', text: 'Priya joined AI Builder Cohort 08' },
  { count: '+1', text: 'Marcus RSVP\u2019d "Building with Claude"' },
  { count: '+3', text: 'Team at Stripe booked AI coaching' },
  { count: '+1', text: 'Leah completed "Vibe Coding 101"' },
  { count: '+8', text: 'Notion team enrolled in AI Builder' },
  { count: '+1', text: 'Sam RSVP\u2019d "Agent SDK Deep Dive"' },
  { count: '+2', text: 'Figma PMs booked AI coaching' },
]

export default function PledgePage() {
  const counterRef = useRef(null)
  const progressRef = useRef(null)
  const liveRef = useRef(COUNTER_TARGET)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    document.title = 'The 100 Million Pledge | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('rb-nav-menu-open', menuOpen)
    return () => document.body.classList.remove('rb-nav-menu-open')
  }, [menuOpen])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const wrapper = nav.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => { wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`) }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Animated count-up on load
  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      el.textContent = COUNTER_TARGET.toLocaleString()
    } else {
      const start = performance.now()
      const duration = 2200
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.round(COUNTER_TARGET * eased).toLocaleString()
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    // Animate progress bar
    requestAnimationFrame(() => {
      if (progressRef.current) {
        progressRef.current.style.width = ((COUNTER_TARGET / COUNTER_GOAL) * 100).toFixed(4) + '%'
      }
    })

    // Cosmetic live increment
    if (!reduceMotion) {
      const interval = setInterval(() => {
        if (Math.random() < 0.3) {
          liveRef.current += 1
          if (counterRef.current) {
            counterRef.current.textContent = liveRef.current.toLocaleString()
          }
          if (progressRef.current) {
            progressRef.current.style.width = ((liveRef.current / COUNTER_GOAL) * 100).toFixed(4) + '%'
          }
        }
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [])

  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <>
      {/* ===== NAV ===== */}
      <div className={`rb-nav-wrapper rb-nav-light${scrolled ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav lai-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="https://www.joinleland.com" className="rb-nav-logo">
              <img className="rb-logo-dark" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
            </a>
            <div className="lai-nav-links">
              <a href="/program" className="lai-nav-link">Builder Program</a>
              <a href="https://joinleland.typeform.com/to/nXD9kytE" target="_blank" rel="noopener noreferrer" className="lai-nav-link">Services</a>
              <a href="/recruit" className="lai-nav-link">Recruit</a>
              <a href="/pledge" className="lai-nav-link">Our Pledge</a>
            </div>
          </div>
          <div className="rb-nav-actions">
            <a href="#ways" className="rb-nav-getstarted">
              <span className="nav-cta-full">Join the pledge</span>
              <span className="nav-cta-short">Join the pledge</span>
            </a>
          </div>
          <button className="lai-nav-hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <div className="lai-mobile-menu">
        <div className="lai-mobile-menu-header">
          <img className="lai-mobile-menu-logo" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
          <span className="lai-mobile-menu-divider" />
          <span className="lai-mobile-menu-label">For Teams</span>
        </div>
        <button className="lai-mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <div className="lai-mobile-menu-links">
          <a href="/program" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Builder Program</a>
          <a href="https://joinleland.typeform.com/to/nXD9kytE" target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/recruit" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Recruit</a>
          <a href="/pledge" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Our Pledge</a>
        </div>
        <a href="#ways" className="lai-mobile-menu-cta" onClick={() => setMenuOpen(false)}>Join the pledge</a>
      </div>

      <main>
        {/* ===== HERO ===== */}
        <section className="plg-hero" id="counter">
          <div className="plg-section-container">
            <div className="plg-eyebrow">The 100 Million Pledge &middot; Live Counter</div>

            <h1>
              Teaching <em>100 million</em> people to thrive in the age of AI.
            </h1>

            <p className="plg-hero-sub">
              The world has already changed. AI is not coming, it&rsquo;s here. Leland is the home for ambition in the age of AI, and we exist to unlock human potential. Our pledge is simple: we refuse to let real people be left behind. One hundred million humans. Every RSVP, every cohort, every conversation counts.
            </p>

            <div className="plg-counter-card">
              <div className="plg-counter-head">
                <div className="plg-counter-head-label">Total AI learners on Leland</div>
                <div className="plg-counter-live">Live &middot; Updated hourly</div>
              </div>
              <div className="plg-counter-row" role="img" aria-label="222,742 people, of 100 million pledged, are learning AI on Leland so far">
                <div className="plg-counter-value" ref={counterRef} aria-hidden="true">0</div>
                <div className="plg-counter-of" aria-hidden="true">of <b>100,000,000</b> pledged</div>
              </div>
              <div className="plg-progress">
                <div className="plg-progress-fill" ref={progressRef} />
              </div>
              <div className="plg-progress-marks">
                <span>0</span><span>25M</span><span>50M</span><span>75M</span><span>100M</span>
              </div>
              <div className="plg-counter-foot">
                Today&rsquo;s count: every unique human who&rsquo;s RSVP&rsquo;d to an AI event on Leland, plus every AI Builder enrollee. Leland+ AI engagement and 1:1 AI coaching join the counter next. Every name moves us toward 100,000,000.
              </div>
            </div>

            <div className="plg-hero-ctas">
              <a href="#ways" className="btn btn-primary">Add your name</a>
              <a href="#manifesto" className="btn btn-secondary">Why 100 million</a>
            </div>
          </div>
        </section>

        {/* ===== TICKER ===== */}
        <div className="plg-ticker" aria-hidden="true">
          <div className="plg-ticker-track">
            {tickerDoubled.map((item, i) => (
              <span key={i}><b>{item.count}</b>{item.text}</span>
            ))}
          </div>
        </div>

        {/* ===== MANIFESTO ===== */}
        <section className="plg-section plg-bg-cream" id="manifesto">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">Why we&rsquo;re making this pledge</div>
            <h2 className="plg-section-title">We exist to unlock <em>human</em> potential.</h2>
            <p className="plg-section-sub">The world has already changed. AI is not coming, it&rsquo;s here. We refuse to let real people be left behind.</p>

            <div className="plg-manifesto-grid">
              <div>
                <p>AI is rewriting the economy in real time. Entire industries are being restructured. Job descriptions that existed six months ago are disappearing. New ones are being invented every week.</p>
                <p className="plg-dim">People feel it. They feel behind. They feel anxious. They know they need to act, but they don&rsquo;t know where to go.</p>
                <p className="plg-dim">In an AI world, intelligence is abundant. What&rsquo;s scarce is trust. What&rsquo;s scarce is community. What&rsquo;s scarce is the kind of human connection that actually changes outcomes. Leland is built around that reality.</p>
                <p className="plg-dim">So we&rsquo;re making a commitment. One hundred million people, learning AI on Leland. The counter moves every time someone on this mission makes progress.</p>
              </div>
              <div className="plg-quote-card">
                <blockquote>&ldquo;The world has already changed. AI is not coming, it&rsquo;s here. We refuse to let real people be left behind in the process.&rdquo;</blockquote>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">JK</div>
                  <div className="plg-quote-byline-text">
                    <b>John Koelliker</b>
                    Founder &amp; CEO, Leland
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WAYS TO JOIN ===== */}
        <section className="plg-section plg-bg-white" id="ways">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">Four ways to learn AI on Leland</div>
            <h2 className="plg-section-title">Pick your door. <em>Amplify your impact.</em></h2>
            <p className="plg-section-sub">Leland has the largest collection of AI events, courses, and coaches in the world. Start free, go deep, or get 1:1 guidance. Whatever gets you building.</p>

            <div className="plg-ways">
              <div className="plg-way">
                <span className="plg-way-tag">01 &middot; Free</span>
                <div className="plg-way-title">RSVP to an AI event</div>
                <div className="plg-way-desc">Live builds, expert panels, workshops every week. Free to attend. Bring a laptop, leave with something shipped.</div>
                <div className="plg-way-meta">Next event &middot; 3 days</div>
                <a href="https://www.joinleland.com/career/ai-automation-and-agents/events" className="plg-way-cta">See upcoming events</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">02 &middot; Membership</span>
                <div className="plg-way-title">Engage AI on Leland+</div>
                <div className="plg-way-desc">Self-serve AI content, live discussions, playbooks, and AI-powered career tools. The fastest, lowest-friction way in.</div>
                <div className="plg-way-meta">Leland+ &middot; Monthly</div>
                <a href="https://www.joinleland.com" className="plg-way-cta">Join Leland+</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">03 &middot; Cohort</span>
                <div className="plg-way-title">Join AI Builder</div>
                <div className="plg-way-desc">Our flagship program. Ship real AI products start to finish. Join the alumni community building together long after.</div>
                <div className="plg-way-meta">Next cohort &middot; Opens soon</div>
                <a href="https://ai.joinleland.com" className="plg-way-cta">Apply to AI Builder</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">04 &middot; 1:1</span>
                <div className="plg-way-title">Book an AI coach</div>
                <div className="plg-way-desc">Work directly with a coach who&rsquo;s built in production. Prompt engineering, agent design, team enablement, career pivots.</div>
                <div className="plg-way-meta">Book &middot; From $149</div>
                <a href="https://www.joinleland.com/search/career/ai-automation-and-agents" className="plg-way-cta">Browse AI coaches</a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="plg-section plg-bg-cream" id="proof">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">Learners on the journey</div>
            <h2 className="plg-section-title">What the <em>first 222,000</em> are saying.</h2>
            <p className="plg-section-sub">Real humans, real careers, real progress. The pledge is just getting started.</p>

            <div className="plg-proof">
              <div className="plg-quote-card plg-bordered">
                <div className="plg-quote-body">&ldquo;I came in thinking &lsquo;AI literacy&rsquo; was a buzzword. I left AI Builder with three products in production and two job offers from companies that found me through the demos.&rdquo;</div>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">PS</div>
                  <div className="plg-quote-byline-text"><b>Priya S.</b>AI Builder Cohort 07 &middot; now PM at Ramp</div>
                </div>
              </div>
              <div className="plg-quote-card plg-bordered">
                <div className="plg-quote-body">&ldquo;Our whole product team went through Leland AI coaching. Ship velocity went up 2x in the quarter after. Best L&amp;D dollar we&rsquo;ve spent.&rdquo;</div>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">MT</div>
                  <div className="plg-quote-byline-text"><b>Marcus T.</b>VP Product &middot; Series C SaaS</div>
                </div>
              </div>
              <div className="plg-quote-card plg-bordered">
                <div className="plg-quote-body">&ldquo;Showed up to one Leland event on a whim. Three months later I&rsquo;ve built my first agent, rewritten my workflow, and I&rsquo;m in Builder Cohort 08.&rdquo;</div>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">LK</div>
                  <div className="plg-quote-byline-text"><b>Leah K.</b>Designer &middot; freelance</div>
                </div>
              </div>
              <div className="plg-quote-card plg-bordered">
                <div className="plg-quote-body">&ldquo;I came to Leland for career help. I&rsquo;m leaving with an AI skillset I never thought I&rsquo;d have. That&rsquo;s the whole point of this mission.&rdquo;</div>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">SA</div>
                  <div className="plg-quote-byline-text"><b>Sam A.</b>Eng Manager &middot; Notion</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="plg-final">
          <div className="plg-section-container">
            <h2>This is <em>the beginning</em>.</h2>
            <p>One hundred million humans learning AI on Leland. It starts with you picking a door.</p>
            <div className="plg-final-ctas">
              <a href="#ways" className="btn btn-primary">Join the pledge</a>
              <a href="https://ai.joinleland.com" className="plg-btn-on-dark">Go to AI Builder &rarr;</a>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="plg-footer">
        <div className="plg-foot">
          <div className="plg-foot-mark" aria-label="Leland">
            {LELAND_ICON_WHITE}
          </div>
          <div>&copy; 2026 Leland &middot; The 100M Pledge</div>
          <div className="plg-foot-links">
            <a href="https://intercom.help/leland-help-center/en/">Contact</a>
            <a href="https://www.joinleland.com/legal/terms">Terms</a>
            <a href="https://www.joinleland.com/legal/privacy-policy">Privacy</a>
          </div>
        </div>
      </footer>
    </>
  )
}
