import React, { useState, useEffect, useRef } from 'react'
import { useNow } from '../now.js'
import { useSiteData } from '../siteData.jsx'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import Marquee from 'react-fast-marquee'
import CohortPicker from '../components/CohortPicker'
import './unified-offer.css' // loaded here, where SingleOfferPricing used to pull it in; many uo-* sections use it
import OutcomesSection from '../components/OutcomesSection'
import HappyPath from '../components/HappyPath'
import { unifiedCheckoutFor, withPartnerDiscount } from '../components/unifiedCheckout'
import { activePartner, offerPricing } from '../components/partnerOffer'
import CohortModal from '../components/CohortModal'
import FreeCourseModal from '../components/FreeCourseModal'
import { openCohortModal } from '../components/cohortModalStore'
import { orderReviews } from '../components/ReviewCard'
import ResultsCTASection from '../components/ResultsCTASection'
import StarRating from '../components/StarRating'
// Hero rating is pinned rather than read from the live S3 feed.
//
// DISPUTED as of 2026-08-12. The BU Dashboard's "Avg AIBP Rating 4.77" sits under
// an "Engagement & Ratings (MTD)" header: it is August month-to-date over 13
// reviews. The "536" beside it is the all-time count, a different population.
// leland_analytics.ai.aibp_reviews, program = 'AI Builder', confirms both:
//   MTD Aug 2026 -> 13 reviews, 4.769
//   all-time     -> 536 reviews, 4.582
// So "4.8 stars from 536 reviews" attaches a 13-review average to a 536 count.
// Accurate pairings are 4.6/536 or 4.8/13.
//
// Decision 2026-10-13: the page shows Leland-wide reviews everywhere, marked with
// a * that points to a footer note giving the program's own all-time rating
// (4.6 from 536, the accurate pairing above).
const LELAND_RATING_AVG = 4.99
const LELAND_RATING_COUNT = '35,482'
const PROGRAM_RATING_AVG = 4.6
const PROGRAM_RATING_COUNT = 536
import { COURSE_COHORTS, courseData } from './courseData'
import { BorderBeam } from 'border-beam'
import './home-rebrand.css'
import './leland-ai.css'
import './program.css'

// Checkout link for the next open Level 1 cohort. Takes `now` from useNow() so the
// build-time HTML and the browser agree (see src/now.js).
function nextEnrollUrl(now) {
  const cohorts = COURSE_COHORTS[1] || []
  const next = cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now)
    || cohorts.find(c => c.enrollUrl && !c.soldOut)
  return next?.enrollUrl || cohorts[0]?.enrollUrl
}

// "June 22" for the next open Level 1 cohort. Takes `now` from useNow().
function nextCohortDisplay(now) {
  const l1 = COURSE_COHORTS[1] || []
  const next = l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso) && new Date(c.iso + 'T15:00:00Z') >= now)
    || l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso))
  const target = next ? new Date(next.iso + 'T15:00:00Z') : new Date('2026-06-22T15:00:00Z')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[target.getUTCMonth()]} ${target.getUTCDate()}`
}
const SALES_URL = 'https://form.typeform.com/to/bZuwV6t5'

// These CTAs sit next to team-facing copy, so utm_campaign=teams tags them for
// attribution. They deliberately do NOT preselect the Typeform's triage question:
// everyone who arrives from /program answers "Who are you looking to level up
// with AI?" themselves, and the form routes on what they actually said. Do not
// reintroduce an #answers-triage= anchor here.
const teamsUrl = placement =>
  `${SALES_URL}?utm_source=program-lp&utm_medium=${placement}&utm_campaign=teams`
const SCHOLARSHIP_URL = 'https://joinleland.typeform.com/to/TEiacu5G?utm_campaign=landing_page_cta&utm_source=website&utm_medium=web'

// The nav CTA is a generic site-wide button with no team framing, so it gets the
// same plain URL the leland.ai nav CTA uses, just tagged to /program.
const NAV_SALES_URL = 'https://joinleland.typeform.com/to/bZuwV6t5?utm_source=program-lp'

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
        href="#cohort-dates"
        className="cd-link"
        onClick={(e) => {
          e.preventDefault()
          const el = document.getElementById('cohort-dates')
          if (el) {
            const navHeight = document.querySelector('.rb-nav')?.offsetHeight || 60
            const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16
            window.scrollTo({ top, behavior: 'smooth' })
          }
        }}
      >
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

// Where /reviews should send people back to. This page answers to both /program
// and /program-single-price, so pass the current path rather than hardcoding one.
// ReviewsPage validates the value against a whitelist.
function reviewsHref() {
  const here =
    typeof window === 'undefined'
      ? 'program'
      : window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '')
  return `/reviews?from=${here || 'program'}`
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

// Reviews: two company results, then a scrolling row of individual reviews
// read from the live featured-reviews list. **bold** in a review becomes a
// highlight. The accounting-team review is skipped: it's the graduate quote
// directly above this section.
const COMPANY_RESULTS = [
  {
    company: 'Ethisphere', person: 'Udit Pillay, Chief Revenue Officer', photo: 'udit-pillay.jpg',
    stats: [['50%', 'increase in company AI maturity'], ['27', 'people building across Levels 1–3']],
  },
  {
    company: '47G', person: 'Gerritt Vander Linden, Partnerships', photo: 'gerritt-vander-linden.jpg',
    stats: [['1.5 hrs', 'saved per event on research and outreach'], ['200+', 'member companies managed with AI']],
  },
]

function highlightBold(text) {
  return String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

function TestimonialsBoard() {
  const reviews = useSiteData('featured-reviews.json') || []

  const mapped = reviews
    .filter(r => !/40 hours of work each quarter/.test(r.review || ''))
    .map(r => ({
      name: r.display_name,
      subtitle: r.level === 'L2' ? 'Completed Level 2' : 'Completed Level 1',
      text: r.review,
    }))
  // Same ordering as before: strongest named reviews first, anonymous spread out.
  const ordered = orderReviews(mapped)

  return (
    <section className="prog-revs" id="testimonials">
      <div className="container">
        <div className="prog-revs-head">
          <div>
            <span className="prog-eyebrow">Reviews</span>
            <h2 className="prog-h2">Companies already building.</h2>
            <p className="prog-revs-count">
              <span className="prog-revs-star" aria-hidden="true">&#9733;</span>
              {LELAND_RATING_AVG} from {LELAND_RATING_COUNT} Leland reviews<a href="#reviews-note" className="prog-note-ref">*</a>
            </p>
          </div>
          <a href={reviewsHref()} className="prog-revs-link">See all reviews <span aria-hidden="true">&rarr;</span></a>
        </div>
        <div className="prog-revs-cc2">
          {COMPANY_RESULTS.map(c => (
            <article key={c.company} className="prog-revs-cc">
              <div className="prog-revs-cctop">
                <img src={`${import.meta.env.BASE_URL}assets/images/${c.photo}`} alt="" loading="lazy" />
                <div><b>{c.company}</b><span>{c.person}</span></div>
              </div>
              <div className="prog-revs-ccn">
                {c.stats.map(([n, label]) => <div key={label}><b>{n}</b><span>{label}</span></div>)}
              </div>
            </article>
          ))}
        </div>
      </div>
      {ordered.length > 0 && (
        <div className="prog-revs-row">
          <Marquee speed={36} pauseOnHover>
            {ordered.map((r, i) => {
              const anon = !r.name || r.name.trim().toLowerCase() === 'anonymous'
              return (
                <article key={i} className="prog-rv">
                  <span className="prog-rv-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  <p>{highlightBold(r.text)}</p>
                  <div className="prog-rv-who">
                    <span className="prog-rv-init" aria-hidden="true">{anon ? 'A' : r.name.trim()[0]}</span>
                    <div><b>{anon ? 'AI Builder graduate' : r.name}</b><span>{r.subtitle}</span></div>
                  </div>
                </article>
              )
            })}
          </Marquee>
        </div>
      )}
    </section>
  )
}

function ReviewsCarousel() {
  const reviews = useSiteData('featured-reviews.json') || []

  if (!reviews.length) return null

  return (
    <div className="reviews-carousel-wrap">
      <Marquee gradient gradientColor="#FFFFFF" gradientWidth={48} speed={32} pauseOnHover>
        {reviews.map((r, i) => (
          <a key={i} href={reviewsHref()} className="reviews-carousel-card">
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

const ORG_LOGOS = [
  { name: 'Salesforce', file: 'org-logos/salesforce.svg' },
  { name: 'Adobe', file: 'org-logos/adobe.svg' },
  { name: 'Cisco', file: 'org-logos/cisco.svg' },
  { name: 'Nike', file: 'org-logos/nike.svg' },
  { name: 'LinkedIn', file: 'org-logos/linkedin.svg' },
  { name: 'Figma', file: 'org-logos/figma.svg' },
  { name: 'Morgan Stanley', file: 'org-logos/morgan-stanley.svg' },
  { name: "McDonald's", file: 'org-logos/mcdonalds.svg' },
  { name: 'GitLab', file: 'org-logos/gitlab.svg' },
  { name: 'Walmart', file: 'org-logos/walmart.png' },
  { name: 'Cummins', file: 'org-logos/cummins.svg' },
  { name: 'Ulta Beauty', file: 'org-logos/ulta-beauty.svg' },
  { name: 'Rondo Energy', file: 'org-logos/rondo-energy.png' },
  { name: 'JCPenney', file: 'org-logos/jcpenney.svg' },
  { name: 'GSV', file: 'org-logos/gsv.png' },
  { name: 'The RealReal', file: 'org-logos/the-realreal.svg' },
  { name: 'Etsy', file: 'org-logos/etsy.svg' },
  { name: 'Miro', file: 'org-logos/miro.svg' },
  { name: 'Just Eat Takeaway', file: 'org-logos/just-eat-takeaway.svg' },
  { name: 'Beamery', file: 'org-logos/beamery.png' },
  { name: 'Ethisphere', file: 'org-logos/ethisphere.png' },
  { name: 'Degreed', file: 'org-logos/degreed.png' },
  { name: 'Angel Studios', file: 'org-logos/angel-studios.png' },
  { name: 'Stepful', file: 'org-logos/stepful.png' },
  { name: 'Rula', file: 'org-logos/rula.png' },
]

// Logos whose files have a solid background or a knocked-out mark, so the
// white filter turns them into a blank shape. They need white versions first.
const NOT_WHITE_SAFE = new Set(['Salesforce', 'LinkedIn', 'GSV', 'Ethisphere', 'Degreed', 'Angel Studios', 'Stepful', 'Rula'])

// Logo strip inside the dark hero: logos turned white, scrolling in a band
// that fades out at both edges.
function HeroLogos() {
  return (
    <div className="prog-hero-logos">
      <span className="prog-hero-logos-label">Trusted by teams at</span>
      <div className="prog-hero-logos-band">
        <Marquee speed={40} pauseOnHover>
          {ORG_LOGOS.filter((l) => !NOT_WHITE_SAFE.has(l.name)).map((l) => (
            <img
              key={l.name}
              src={`${import.meta.env.BASE_URL}assets/${l.file}`}
              alt={l.name}
              className="prog-hero-logo"
            />
          ))}
        </Marquee>
      </div>
    </div>
  )
}

// "Real results from real companies": three company case studies on a dark
// band, then Leland-wide scale numbers. Bars and squares animate in once the
// cards scroll into view.
const RESULT_CASES = [
  {
    company: 'PlayPower', industry: 'Manufacturing',
    big: '1,500', unit: '+', what: 'product spec sheets rebuilt',
    viz: 'bars',
    quote: <>&ldquo;It was a huge shift in the mindset of <mark>what&rsquo;s possible</mark>. Those excuses are almost gone.&rdquo;</>,
    name: 'Ryan Moats', title: 'VP Global Marketing', photo: 'ryan-moats.jpg',
  },
  {
    company: 'ASU+GSV Summit', industry: 'Education',
    big: '8', unit: 'hrs', what: 'of meeting prep automated every week',
    viz: 'week',
    quote: <>&ldquo;It put everyone in a <mark>builder mindset</mark>. Many didn&rsquo;t think it was possible to truly build something.&rdquo;</>,
    name: 'Lucy Baldwin', title: 'VP Product', photo: 'lucy-baldwin.jpg',
  },
  {
    company: '47G', industry: 'Aerospace & defense',
    big: '89', unit: '%', what: 'faster partnership plans',
    viz: 'clock',
    quote: <>&ldquo;I got <mark>more value out of that program</mark> for a thousand dollars than what I got out of my entire MBA.&rdquo;</>,
    name: 'Gerritt Vander Linden', title: 'Commercial Partnerships', photo: 'gerritt-vander-linden.jpg',
  },
]

function ResultViz({ kind }) {
  if (kind === 'bars') return (
    <div className="prog-res-viz" aria-hidden="true">
      <div className="prog-res-bar"><span>Scoped</span><i style={{ '--w': '100%' }} /><b>6 months</b></div>
      <div className="prog-res-bar hi"><span>Delivered</span><i style={{ '--w': '14%' }} /><b>Weeks</b></div>
    </div>
  )
  if (kind === 'week') return (
    <div className="prog-res-viz" aria-hidden="true">
      <div className="prog-res-week">
        {Array.from({ length: 40 }, (_, i) => <i key={i} className={i < 8 ? 'on' : ''} />)}
      </div>
      <span className="prog-res-vcap">40-hour week · 8 hours handed to agents</span>
    </div>
  )
  return (
    <div className="prog-res-viz" aria-hidden="true">
      <div className="prog-res-clock">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#FFD96F" strokeWidth="10" strokeLinecap="round" strokeDasharray="34.9 314.2" transform="rotate(-90 60 60)" />
        </svg>
        <div><b>45 min</b><span>before</span><b className="y">5 min</b><span>now</span></div>
      </div>
    </div>
  )
}

function ResultsSection() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="prog-results" id="results">
      <div className="prog-results-glow" aria-hidden="true" />
      <div className="prog-wrap">
        <div className="prog-results-head">
          <span className="prog-eyebrow prog-eyebrow-light">Results</span>
          <h2 className="prog-results-h2">Real results from real companies.</h2>
          <p className="prog-results-sub">Measured at the company level, not just the classroom.</p>
        </div>
        <div ref={ref} className={`prog-results-grid${inView ? ' is-in' : ''}`}>
          {RESULT_CASES.map(c => (
            <article key={c.company} className="prog-res-card">
              <div className="prog-res-top"><span className="prog-res-co">{c.company}</span><span className="prog-res-ind">{c.industry}</span></div>
              <div className="prog-res-big">{c.big}<em>{c.unit}</em></div>
              <p className="prog-res-what">{c.what}</p>
              <ResultViz kind={c.viz} />
              <p className="prog-res-quote">{c.quote}</p>
              <div className="prog-res-person">
                <img src={`${import.meta.env.BASE_URL}assets/images/${c.photo}`} alt="" loading="lazy" />
                <div><b>{c.name}</b><span>{c.title}</span></div>
              </div>
            </article>
          ))}
        </div>
        <div className="prog-results-scale">
          <div><b>308K+</b><span>people trained on AI</span></div>
          <div><b>1,000+</b><span>companies</span></div>
          <div><b>1M+</b><span>people served</span></div>
          <div><b>100+</b><span>countries</span></div>
          <div><b>{LELAND_RATING_AVG}<i>&#9733;</i></b><span>{LELAND_RATING_COUNT} Leland reviews<a href="#reviews-note" className="prog-note-ref">*</a></span></div>
        </div>
        <div className="prog-results-foot">
          <a href={NAV_SALES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'results' })}>Request a demo</a>
          <a href="#testimonials" className="prog-results-link">Read graduate reviews <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </section>
  )
}

// "How a rollout works": three steps. Tabs reuse The shift's pill tabs; the
// right panel shows an illustrative proficiency chart (Assess, Transform) or a
// real lesson screenshot (Enable).
const ROLLOUT_BARS = [
  { name: 'Sales', a: 34, b: 78, base: '1.6', gain: '+2.1' },
  { name: 'Marketing', a: 48, b: 86, base: '2.2', gain: '+2.4' },
  { name: 'Finance', a: 22, b: 64, base: '1.1', gain: '+1.8' },
  { name: 'Operations', a: 30, b: 72, base: '1.4', gain: '+2.0' },
]

const ROLLOUT_STEPS = [
  {
    tab: 'Assess',
    title: 'See where everyone really is.',
    body: 'A proficiency baseline by function and level, then a strategy session with your leadership team.',
    get: 'A baseline report and a use-case map',
  },
  {
    tab: 'Enable',
    title: 'Build on real work.',
    body: 'Live cohorts, self-paced lessons, expert coaching for leaders, and a TA for every person.',
    get: 'Working automations your team owns',
  },
  {
    tab: 'Transform',
    title: 'Prove what moved.',
    body: 'The same assessment again. Leadership gets an impact report, and everyone who finishes is certified.',
    get: 'A progress report against the baseline',
  },
]

function ProficiencyCard({ after }) {
  return (
    <div className="prog-how-card">
      <h4>AI proficiency <span>{after ? 'Baseline → now' : 'Baseline'}</span></h4>
      {ROLLOUT_BARS.map(r => (
        <div key={r.name} className="prog-how-bar">
          {r.name}
          <i style={{ '--a': `${r.a}%`, '--b': after ? `${r.b}%` : '0%' }} />
          <s>{after ? r.gain : r.base}</s>
        </div>
      ))}
      <div className="prog-how-legend">
        {after
          ? <><span><i style={{ background: '#C3BFB4' }} />Baseline</span><span><i style={{ background: '#222' }} />Now</span></>
          : <span><i style={{ background: '#C3BFB4' }} />Level 0–4</span>}
        <span>Illustrative</span>
      </div>
    </div>
  )
}

function RolloutSection() {
  const [step, setStep] = useState(0)
  const s = ROLLOUT_STEPS[step]
  return (
    <section className="prog-how" id="how">
      <div className="container prog-how-grid">
        <div className="prog-how-left">
          <span className="prog-eyebrow">How a rollout works</span>
          <h2 className="prog-h2">Assess. Enable. Transform.</h2>
          <p className="prog-sub">Most AI programs start with training. We start with a measurement, so leadership can see exactly what moved.</p>
          <div className="role-tabs prog-how-tabs" role="tablist" aria-label="Rollout steps">
            {ROLLOUT_STEPS.map((x, i) => (
              <button
                key={x.tab}
                type="button"
                role="tab"
                aria-selected={i === step}
                className={'role-tab' + (i === step ? ' role-tab-active' : '')}
                onClick={() => setStep(i)}
              >
                {x.tab}
              </button>
            ))}
          </div>
          <div className="prog-how-step" key={step}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <div className="prog-how-get"><b>You get</b>{s.get}</div>
          </div>
        </div>
        <div className="prog-how-panel" key={`panel-${step}`}>
          {step === 1
            ? <div className="prog-how-shot"><img src={`${import.meta.env.BASE_URL}assets/images/rollout-lesson.jpg`} alt="A guided build lesson in the AI Builder Program" loading="lazy" /></div>
            : <ProficiencyCard after={step === 2} />}
        </div>
      </div>
    </section>
  )
}

// Graduate quote with a before/after stat. Quote and numbers come from a real
// verified Level 1 review (public/data/featured-reviews.json). The reviewer
// estimated "maybe 40 minutes", so the after number is labeled an estimate.
function GraduateQuote() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="prog-face">
      <div className="container prog-face-grid">
        <div>
          <p className="prog-face-quote">&ldquo;We built a skill that saves our accounting team <mark>roughly 40 hours of work each quarter</mark>. This has been HUGE for&nbsp;us.&rdquo;</p>
          <div className="prog-face-who">
            <span className="prog-face-init" aria-hidden="true">A</span>
            <div><b>AI Builder graduate</b><span>Completed Level 1 · verified review</span></div>
          </div>
        </div>
        <div ref={ref} className={`prog-face-res${inView ? ' is-in' : ''}`}>
          <div className="prog-face-num">40 hrs <em>&rarr; 40 min</em></div>
          <p>quarterly reporting for 25 customer reports, by the team&rsquo;s estimate</p>
          <div className="prog-face-cmp">
            <div><span>Before</span><i style={{ '--w': 1 }} /><b>40 hrs</b></div>
            <div><span>After</span><i className="hi" style={{ '--w': 0.04 }} /><b>~40 min</b></div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing card for individuals, built as a sibling of the company card below it
// (same white card, same two-column layout) so the section reads as a pair.
// Price comes from offerPricing(), so partner routes like /scaling show their
// discount here too.
const INDIVIDUAL_INCLUDES = [
  'Live Level 1 cohort, starting every two weeks',
  'AI Builder Foundations, plus Levels 2–5 on demand',
  'Weekly office hours and a dedicated TA',
  'Function-specific blueprints and agent templates',
  'Curriculum updated weekly by AI experts',
  'Builder community and a verified certificate',
]

function IndividualPriceCard({ partner }) {
  const now = useNow()
  const { price, listPrice, discountLabel } = offerPricing(partner)
  return (
    <div className="prog-pc prog-pc-individual">
      <div className="prog-pc-intro">
        <span className="prog-pc-eb">For individuals</span>
        <h3>AI Builder Program</h3>
        <div className="prog-pc-price">
          <span className="prog-pc-amount">{price}</span>
          {listPrice && <span className="prog-pc-list">{listPrice}</span>}
        </div>
        {discountLabel && <span className="prog-pc-discount">{discountLabel}</span>}
        <p>Everything you need to build real AI systems for your own work, starting with a live cohort.</p>
        <div className="prog-pc-btns">
          <button
            type="button"
            className="prog-pc-btn"
            onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'pricing-individual' }); openCohortModal('pricing-individual') }}
          >
            Enroll now &rarr;
          </button>
          <span className="prog-pc-next">Next cohort starts {nextCohortDisplay(now)}</span>
        </div>
      </div>
      <div className="prog-pc-right">
        <div className="prog-pc-core">
          <span className="prog-pc-ch">What&rsquo;s included</span>
          <div className="prog-pc-t">Everything in the program</div>
          <ul>
            {INDIVIDUAL_INCLUDES.map(item => (
              <li key={item}><img className="prog-pc-ck" src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" /><span>{item}</span></li>
            ))}
          </ul>
        </div>
        <div className="prog-pc-add prog-pc-finaid">
          <img className="prog-pc-finaid-icon" src={`${import.meta.env.BASE_URL}assets/product-illustrations/scholarships.svg`} alt="" />
          <div>
            <span className="prog-pc-ch r">Scholarships</span>
            <p>Anyone can apply. Cost should never be the reason you don&rsquo;t learn AI.</p>
          </div>
          <a
            href={`${SCHOLARSHIP_URL}&utm_content=pricing-finaid`}
            target="_blank"
            rel="noopener noreferrer"
            className="prog-pc-finaid-link"
            onClick={() => posthog.capture('app--scholarship_click', { source: 'pricing' })}
          >
            Apply for a scholarship &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}

function getDefaultCohort(cohorts, now) {
  return (
    cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now) ||
    cohorts.find(c => c.enrollUrl && !c.soldOut) ||
    cohorts[0]
  )
}

function FoundationsAccordionItem({ open, onToggle }) {
  return (
    <div className={`accordion-item${open ? ' open' : ''}`} id="foundations">
      <div className="accordion-header" onClick={onToggle}>
        <div className="accordion-header-left">
          <span className="accordion-level">00</span>
          <div className="accordion-header-text">
            <h3 className="accordion-title" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              AI Builder Foundations
            </h3>
            <p className="accordion-tagline">Learn the basics of building with AI.</p>
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
                <p className="accordion-overview">A free, hands-on introduction to using AI as a real tool in your work and life. Fully async and self-paced, so you can start today and move at your own speed.</p>
                <div className="accordion-detail-block">
                  <span className="accordion-detail-label">Who it's for</span>
                  <p className="accordion-detail-text">Designed for anyone new to AI, or anyone who wants a stronger knowledge of the fundamentals before enrolling in Level 1. No coding experience or paid AI subscription required.</p>
                </div>
                <div className="accordion-detail-block">
                  <span className="accordion-detail-label">What you'll get</span>
                  <ul className="accordion-detail-list">
                    <li><img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="accordion-detail-check" /><span>Four core modules covering the fundamentals of building with AI</span></li>
                    <li><img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="accordion-detail-check" /><span>Hands-on builds that give you real experience with AI tools</span></li>
                    <li><img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="accordion-detail-check" /><span>Optional advanced tracks on security, honesty, and cost</span></li>
                  </ul>
                </div>
              </div>
              <div className="accordion-meta">
                <div className="accordion-meta-row">
                  <span className="accordion-meta-label">Format</span>
                  <span className="accordion-meta-value">Fully Async &middot; Self-Paced</span>
                </div>
                <div className="accordion-meta-row">
                  <span className="accordion-meta-label">Schedule</span>
                  <span className="accordion-meta-value">Start Anytime</span>
                </div>
                <hr className="accordion-meta-divider" />
                <div className="accordion-price-row">
                  <span className="accordion-price">Free</span>
                  <span className="accordion-price-sub">The free starting line of the AI Builder Program</span>
                </div>
                <a href="https://www.lelandcourses.com/ai-builder/foundations/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => posthog.capture('app--foundations_cta_click', { source: 'course-accordion' })}>
                  Start Free
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

function CourseAccordionItem({ course, open, onToggle }) {
  // Until the visitor picks a cohort, the default follows today's date.
  const now = useNow()
  const [pickedCohort, setSelectedCohort] = useState(null)
  const selectedCohort = pickedCohort ?? getDefaultCohort(course.cohorts, now)
  const [showAllMobile, setShowAllMobile] = useState(false)
  const enrollUrl = withPartnerDiscount((selectedCohort && !selectedCohort.soldOut ? selectedCohort.enrollUrl : null) ?? course.enrollUrl)
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
                  <span className="accordion-price">Included</span>
                  <span className="accordion-price-sub">Every level is included in the {offerPricing().price} program</span>
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
          <span className="prog-eyebrow">The shift</span>
          <h2 className="role-uses-headline">When everyone builds, every function moves.</h2>
          <p className="role-uses-sub">Each team builds systems tuned to its own work. Pick a function to see what its builders ship.</p>
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
            <div className="role-agent-name">…and whatever you dream up</div>
            <div className="role-agent-desc">You'll have the skills to build for any workflow that eats your time.</div>
          </div>
        </div>
        <div className="role-uses-capper">
          <p className="role-uses-capper-text">Each session, you'll build something you can use at work the next day.</p>
          <p className="role-uses-capper-sub">You'll get the structure and expert support to build for your actual work, not generic exercises.</p>
        </div>
      </div>
    </section>
  )
}

function ValueStack({ id, showIncludes = true, showAdvisor = false, showTiers = true, headline = 'One price, the whole program', sub = 'No tiers to choose between. Every level is included, for individuals and for teams.' }) {
  const now = useNow()
  const CORE_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c42d15df04fb0e41cebd10%2C69c42e503e28f6893aca718e)'
  const ADVANCED_URL = 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69c433d93e28f6893acab6c9%2C69c433eddf04fb0e41cf2000)'

  const tiers = [
    {
      key: 'everything',
      name: 'The AI Builder Program',
      sub: 'Foundations + Levels 1\u20135',
      meta: 'One price. Every level included.',
      badge: 'Everything included',
      featured: true,
      price: offerPricing().price,
      crossed: offerPricing().listPrice,
      monthly: null,
      cta: 'Reserve your seat',
      enrollUrl: nextEnrollUrl(now),
      utm: 'value-stack-everything',
      buildsHeader: "What you'll build",
      builds: [
        'A custom-designed product, built without code',
        'An inbox automation in your voice',
        'A data + presentation workflow that builds itself',
        'Cloud-based automations that run on their own',
        'Autonomous agents you trust on full auto-approve',
        'Goal-directed AI employees with weekly quotas',
        'Production AI systems that improve themselves',
      ],
      stats: [
        ['6 levels', 'Foundations through Level 5'],
        ['40+ hours', 'live online instruction'],
      ],
    },
  ]

  return (
    <section className={`value-stack${id ? '' : ' value-stack-secondary'}`} id={id || undefined}>
      <div className="container">
        <h2 className="value-stack-section-headline">{headline}</h2>
        <p className="value-stack-section-sub">{sub}</p>
        {showTiers && <div className="value-stack-grid value-stack-grid-single">
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
                  <button
                    type="button"
                    className="btn btn-primary btn-lg value-stack-card-cta"
                    onClick={() => { posthog.capture('app--enroll_cta_click', { source: tier.utm }); openCohortModal(tier.utm) }}
                  >
                    {tier.cta}
                  </button>
                  <a href={learnMoreHref} className="value-stack-learn-more">
                    See details
                  </a>
                </div>
              </div>
            )
          })}
        </div>}
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
          <h2>Have questions about the program?</h2>
          <p>Book a free call with an advisor and we will walk you through it.</p>
          <a href={`${SALES_URL}?utm_content=advisor-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'advisor' })}>
            Schedule a call
            <span className="arrow">&rarr;</span>
          </a>
        </div>
        )}
        {showIncludes && (
        <div className="value-stack-included">
          <span className="value-stack-included-eyebrow">Every purchase includes&hellip;</span>
          <div className="value-stack-included-grid">
            {[
              ['Every Level Included', 'Foundations through Level 5, all in the one purchase. Team seats include a full year of access.', 'scheduling.svg'],
              ['Best Program Guarantee', 'Money-back if you find a better AI program anywhere.', 'guarantee.svg'],
              ['Weekly Build Workshops', 'Optional live workshops with functional experts in marketing, sales, finance, ops, and more.', 'ideation.svg'],
              ['Reimbursement Guarantee', "On a team of 10+? Put us on a call with your manager. If they don't reimburse you after it, we refund you in full.", 'retake.svg'],
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


const L1_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Next Level 1 cohorts only. Level 1 is the one live cohort everyone starts in, so
// dates for the other levels just add noise here.
function L1CohortStrip() {
  const today = useNow()
  today.setHours(0, 0, 0, 0)

  const all = (COURSE_COHORTS[1] || [])
    .filter(c => /^\d{4}-\d{2}-\d{2}/.test(c.iso))
    .map(c => {
      const d = new Date(`${c.iso.slice(0, 10)}T12:00:00Z`)
      return { ...c, d, daysOut: Math.round((d - today) / 86400000) }
    })
    .sort((a, b) => a.d - b.d)

  // Lead with the two most recent closed cohorts. They carry the sold-out state and
  // show the cadence is real, rather than the strip reading like dates nobody took.
  const past = all.filter(c => c.daysOut < 0).slice(-2).map(c => ({ ...c, soldOut: true }))
  // Only offer cohorts that have a unified-offer SKU. courseData.js is shared with
  // the live /program page and its enrollUrls point at the old per-level bootcamp,
  // so falling back to them here would quietly sell the wrong product.
  const upcoming = all
    .filter(c => c.daysOut >= 0)
    .map(c => ({ ...c, enrollUrl: unifiedCheckoutFor(c.iso) }))
    .filter(c => c.enrollUrl)
    .slice(0, 2)
  const cohorts = [...past, ...upcoming]

  if (!cohorts.length) return null
  const firstOpen = cohorts.find(c => !c.soldOut)

  return (
    <div className="l1-dates">
      <div className="l1-dates-head">
        <span className="l1-dates-label">Start here</span>
        <span className="l1-dates-note">The program includes a 2-week live portion and self-paced courses with optional live support.</span>
      </div>
      <div className="l1-dates-row">
        {cohorts.map(c => {
          const isNext = firstOpen && c.iso === firstOpen.iso
          const times = [...new Set(Object.values(c.sessionTimes || {}))]
          // scheduleDays on the in-person cohort carries a location after a middot
          // ("Tuesdays & Fridays · In person in Utah"), which would read as
          // "...in Utah for 2 weeks". Take the days and drop the rest.
          const days = (c.scheduleDays || '').split(' · ')[0]
          const Wrapper = c.soldOut ? 'div' : 'a'
          const props = c.soldOut
            ? {}
            : {
                href: c.enrollUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                onClick: () => posthog.capture('app--enroll_cta_click', { source: 'l1-date-strip', cohort: c.iso }),
              }
          return (
            <Wrapper key={c.iso} className={`l1-date${c.soldOut ? ' l1-date-out' : ''}`} {...props}>
              <span className="l1-date-big">{L1_MONTHS[c.d.getUTCMonth()]} {c.d.getUTCDate()}</span>
              {days && <span className="l1-date-dow">{days} for 2 weeks</span>}
              {times.length > 0 && <span className="l1-date-time">{times.join(' or ')}</span>}
              {c.soldOut ? (
                <span className="l1-date-tag l1-date-tag-out">Sold out</span>
              ) : (
                <span className={`l1-date-tag${isNext ? ' l1-date-tag-hot' : ''}`}>
                  {isNext
                    ? 'Filling fast'
                    : c.daysOut === 0 ? 'Starts today' : c.daysOut === 1 ? 'Starts tomorrow' : `Starts in ${c.daysOut} days`}
                </span>
              )}
            </Wrapper>
          )
        })}
      </div>
    </div>
  )
}

function VideoEmbed() {
  useEffect(() => {
    const playerScript = document.createElement('script')
    playerScript.src = 'https://fast.wistia.com/player.js'
    playerScript.async = true

    const embedScript = document.createElement('script')
    embedScript.src = 'https://fast.wistia.com/embed/6pv9oxdp3r.js'
    embedScript.async = true
    embedScript.type = 'module'

    document.head.appendChild(playerScript)
    document.head.appendChild(embedScript)

    return () => {
      document.head.removeChild(playerScript)
      document.head.removeChild(embedScript)
    }
  }, [])

  // The Wistia player loads behind Dave's poster from the start. The click calls
  // play() directly, so the browser counts it as the user's gesture and the video
  // starts on the first click instead of showing Wistia's own thumbnail.
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef(null)

  const start = () => {
    const player = playerRef.current
    if (player && typeof player.play === 'function') player.play()
    else if (player) player.setAttribute('autoplay', 'true')
    setPlaying(true)
    posthog.capture('app--video_play_click', { source: 'problem-section' })
  }

  return (
    <div className={`prog-video${playing ? ' prog-video-playing' : ''}`}>
      <wistia-player ref={playerRef} media-id="6pv9oxdp3r" aspect="1.7777777777777777"></wistia-player>
      {!playing && (
        <button type="button" className="prog-video-poster" aria-label="Play program overview video" onClick={start}>
          <img src={`${import.meta.env.BASE_URL}assets/images/program-overview-poster.jpg`} alt="" />
          <span className="prog-video-play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#222" /></svg>
          </span>
          <span className="prog-video-cap">Program overview · 5 min</span>
        </button>
      )}
    </div>
  )
}


// True once the element is within ~one screen of the viewport. Used to hold
// back background videos below the fold until they're about to be seen.
function useNearView(ref, margin = '600px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return near
}

// Pre-footer background video, loaded only when the pre-footer is close.
function PrefooterVideo() {
  const ref = useRef(null)
  const near = useNearView(ref)
  return (
    <video
      className="rb-prefooter-bg"
      ref={v => { ref.current = v; if (v) { v.muted = true; v.setAttribute('muted', '') } }}
      src={near ? `${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4` : undefined}
      autoPlay
      loop
      muted
      playsInline
    />
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
          ref={v => { if (v) { v.muted = true; v.setAttribute('muted', '') } }}
          src={imageUrl}
          alt=""
          style={{ transform: `scale(${imageScale})` }}
        />
        <div className="img-reveal-overlay" aria-hidden="true"></div>
        <div className="img-reveal-content">
          <h2 className="img-reveal-heading">Make your team the top 1% of AI users.</h2>
          <p className="img-reveal-desc">
            Skills, agents, and systems colleagues notice. Everyone who finishes earns a verified certificate and real outcomes to show for it.
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
          ref={v => { if (v) { v.muted = true; v.setAttribute('muted', '') } }}
          src={imageUrl}
          alt=""
          style={{ transform: `scale(${imageScale})` }}
        />
        <div className="img-reveal-overlay" aria-hidden="true"></div>
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
  const near = useNearView(sectionRef)

  return (
    <section className="why-reveal-section why-reveal-tight" ref={sectionRef}>
      <div
        className="why-reveal-container"
        style={{ transform: `scale(${containerScale})` }}
      >
        <video
          className="why-reveal-bg"
          ref={v => {
            if (!v) return
            v.muted = true
            v.setAttribute('muted', '')
            // Autoplay gets refused on iOS in Low Power Mode and whenever the
            // element is still offscreen. Retry on view and on first touch.
            const tryPlay = () => { const p = v.play(); if (p) p.catch(() => {}) }
            tryPlay()
            if (typeof IntersectionObserver !== 'undefined') {
              new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tryPlay() }))
                .observe(v)
            }
            const once = () => {
              tryPlay()
              window.removeEventListener('touchstart', once)
              window.removeEventListener('click', once)
            }
            window.addEventListener('touchstart', once, { passive: true, once: true })
            window.addEventListener('click', once, { once: true })
          }}
          src={near ? videoUrl : undefined}
          autoPlay
          loop
          muted
          playsInline
          style={{ transform: `scale(${mediaScale})` }}
        />
        <div className="why-reveal-content">
          <div className="why-reveal-left">
            <h2 className="why-reveal-heading">Learn the best practices for AI in&hellip;</h2>
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

export default function ProgramSinglePricePage() {
  return <ProgramSinglePriceInner />
}

function ProgramSinglePriceInner() {
  const now = useNow()
  const heroRef = useRef(null)
  // null on /program. Set on partner routes like /scaling, which serve this same
  // page with the partner's logo in the nav and their discount on the price.
  const partner = activePartner()

  useEffect(() => {
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    document.body.classList.add('uo-lp')

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
      document.body.classList.remove('uo-lp')
      if (ogMeta) ogMeta.setAttribute('content', prevOg)
      if (twMeta) twMeta.setAttribute('content', prevTw)
    }
  }, [])

  // Never auto-scroll on load. A hash left in the URL (from a CTA click, a shared
  // link, or a refresh) used to jump the page down before the reader saw the top.
  // Strip it and start at the top; in-page CTA clicks still scroll normally.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    window.scrollTo(0, 0)
  }, [])

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Starts false to match the build-time HTML; the resize effect sets it on mount.
  const [isMobile, setIsMobile] = useState(false)
  const navRef = useRef(null)
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
    onResize()
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
        { title: 'Build a Real Product with World-Class Design', sub: 'Create a new product in 90 minutes, without writing a line of code, using a design system that you love.', date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Automate Communication in Your Voice', sub: 'Connect your tools, teach AI how you write, build an email manager that runs on a schedule, and start building a custom automation for your own work.', date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Analyze Data and Design Presentations Instantly', sub: 'Go from a raw spreadsheet to clean insights and a polished, animated slide deck, no formulas or design tools required.', date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Launch Your Custom AI System + Demo Day', sub: 'Continue personalizing your AI system and show the cohort what you built.', date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' },
      ],
      cohorts: [
        { month: 'JUN', day: '22', date: 'June 22', label: 'June 22', iso: '2026-06-22', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 22', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 25', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Jun 29', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 2', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69f517038a2ab05f3e118b05)', soldOut: true },
        { month: 'JUL', day: '14', date: 'July 14 (Utah In-Person Option)', label: 'July 14 (Utah In-Person)', iso: '2026-07-14-utah', scheduleDays: 'Tuesdays & Fridays · In person in Utah', sessionTimes: { tuesday: '12pm PT / 1pm MT', friday: '12pm PT / 1pm MT' }, cohortSessions: [{ date: 'Tue, Jul 14', time: '12pm PT / 1pm MT' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 17', time: '12pm PT / 1pm MT' }, { date: 'Tue, Jul 21', time: '12pm PT / 1pm MT' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '12pm PT / 1pm MT' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a4e7860642598c0e564e73e)' },
        { month: 'JUL', day: '21', date: 'July 21', label: 'July 21', iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '3pm PT / 6pm ET' }, cohortSessions: [{ date: 'Tue, Jul 21', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'Tue, Jul 28', time: '8am or 3pm PT (11am or 6pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 31', time: '8am or 3pm PT (11am or 6pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231ba2455a49d4abda3c39)' },
        { month: 'AUG', day: '4', date: 'August 4', label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Tue, Aug 4', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 7', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'Tue, Aug 11', time: '8am or 2pm PT (11am or 5pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 14', time: '8am or 2pm PT (11am or 5pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231e65e0ed35ab57e2820e)' },
        { month: 'AUG', day: '17', date: 'August 17', label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Aug 17', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 20', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'Mon, Aug 24', time: '8am or 4pm PT (11am or 7pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 27', time: '8am or 4pm PT (11am or 7pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231fa5e0ed35ab57e28232)' },
        { month: 'SEP', day: '1', date: 'September 1', label: 'September 1', iso: '2026-09-01', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Tue, Sep 1', time: '8am or 12pm PT (11am or 3pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 4', time: '8am or 12pm PT (11am or 3pm ET)' }, { date: 'Tue, Sep 8', time: '8am or 12pm PT (11am or 3pm ET)' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Sep 11', time: '8am or 12pm PT (11am or 3pm ET)' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a4fd3ad5c417da5103a1abd)' },
      ],
      levelIndex: 0,
      price: 'Included',
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
        { title: 'Build and Ship Your Automation Roadmap', sub: 'Map where your time goes, build an AI automation roadmap, and deploy it as an interactive dashboard.', date: 'Mon, Jul 6', time: '10am PT / 1pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build a Cloud-Based Agentic Workflow and QA System', sub: 'Use n8n to design an agentic communication manager workflow that auto-responds to messages for you.', date: 'Thu, Jul 9', time: '10am PT / 1pm ET' },
        { title: 'Build Custom Agentic Automations', sub: 'Collaborate with AI to create automations that pull from real data to help you work more effectively.', date: 'Mon, Jul 13', time: '10am PT / 1pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Second Brain with AI + Demo Day', sub: 'Give your AI the domain knowledge it needs to run your automation well, and show the cohort what you built.', date: 'Thu, Jul 16', time: '10am PT / 1pm ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '5pm PT / 8pm ET', thursday: '5pm PT / 8pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '5pm PT / 8pm ET' }, { date: 'Mon, Jun 15', time: '5pm PT / 8pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '5pm PT / 8pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52df1cf3c823ab47ecd16)', soldOut: true },
        { month: 'JUL', day: '21', date: 'July 21', label: 'July 21', iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '10am PT / 1pm ET', friday: '10am PT / 1pm ET' }, cohortSessions: [{ date: 'Tue, Jul 21', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 24', time: '10am PT / 1pm ET' }, { date: 'Tue, Jul 28', time: '10am PT / 1pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Jul 31', time: '10am PT / 1pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a232210455a49d4abda3c91)' },
        { month: 'AUG', day: '4', date: 'August 4', label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '12pm PT / 3pm ET', friday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Tue, Aug 4', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 7', time: '12pm PT / 3pm ET' }, { date: 'Tue, Aug 11', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Fri, Aug 14', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a23232e455a49d4abda3c9d)' },
        { month: 'AUG', day: '17', date: 'August 17', label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '2pm PT / 5pm ET', thursday: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Mon, Aug 17', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 20', time: '2pm PT / 5pm ET' }, { date: 'Mon, Aug 24', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 27', time: '2pm PT / 5pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a2324f5e0ed35ab57e28294)' },
      ],
      levelIndex: 1,
      price: 'Included',
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
        { title: 'Build Your Agentic Operating System', sub: 'Set up your agent tool and create the foundational context files of your agentic operating system.', date: 'Tue, Jul 7', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your First Subagents', sub: 'Get better, broader output by training your agent to spin up specialist subagents for research and other specific tasks.', date: 'Fri, Jul 10', time: '8am PT / 11am ET' },
        { title: 'Strengthen Your Agents with Skills, Tools, and Context', sub: 'Scope what your agent owns, expand context to cover your real work, and connect the tools it needs to do that work.', date: 'Tue, Jul 14', time: '8am PT / 11am ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Evaluate Your Agent + Demo Day', sub: "Create a rubric and evals, wire an action logging system, and run tests to improve your agent until you're ready to deploy, then demo what you built.", date: 'Fri, Jul 17', time: '8am PT / 11am ET' },
      ],
      cohorts: [
        { month: 'JUN', day: '8', date: 'June 8', label: 'June 8', iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, cohortSessions: [{ date: 'Mon, Jun 8', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 11', time: '4pm PT / 7pm ET' }, { date: 'Mon, Jun 15', time: '4pm PT / 7pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jun 18', time: '4pm PT / 7pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)', soldOut: true },
        { month: 'AUG', day: '3', date: 'August 3', label: 'August 3', iso: '2026-08-03', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '12pm PT / 3pm ET', thursday: '12pm PT / 3pm ET' }, cohortSessions: [{ date: 'Mon, Aug 3', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 6', time: '12pm PT / 3pm ET' }, { date: 'Mon, Aug 10', time: '12pm PT / 3pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 13', time: '12pm PT / 3pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a2326fd455a49d4abda3d0c)' },
      ],
      levelIndex: 2,
      price: 'Included',
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
        { title: 'Scope Your AI Employee', sub: "Map your workflows, decide what belongs in each agent's domain, and architect a multi-agent system.", date: 'Tue, Jul 28', time: '2pm PT / 5pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Build Your Orchestrated Pipeline', sub: 'Wire your first real multi-agent system, connecting multiple specialized agents, coordinated by an orchestrator that decomposes tasks and routes work.', date: 'Fri, Jul 31', time: '2pm PT / 5pm ET' },
        { title: 'Host and Deploy Your Agent', sub: 'Set up your messaging gateway and host your agent system in the cloud so it runs without your laptop open.', date: 'Tue, Aug 4', time: '2pm PT / 5pm ET' },
        { title: 'Build Workshop (Optional)', sub: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.', date: 'TBD', time: 'TBD', optional: true },
        { title: 'Configure Recursive Improvement Loops + Demo Day', sub: 'Use persistence and memory to get your system to improve itself over time, then demo what you built.', date: 'Fri, Aug 7', time: '2pm PT / 5pm ET' },
      ],
      cohorts: [
        { month: 'JUL', day: '27', date: 'July 27', label: 'July 27', iso: '2026-07-27', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '2pm PT / 5pm ET', thursday: '2pm PT / 5pm ET' }, cohortSessions: [{ date: 'Mon, Jul 27', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Jul 30', time: '2pm PT / 5pm ET' }, { date: 'Mon, Aug 3', time: '2pm PT / 5pm ET' }, { date: 'TBD · Optional', time: 'Build Workshop' }, { date: 'Thu, Aug 6', time: '2pm PT / 5pm ET' }], enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)' },
      ],
      levelIndex: 3,
      price: 'Included',
      reversed: true,
      learnMoreUrl: '/level-4',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69b19c18d919910f303c9e76)',
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
      price: 'Included',
      reversed: false,
      learnMoreUrl: '/level-5',
      enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69e525cefe0055e715a6a025)',
    },
  ]

  const faqs = [
    {
      q: 'What does a team rollout include?',
      a: 'Everything your team needs. A kickoff to pick your first use cases, private cohorts built on those use cases, AI Foundations with its live First builds cohort, weekly office hours with a dedicated TA people can message anytime, function-specific blueprints and agent templates, the builder community, a before-and-after assessment, an admin dashboard to track progress, and a verified certificate for everyone who finishes.',
    },
    {
      q: 'How is pricing set for a company?',
      a: `It's sized to your team. Start with a private program, then add exec strategy sessions, expert sessions for each function, 1:1 coaching for leaders, a security review and DPA, or a named success strategist as you need them. <a href="${teamsUrl('faq-pricing')}" target="_blank" rel="noopener noreferrer">Talk to our team</a> for a quote.`,
    },
    {
      q: 'What does leadership see?',
      a: 'A proficiency baseline by function before the program starts, an admin dashboard to track progress along the way, and the same assessment again at the end, so leadership gets an impact report showing exactly what moved.',
    },
    {
      q: 'How long do people have access?',
      a: 'Team seats include a full year of access to everything, including office hours and re-enrollment in live cohorts. New hires get access automatically.',
    },
    {
      q: 'Do people have to attend live?',
      a: 'We recommend it, but no. First builds cohorts start every two weeks and run four 90-minute sessions across two weeks. Every session is recorded and the recordings stay available, so people can watch what they miss and bring questions to office hours.',
    },
    {
      q: 'Where do people start?',
      a: "Everyone starts with AI Foundations. If someone is new to AI, they begin with its self-paced Essentials, which build a foundation of understanding before the live First builds cohort.",
    },
    {
      q: 'What is AI Foundations?',
      a: "The shared baseline every person builds first, on the tools you already have. It has two parts: Essentials, a short self-paced course covering the fundamentals, and First builds, the live cohort where people build a real product, automate their email, analyze data and decks, and launch their own AI system.",
    },
    {
      q: 'What if AI tools change after I take the course?',
      a: "They will, which is why the curriculum gets rewritten continuously. While your access is active you're always seeing the current version, with whatever tools and techniques have replaced the old ones.",
    },
    {
      q: 'Is this for individuals or teams?',
      a: `Both. Most companies roll it out to teams, with centralized billing and custom use case workshops, and their people leave with skills, agents, and automations built for the business. Individuals can still reserve a seat. <a href="${teamsUrl('faq-teams')}" target="_blank" rel="noopener noreferrer">Talk to our team</a> about bringing it to yours.`,
    },
    {
      q: 'Are there discounts?',
      a: `Yes. Teams get volume pricing, and there is special pricing for nonprofit, education, and military organizations. Scholarships are open to anyone. <a href="${SCHOLARSHIP_URL}&utm_content=faq-scholarship" target="_blank" rel="noopener noreferrer">Apply for a scholarship</a>, or <a href="${SALES_URL}" target="_blank" rel="noopener noreferrer">talk to our team</a> and we will find the right option.`,
    },
    {
      q: 'Do I need coding experience?',
      a: "No. The program is built for knowledge workers. You'll learn technical concepts, but everything is taught for practical application over code. If you do have a technical background, the Orchestration and Operations disciplines go deep enough to challenge experienced builders.",
    },
    {
      q: 'Which AI tools do I need?',
      a: "Concepts are taught tool-agnostically, so bring whatever you already use. ChatGPT, Claude, and Gemini all work. We also use the terminal and workflow builders, and you can pick from several options there. Our team works from Claude and Claude Code, and that's what we recommend if you don't already have a preference.",
    },
    {
      q: 'Do I need a paid AI subscription?',
      a: "A paid plan at $20/month or higher for ChatGPT or Claude gets you faster responses, the full feature set, and the most capable models. It's strongly recommended if you want the full value of the program.",
    },
    {
      q: "What if I can't connect AI to the systems I need?",
      a: "Yes, and the program is designed for it. A core skill we teach is building effective AI workflows without touching your company's live data. You'll structure information manually, build automations around what you can access, and get real results inside whatever your IT policy allows. Connecting AI to other systems is taught as an optional capability.",
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
    { num: '01', tier: 'core', name: <>Use AI to 10x<br/>Your Impact</>, tagline: "Create AI tools and artifacts that amplify your impact.", href: '#level-1', learnMoreUrl: '/level-1', thumb: 'thumbnail-level1.png', cohortDate: 'July 21, 2026', fillingFast: true, featured: true },
    { num: '02', tier: 'core', name: <>Build Complex<br/>Agentic Workflows</>, tagline: 'Ship autonomous agents that handle real tasks end-to-end.', href: '#level-2', learnMoreUrl: '/level-2', thumb: 'thumbnail-level2.png', cohortDate: 'July 21, 2026', secondary: true },
    { num: '03', tier: 'core', name: <>Create Autonomous<br/>Agents</>, tagline: 'Build AI automations that operate as an autonomous system.', href: '#level-3', learnMoreUrl: '/level-3', thumb: 'thumbnail-level3.png', cohortDate: 'August 3, 2026' },
    { num: '04', tier: 'advanced', name: <>Build Your Agent<br/>Workforce</>, tagline: 'Orchestrate multiple agents that communicate and collaborate.', href: '#level-4', learnMoreUrl: '/level-4', thumb: 'thumbnail-level4.png', cohortDate: 'July 27, 2026' },
    { num: '05', tier: 'advanced', name: <>Design Your AI<br/>Orchestration Layer</>, tagline: 'Build production AI systems that proactively iterate toward goals.', href: '#level-5', learnMoreUrl: '/level-5', thumb: 'thumbnail-level5.png', cohortDate: 'September 1, 2026' },
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
            {partner ? (
              <>
                <span className="rb-nav-partner-x">&times;</span>
                <img
                  className="rb-nav-partner-logo"
                  src={`${import.meta.env.BASE_URL}assets/logos/${partner.logo}`}
                  alt={partner.name}
                />
              </>
            ) : (
              <>
                <span className="rb-nav-lockup-divider" />
                <img
                  className="rb-nav-aibp-logo"
                  src={`${import.meta.env.BASE_URL}assets/logos/${scrolled ? 'aibp-dark' : 'aibp-light'}.png`}
                  alt="AI Builder Program"
                />
              </>
            )}
          </div>
          <div className="rb-nav-actions">
            <button type="button" className="rb-nav-getstarted" onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'nav' }); openCohortModal('nav') }}>
              Enroll now
            </button>
            <a href={NAV_SALES_URL} target="_blank" rel="noopener noreferrer" className="rb-nav-signin" onClick={() => posthog.capture('app--sales_cta_click', { source: 'nav' })}>
              <span className="nav-cta-full">Request a demo</span>
              <span className="nav-cta-short">Get a demo</span>
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
          <a href="/" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Leland for Organizations</a>
          <a href="/program" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Builder Program</a>
          <a href={SALES_URL} target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/recruit" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Recruit</a>
          <a href="/pledge" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Our Pledge</a>
          <a href="https://www.lelandcourses.com/ai-builder/foundations/" target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Free Foundations Course</a>
        </div>
        <button type="button" className="lai-mobile-menu-cta" onClick={() => { setMenuOpen(false); posthog.capture('app--enroll_cta_click', { source: 'mobile-menu' }); openCohortModal('mobile-menu') }}>Enroll now</button>
        <a href={NAV_SALES_URL} target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-cta prog-mobile-menu-secondary" onClick={() => { setMenuOpen(false); posthog.capture('app--sales_cta_click', { source: 'mobile-menu' }) }}>Request a demo</a>
      </div>

      {/* ====== 2. Hero ====== */}
      <section className="hero" id="hero" ref={heroRef}>
        <video
          className="rb-hero-video"
          ref={v => { if (v) { v.muted = true; v.setAttribute('muted', '') } }}
          src={`${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="container">
          <Countdown />

          <span className="prog-hero-eyebrow">AI transformation for teams</span>

          <h1 className="hero-stagger hero-stagger-1">Bridge the gap between <br className="prog-desktop-br" />AI tools and real results</h1>

          <p className="hero-sub hero-stagger hero-stagger-2">Live, expert-led training that makes your team AI-native and turns everyday work into systems that scale, on the AI tools you already have.</p>

          <div className="hero-ctas hero-stagger hero-stagger-3">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'hero' }); openCohortModal('hero') }}
            >
              Enroll now
            </button>
            <a
              href={NAV_SALES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lai-cta-primary"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'hero' })}
            >
              Request a demo
            </a>
          </div>

          <p className="prog-hero-finaid hero-stagger hero-stagger-3">
            Need financing help?{' '}
            <a
              href={`${SCHOLARSHIP_URL}&utm_content=hero-finaid`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture('app--scholarship_click', { source: 'hero' })}
            >
              Apply for a scholarship
            </a>
          </p>

          <div className="hero-review-row hero-stagger hero-stagger-4">
            <StarRating value={LELAND_RATING_AVG} />

            <a
              href="#testimonials"
              className="hero-review-text hero-review-link"
              onClick={e => {
                // Scroll directly rather than letting the anchor do it. The hash
                // navigation sets the fragment but does not move the page here,
                // and this keeps a hash out of the URL, which would otherwise
                // jump anyone who reloads or shares the link.
                e.preventDefault()
                // window.scrollTo rather than scrollIntoView: smooth
                // scrollIntoView silently does nothing on this page, while
                // scrollTo works. Offset for the sticky header. Analytics comes
                // last so a blocked capture cannot swallow the scroll.
                const el = document.getElementById('testimonials')
                if (el) {
                  const nav = document.querySelector('.rb-nav-wrapper')
                  const top = el.getBoundingClientRect().top + window.scrollY - ((nav?.offsetHeight || 64) + 12)
                  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
                }
                try { posthog.capture('app--reviews_click', { source: 'hero-rating' }) } catch (err) { /* non-fatal */ }
              }}
            >
              {LELAND_RATING_AVG} stars from {LELAND_RATING_COUNT} Leland reviews*
            </a>
          </div>

          <HeroLogos />

          <div className="track-cards-section track-cards-v2" id="courses">
          </div>

        </div>
      </section>

      {/* ====== Next Level 1 cohorts ====== */}
      <div className="l1-dates-wrap" id="cohort-dates">
        <div className="container">
          <L1CohortStrip />
        </div>
      </div>



      {/* ====== Customer story: Ethisphere ====== */}
      <section className="prog-story" id="customers">
        <div className="container">
          <article className="prog-story-card">
            <div className="prog-story-photo">
              <img src={`${import.meta.env.BASE_URL}assets/images/udit-pillay.jpg`} alt="Udit Pillay" loading="lazy" />
            </div>
            <div className="prog-story-body">
              <span className="prog-story-eyebrow">Customer story · Ethisphere</span>
              <p className="prog-story-quote">&ldquo;The course probably accelerated our company&rsquo;s AI adoption by six months.&rdquo;</p>
              <div className="prog-story-who">
                <b>Udit Pillay</b>
                <span>Chief Revenue Officer, Ethisphere</span>
              </div>
            </div>
            <div className="prog-story-stats">
              <div><b>95%</b><span>of eligible staff through the program</span></div>
              <div><b>75%</b><span>now use AI every day</span></div>
              <div><b>6 months</b><span>ahead on AI adoption</span></div>
            </div>
          </article>
        </div>
      </section>

      {/* ====== 3. The problem ====== */}
      <section className="save-time-section" id="about">
        <div className="container">
          <div className="save-time-split">
            <div className="save-time-left">
              <VideoEmbed />
            </div>
            <div className="save-time-right">
              <span className="prog-eyebrow">The problem</span>
              <h2 className="save-time-headline">You bought the licenses. The work hasn&rsquo;t changed.</h2>
              <p className="save-time-sub">Access isn&rsquo;t adoption. Most rollouts stall because nobody shows people how to build on their own work. We do, function by function, until AI is part of how the company runs.</p>
              <p className="prog-stat-line"><b>85%</b> of employees say their AI training doesn&rsquo;t help them do their job. <span>Docebo, 2026</span></p>
              <div className="save-time-ctas">
                <button
                  type="button"
                  className="btn btn-primary save-time-explore-cta"
                  onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'video-section' }); openCohortModal('video-section') }}
                >
                  Enroll now
                </button>
                <a
                  href={NAV_SALES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost save-time-explore-cta"
                  onClick={() => posthog.capture('app--sales_cta_click', { source: 'video-section' })}
                >
                  Request a demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Use Cases by Role ====== */}

      <RoleUseCases />

      {/* ====== Results from real companies ====== */}
      <ResultsSection />

      {/* ====== Results CTA — see what people have built ====== */}
      <ResultsCTASection
        label="Graduate builds"
        heading="What your team will build."
        subhead="Real demos from graduates, built on their own work during the program."
      />

      {/* ====== Why — skills + tools ====== */}
      <WhyRevealSection toolPills={toolPills} skillPills={skillPills} />

      {/* ====== The happy path — level progression ====== */}
      <HappyPath />

      {/* ====== 12. Iceberg + 5-Course Accordion ====== */}
      {/* ====== What you'll walk out with (outcomes, not a syllabus) ====== */}
      <OutcomesSection />

      {/* ====== How a rollout works ====== */}
      <RolloutSection />

      {/* ====== For Teams (moved above the role section so the callout is a short jump) ====== */}
      <section className="enterprise" id="enterprise">
        <div className="container">
          <div className="enterprise-card">
            <div className="enterprise-card-content">
              <h2>AI transformation for the whole company.</h2>
              <p className="enterprise-desc">
                From 10-person startups to the Fortune 500. We assess where your people are, build alongside them on real work, and prove what moved with a before-and-after report for leadership.
              </p>
              <div className="enterprise-bottom">
                <ul className="enterprise-points">
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h3v1H2v2H1V1zM10 1h3v3h-1V2h-2V1zM1 10v3h3v-1H2v-2H1zM13 10v3h-3v-1h2v-2h1z" fill="currentColor"/><rect x="5" y="5" width="4" height="4" fill="currentColor"/></svg> Team support for 5 – 50,000</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="3" fill="currentColor"/><rect x="2" y="5.5" width="10" height="3" fill="currentColor"/><rect x="2" y="10" width="10" height="3" fill="currentColor"/></svg> Custom workshops available</li>
                  <li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="1" width="4" height="4" fill="currentColor"/><rect x="3" y="6" width="8" height="2" fill="currentColor"/><rect x="1" y="9" width="12" height="4" fill="currentColor"/></svg> Dedicated account manager</li>
                </ul>
                <a
                  href={teamsUrl('enterprise-section')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg enterprise-cta-loud"
                  onClick={() => posthog.capture('app--sales_cta_click', { source: 'enterprise' })}
                >
                  Request a demo
                  <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Graduate quote: 40 hrs to 40 min ====== */}
      <GraduateQuote />

      {/* ====== Take the first step: company pricing (no individual buy here) ====== */}
      <section className="uo-first-step" id="pricing">
        <div className="container">
          <h2 className="uo-first-step-headline">Take the first step.</h2>
          <p className="uo-first-step-sub">Bring AI into how your whole company works, or enroll yourself.</p>
        </div>
        <div className="container">
          <div className="prog-pc">
            <div className="prog-pc-intro">
              <span className="prog-pc-eb">For companies</span>
              <h3>Simple solution, scaled to your company.</h3>
              <p>Start with a private program for your team. Add leadership strategy, security and a rollout plan as you bring everyone along.</p>
              <div className="prog-pc-btns">
              <a
                href={teamsUrl('pricing-teams-card')}
                target="_blank"
                rel="noopener noreferrer"
                className="prog-pc-btn"
                onClick={() => posthog.capture('app--sales_cta_click', { source: 'pricing-teams-card' })}
              >
                Plan your rollout &rarr;
              </a>
              </div>
            </div>
            <div className="prog-pc-right">
              <div className="prog-pc-core">
                <span className="prog-pc-ch">The solution</span>
                <div className="prog-pc-t">Everything your team needs</div>
                <ul>
                  {['A kickoff to pick your first use cases', 'Private cohorts, built on your use cases', 'Content library, office hours and TAs', 'Before and after assessment', 'Admin dashboard to track progress', 'New hires get access automatically'].map(item => (
                    <li key={item}><img className="prog-pc-ck" src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" /><span>{item}</span></li>
                  ))}
                </ul>
              </div>
              <div className="prog-pc-add">
                <div className="prog-pc-add-hd">
                  <div><span className="prog-pc-ch r">Add-ons</span><span className="prog-pc-add-sub">For integrated rollouts</span></div>
                  <span className="prog-pc-opt">Optional</span>
                </div>
                <ul>
                  {['Exec strategy sessions', 'Expert sessions for each function', '1:1 coaching for your leaders', 'Security review and DPA', 'Curriculum fit to your policies', 'Named success strategist'].map(item => (
                    <li key={item}>
                      <svg className="prog-pc-plus" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#ffd667" /><path d="M8 4.5v7M4.5 8h7" stroke="#7d3c17" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <IndividualPriceCard partner={partner} />
          <p className="prog-pc-strip">
            Nonprofit, education or government?{' '}
            <a
              href={teamsUrl('pricing-special')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'pricing-special' })}
            >
              Ask about special pricing
            </a>
          </p>
        </div>
      </section>

      {/* ====== 4. Testimonials — Masonry board ====== */}
      <TestimonialsBoard />

      {/* ====== VP1 — Image Reveal ====== */}
      <ImageRevealSection />

      {/* ====== Certification — one real certificate, Level 1 ====== */}
      <section className="uo-cert" id="certification">
        <div className="container">
          <div className="uo-cert-grid">
            <div className="uo-cert-copy">
              <span className="uo-cert-eyebrow">Certification</span>
              <h2 className="uo-cert-headline">Everyone walks away certified.</h2>
              <p className="uo-cert-desc">
                Every course in the program culminates in a verified certificate of completion from
                Leland, signaling to employers, clients, and colleagues that you operate at the
                highest level of AI proficiency.
              </p>
            </div>
            <div className="uo-cert-art">
              <img
                src={`${import.meta.env.BASE_URL}assets/certificate-level-1-arntz.webp`}
                alt="Leland AI Builder Program Level 1 certificate of completion"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* advisor card sits under the pricing, not above it */}

      <section className="uo-advisor">
        <div className="container">
          <div className="advisor-card">
            <h2>Bringing this to your team?</h2>
            <p>Book a demo and we&rsquo;ll map the program to your functions, timeline, and goals.</p>
            <a
              href={`${SALES_URL}?utm_content=advisor-cta`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'advisor' })}
            >
              Request a demo
              <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

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
        <PrefooterVideo />
        <div className="rb-prefooter-fade" />
        <div className="rb-prefooter-content">
          <img
            className="rb-prefooter-logo"
            src={`${import.meta.env.BASE_URL}assets/logos/aibp-light.png`}
            alt="AI Builder Program"
          />
          <h2 className="rb-prefooter-heading">Next cohort starting <br />{nextCohortDisplay(now)}</h2>
          <a
            href="#pricing"
            className="btn btn-primary btn-lg"
            onClick={(e) => { e.preventDefault(); posthog.capture('app--enroll_cta_click', { source: 'prefooter' }); openCohortModal('prefooter') }}
          >
            Reserve your seat
          </a>
          <a
            href={NAV_SALES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="prog-prefooter-demo"
            onClick={() => posthog.capture('app--sales_cta_click', { source: 'prefooter' })}
          >
            Request a demo for your team
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
              <p className="prog-footer-note" id="reviews-note">* Leland reviews cover all Leland coaching, courses and programs. The AI Builder Program on its own is rated {PROGRAM_RATING_AVG} from {PROGRAM_RATING_COUNT} verified reviews.</p>
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

      <CohortModal />
      <FreeCourseModal />

    </>
  )
}
