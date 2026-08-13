import React, { useState, useEffect, useRef } from 'react'
import { TextMorph } from 'torph/react'
import posthog from 'posthog-js'
import Marquee from 'react-fast-marquee'
import { BorderBeam } from 'border-beam'
import LPPopup from '../components/LPPopup'
import OverviewGate from '../components/OverviewGate'
import SingleOfferPricing from '../components/SingleOfferPricing'
import CohortModal from '../components/CohortModal'
import FreeCourseModal from '../components/FreeCourseModal'
import { openCohortModal } from '../components/cohortModalStore'
import GetThisExpensed from '../components/GetThisExpensed'
import ReviewCard, { orderReviews } from '../components/ReviewCard'
import ResultsCTASection from '../components/ResultsCTASection'
import StarRating from '../components/StarRating'
// Hero rating is pinned rather than read from the live S3 feed. The feed on
// 2026-08-11 returned avg_rating 4.58 / n_ratings 536, so the count is live-accurate
// but the average is not. Delete these two and go back to useRatingsData() to
// display whatever the feed actually says.
const HERO_RATING_AVG = 4.8
const HERO_RATING_COUNT = 536
import { COURSE_COHORTS, courseData } from './courseData'
import './home-rebrand.css'
import './leland-ai.css'
import './program.css'
import './unified-offer.css'

// Placeholder checkout: next open L1 cohort. Swap for the unified-offer SKU when it exists.
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
  const target = next ? new Date(next.iso + 'T15:00:00Z') : new Date('2026-08-04T15:00:00Z')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[target.getUTCMonth()]} ${target.getUTCDate()}`
})()

const SALES_URL = 'https://form.typeform.com/to/bZuwV6t5'
const SCHOLARSHIP_URL = 'https://joinleland.typeform.com/to/TEiacu5G?utm_campaign=landing_page_cta&utm_source=website&utm_medium=web'
// 2-page program overview PDF. Source: public/program-overview.html (re-render on content changes).
const PROGRAM_OVERVIEW_URL = '/ai-builder-program-overview.pdf'

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6"/>
  </svg>
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
    const target = nextCohort ? new Date(nextCohort.iso + 'T15:00:00Z') : new Date('2026-08-04T15:00:00Z')
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
        href="#core-program"
        className="cd-link"
        onClick={(e) => {
          e.preventDefault()
          const el = document.querySelector('#core-program')
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

  const mapped = reviews.map((r) => ({
    name: r.display_name,
    subtitle: r.level === 'L2' ? 'Completed Level 2' : 'Completed Level 1',
    date: '',
    stars: r.rating,
    text: r.review,
    photo_url: r.photo_url || null,
  }))

  const ordered = orderReviews(mapped)

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
          <h2 className="testimonials-heading">Hear from real program graduates.</h2>
        </div>

        <div className="tboard-wrap">
          <div className="tboard tboard-google">
            {columns.map((col, i) => (
              <div className="tboard-col" key={i}>
                {col.map((review, j) => (
                  <ReviewCard review={review} variant="google" key={j} />
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

function OrgLogosBand() {
  return (
    <section className="org-logos-section" id="org-logos" data-theme="light">
      <div className="container">
        <h2 className="org-logos-headline">We&rsquo;ve trained people from hundreds of top organizations to use AI more effectively</h2>
      </div>
      <div className="org-logos-marquee">
        <Marquee gradient gradientColor="#FFFFFF" gradientWidth={40} speed={60} pauseOnHover>
          {ORG_LOGOS.map((l) => (
            <span key={l.name} className="org-logo-cell">
              <img
                src={`${import.meta.env.BASE_URL}assets/${l.file}`}
                alt={l.name}
                className="org-logo-img"
              />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
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
    <section className="role-uses-section" id="builds">
      <div className="container">
        <div className="role-uses-header">
          <h2 className="role-uses-headline">Get hours back, whatever your role is.</h2>
          <p className="role-uses-sub">Learn to build AI systems tuned to your specific workflows. Select your role below for examples of what AI Builders are doing to transform their day-to-day.</p>
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
          <p className="role-uses-capper-text">You leave with a portfolio, not just knowledge.</p>
          <p className="role-uses-capper-sub">Every session you build something real. By the end of Level 1 you have a portfolio of 10+ skills, agents, and automations you can show your team, and it keeps growing from there.</p>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  const problems = [
    {
      title: 'AI is a chat window, not a system',
      body: 'You draft, summarize, and ask questions all day. But nothing you do in AI is connected to your actual tools, and nothing keeps running after you close the tab.',
    },
    {
      title: 'You start from scratch every time',
      body: 'Every session, you re-explain your business, your voice, your context. Nothing you taught it yesterday is there today.',
    },
    {
      title: 'The manual work never went away',
      body: 'The reports, the follow-ups, the research, the status updates. You know AI could handle most of it. You have never had time to figure out how.',
    },
    {
      title: 'Your team is all over the map',
      body: 'One person is deep in agents, three are still pasting into a chat window, and nobody shares what works. The gap widens every month.',
    },
  ]

  return (
    <section className="uo-problem" id="why">
      <div className="container">
        <div className="uo-problem-header">
          <span className="uo-problem-eyebrow">The gap</span>
          <h2 className="uo-problem-headline">Most people are using AI. Almost nobody is building with it.</h2>
          <p className="uo-problem-sub">
            Everyone has the same tools now. The difference between people getting a few minutes back and
            people getting whole days back is whether they can build with AI instead of just talking to it.
          </p>
        </div>

        <div className="uo-problem-grid">
          {problems.map((p, i) => (
            <div className="uo-problem-card" key={p.title}>
              <span className="uo-problem-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>

        <div className="uo-solution">
          <div className="uo-solution-main">
            <span className="uo-solution-eyebrow">The AI Builder Program</span>
            <h3 className="uo-solution-headline">You build the system instead. In every session.</h3>
            <p className="uo-solution-body">
              This is not a course you watch. Every session you build something real for your own work,
              with your own tools and your own use cases, and you leave with it running. Level 1 alone puts
              10+ skills, agents, and automations in your hands. From there it compounds.
            </p>
          </div>
          <ul className="uo-solution-list">
            <li><span>Chat window</span><em>&rarr;</em><strong>Connected systems</strong></li>
            <li><span>Re-explaining yourself</span><em>&rarr;</em><strong>AI that knows your context</strong></li>
            <li><span>Manual, every week</span><em>&rarr;</em><strong>Runs without you</strong></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function Guarantees() {
  return (
    <section className="uo-guarantees" id="guarantees">
      <div className="container">
        <div className="uo-guar-header">
          <span className="uo-guar-eyebrow">Our guarantees</span>
          <h2 className="uo-guar-headline">We take the risk, not you.</h2>
        </div>
        <div className="uo-guar-grid">
          <div className="uo-guar-card">
            <span className="uo-guar-tag">Reimbursement guarantee</span>
            <h3>Get it expensed, or get your money back.</h3>
            <p>
              If you are on a team of 10 or more, put us on a call with your manager. If they decide not to
              reimburse you for the AI Builder Program after that conversation, we refund your purchase in full.
            </p>
            <a
              href={SALES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="uo-guar-link"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'guarantee-reimbursement' })}
            >
              Set up the call &rarr;
            </a>
          </div>
          <div className="uo-guar-card">
            <span className="uo-guar-tag">Best program guarantee</span>
            <h3>Find a better AI program anywhere, and we pay you back.</h3>
            <p>
              We think this is the most practical, most current AI program you can take. If you find one that
              teaches you more about actually building with AI, tell us and we will refund you.
            </p>
            <a href="#faq" className="uo-guar-link">See the details &rarr;</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueStack() {
  const items = [
    ['Live Level 1 cohort', 'Four 90-minute sessions over two weeks, with a new cohort starting every two weeks.', 'group-sessions.svg'],
    ['Every level through Level 5', 'Foundations plus Levels 1 through 5, included in the same purchase.', 'digital-products.svg'],
    ['Weekly office hours', 'Live Q&A with instructors to unblock your specific builds.', 'office-hours.svg'],
    ['A dedicated TA', 'Message a real person any time you get stuck between sessions.', 'message.svg'],
    ['Build workshops', 'Optional live workshops with functional experts in marketing, sales, finance, ops, and more.', 'ideation.svg'],
    ['The function library', 'Blueprints, strategy guides, and skill and agent templates for your specific role.', 'session-notes.svg'],
    ['Curriculum updated weekly', 'Built by AI experts and rewritten as the tools change, so it never goes stale.', 'retake.svg'],
    ['Builder community', 'Trade ideas, get unstuck, and keep each other moving alongside other builders.', 'community.svg'],
    ['Verified certificate', 'A certificate for every level, and the full AI Builder designation when you finish.', 'guarantee.svg'],
  ]

  return (
    <section className="uo-vstack" id="whats-included">
      <div className="container">
        <div className="uo-vstack-header">
          <span className="uo-vstack-eyebrow">What you get</span>
          <h2 className="uo-vstack-headline">Everything is included. One price.</h2>
          <p className="uo-vstack-sub">No tiers, no upsells, no per-level pricing. The same thing for individuals and for teams.</p>
        </div>
        <div className="uo-vstack-grid">
          {items.map(([title, desc, illo]) => (
            <div className="uo-vstack-item" key={title}>
              <img src={`${import.meta.env.BASE_URL}assets/product-illustrations/${illo}`} alt="" className="uo-vstack-icon" loading="lazy" />
              <span className="uo-vstack-name">{title}</span>
              <span className="uo-vstack-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const FOUNDATIONS = {
  key: 'foundations',
  num: '00',
  badge: 'Self-paced · optional',
  name: 'AI Builder Foundations',
  blurb: 'Learn the basics of building with AI.',
  overview: 'A free, hands-on introduction to using AI as a real tool in your work and life. Fully async and self-paced, so you can start today and move at your own speed.',
  whoItsFor: "Designed for anyone new to AI, or anyone who wants a stronger grasp of the fundamentals before their first live session. No coding experience or paid AI subscription required.",
  whatYoullBuild: [
    'Four core modules covering the fundamentals of building with AI',
    'Hands-on builds that give you real experience with AI tools',
    'Optional advanced tracks on security, honesty, and cost',
  ],
  format: 'Fully async · self-paced',
  schedule: 'Start anytime',
  tone: 'zero',
}

const LEVEL_TONES = { 1: 'one', 2: 'two', 3: 'two', 4: 'adv', 5: 'adv' }

const LEVEL_BADGES = {
  1: 'Live cohort',
  2: 'Self-paced · live optional',
  3: 'Self-paced · live optional',
  4: 'Advanced',
  5: 'Advanced',
}

function levelEntry(level) {
  const d = courseData[level] || {}
  return {
    key: level,
    num: String(level).padStart(2, '0'),
    tone: LEVEL_TONES[level],
    badge: LEVEL_BADGES[level],
    name: d.name,
    blurb: d.ableToBlurb ? d.ableToBlurb.charAt(0).toUpperCase() + d.ableToBlurb.slice(1) : '',
    overview: d.heroSubheadline,
    whoItsFor: d.whoItsFor,
    whatYoullBuild: d.whatYoullBuild || [],
    whatYoullLearn: d.whatYoullLearn || [],
    sessions: (d.sessions || []).filter(s => !s.optional),
    tools: d.tools || [],
    format: '4 core sessions + 2 build workshops (optional)',
    schedule: level === 1
      ? 'Live cohort · 2 weeks · new cohorts every 2 weeks'
      : 'Self-paced · 2 weeks of material · optional live sessions',
  }
}

function LevelToggle({ entry, open, onToggle }) {
  return (
    <div className={`uo-lvl${open ? ' open' : ''}`}>
      <button type="button" className="uo-lvl-head" onClick={onToggle} aria-expanded={open}>
        <span className={`uo-lvl-tile uo-lvl-tile-${entry.tone}`}>
          <span className="uo-lvl-tile-word">Level</span>
          <span className="uo-lvl-tile-num">{entry.num}</span>
        </span>
        <span className="uo-lvl-heads">
          <span className="uo-lvl-nameline">
            <span className="uo-lvl-name">{entry.name}</span>
            {entry.badge && <span className="uo-lvl-badge">{entry.badge}</span>}
          </span>
          <span className="uo-lvl-blurb">{entry.blurb}</span>
        </span>
        <span className="uo-lvl-expand">
          <span className="uo-lvl-expand-text">{open ? 'Close' : 'See the curriculum'}</span>
          <ChevronIcon />
        </span>
      </button>
      <div className="uo-lvl-body">
        <div className="uo-lvl-body-inner">
          <div className="uo-lvl-grid">
            <div className="uo-lvl-main">
              {entry.overview && <p className="uo-lvl-overview">{entry.overview}</p>}

              {entry.whoItsFor && (
                <div className="uo-lvl-block">
                  <span className="uo-lvl-block-label">Who it&rsquo;s for</span>
                  <p className="uo-lvl-block-text">{entry.whoItsFor}</p>
                </div>
              )}

              {entry.sessions && entry.sessions.length > 0 && (
                <div className="uo-lvl-block">
                  <span className="uo-lvl-block-label">The four sessions</span>
                  <ol className="uo-lvl-sessions">
                    {entry.sessions.map((s, i) => (
                      <li key={s.title}>
                        <span className="uo-lvl-session-num">{i + 1}</span>
                        <span className="uo-lvl-session-text">
                          <span className="uo-lvl-session-title">{s.title}</span>
                          <span className="uo-lvl-session-desc">{s.description}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {entry.whatYoullBuild.length > 0 && (
                <div className="uo-lvl-block">
                  <span className="uo-lvl-block-label">What you&rsquo;ll build</span>
                  <ul className="uo-lvl-builds">
                    {entry.whatYoullBuild.map(item => (
                      <li key={item}>
                        <img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="uo-lvl-check" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.whatYoullLearn && entry.whatYoullLearn.length > 0 && (
                <div className="uo-lvl-block">
                  <span className="uo-lvl-block-label">What you&rsquo;ll learn</span>
                  <div className="uo-lvl-learn">
                    {entry.whatYoullLearn.map((group, idx) => (
                      <ul className="uo-lvl-learn-col" key={idx}>
                        {group.col.map(item => (
                          <li key={item}><span className="uo-lvl-bullet">&middot;</span><span>{item}</span></li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="uo-lvl-meta">
              <div className="uo-lvl-meta-row">
                <span className="uo-lvl-meta-label">Format</span>
                <span className="uo-lvl-meta-value">{entry.format}</span>
              </div>
              <div className="uo-lvl-meta-row">
                <span className="uo-lvl-meta-label">Schedule</span>
                <span className="uo-lvl-meta-value">{entry.schedule}</span>
              </div>
              {entry.tools && entry.tools.length > 0 && (
                <div className="uo-lvl-meta-row">
                  <span className="uo-lvl-meta-label">Tools you&rsquo;ll use</span>
                  <span className="uo-lvl-tools">
                    {entry.tools.map(t => <span className="uo-lvl-tool" key={t}>{t}</span>)}
                  </span>
                </div>
              )}
              {entry.key === 'foundations' && (
                <a
                  href="https://www.lelandcourses.com/ai-builder/foundations/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uo-lvl-meta-cta"
                  onClick={() => posthog.capture('app--foundations_cta_click', { source: 'uo-core-program' })}
                >
                  Start free &rarr;
                </a>
              )}
              {entry.key === 1 && (
                <a href="#cohorts" className="uo-lvl-meta-cta">See upcoming cohort dates &rarr;</a>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

function CoreProgram() {
  const [openLevel, setOpenLevel] = useState(null)
  const entries = [FOUNDATIONS, ...[1, 2, 3, 4, 5].map(levelEntry)]

  return (
    <section className="uo-core" id="core-program">
      <div className="container">
        <div className="uo-core-header">
          <h2 className="uo-core-headline">The core program</h2>
          <p className="uo-core-sub">
            Five levels, plus a free Foundations track. Every one is included in the same price. Start with Foundations,
            get up to speed in a live Level 1 cohort, then keep going through Level 5 at your own pace with optional
            live sessions and a dedicated TA behind you. Open any level below to see its full curriculum.
          </p>
        </div>
        <div className="uo-levels">
          {entries.map(entry => (
            <LevelToggle
              key={entry.key}
              entry={entry}
              open={openLevel === entry.key}
              onToggle={() => setOpenLevel(openLevel === entry.key ? null : entry.key)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function UpcomingCohorts() {
  const upcoming = (COURSE_COHORTS[1] || [])
    .filter(c => c.enrollUrl && !c.soldOut)
    .map(c => ({ ...c, date: new Date(`${c.iso.slice(0, 10)}T15:00:00Z`) }))
    .filter(c => !isNaN(c.date) && c.date >= new Date())
    .sort((a, b) => a.date - b.date)

  return (
    <section className="uo-cohorts" id="cohorts">
      <div className="container">
        <div className="uo-cohorts-header">
          <span className="uo-cohorts-eyebrow">Level 1 &middot; The live sprint</span>
          <h2 className="uo-cohorts-headline">Upcoming live cohorts</h2>
          <p className="uo-cohorts-sub">
            We recommend everyone start in a live Level 1 cohort, which is 4 90-minute sessions over 2 weeks.
            All sessions are recorded. Pick a date below.
          </p>
        </div>

        {upcoming.length > 0 ? (
          <div className="uo-cohort-grid">
            {upcoming.map(c => {
              const times = [...new Set(Object.values(c.sessionTimes || {}))]
              return (
                <a
                  key={c.iso}
                  href={c.enrollUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uo-cohort-card"
                  onClick={() => posthog.capture('app--enroll_cta_click', { source: 'uo-cohort-card', cohort: c.iso })}
                >
                  <div className="uo-cohort-cal">
                    <span className="uo-cohort-cal-month">{MONTHS_SHORT[c.date.getUTCMonth()]}</span>
                    <span className="uo-cohort-cal-day">{c.date.getUTCDate()}</span>
                  </div>
                  <div className="uo-cohort-info">
                    <span className="uo-cohort-label">Starts {c.label}</span>
                    <span className="uo-cohort-meta">{c.scheduleDays} &middot; 2 weeks</span>
                    {times.length > 0 && (
                      <span className="uo-cohort-times">{times.join(' or ')}</span>
                    )}
                  </div>
                  <span className="uo-cohort-arrow">&rarr;</span>
                </a>
              )
            })}
          </div>
        ) : (
          <p className="uo-cohorts-empty">New Level 1 dates are being scheduled. <a href={SALES_URL} target="_blank" rel="noopener noreferrer">Talk to our team</a> to get the next one.</p>
        )}
      </div>
    </section>
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

  return (
    <div className="video-embed">
      <wistia-player media-id="6pv9oxdp3r" aspect="1.7777777777777777"></wistia-player>
    </div>
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
          ref={v => { if (v) { v.muted = true; v.setAttribute('muted', '') } }}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{ transform: `scale(${mediaScale})` }}
        />
        <div className="why-reveal-content">
          <div className="why-reveal-left">
            <h2 className="why-reveal-heading">Become an AI Builder in 8-12 weeks.</h2>
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

export default function UnifiedOfferPage() {
  const ratingAvg = HERO_RATING_AVG
  const ratingCount = HERO_RATING_COUNT
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [gateSource, setGateSource] = useState(null)

  const heroPhrases = ['10x your impact', 'future-proof your work', 'scale your business', 'accelerate your career', 'automate manual work']
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0)
  const heroPhrase = heroPhrases[heroPhraseIndex]
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhraseIndex(i => (i + 1) % heroPhrases.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const toolPills = [
    { name: 'ChatGPT', logo: 'new-ChatGPT-icon-white-png-large-size.png', size: 42, noInvert: true },
    { name: 'Claude', logo: 'claude-ai.png' },
    { name: 'Gemini', logo: 'gemini-ai.png' },
    { name: 'Perplexity', logo: 'perlexity.png', size: 72, revealSize: 40 },
    { name: 'Cursor', logo: 'cursor-1.png', size: 42 },
    { name: 'n8n', logo: 'n8n.png', size: 56, revealSize: 24 },
  ]
  const skillPills = ['Agent building', 'Workflow automation', 'Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Report generation', 'Client communication', 'Go-to-market systems', 'Content creation', 'Financial modeling']

  useEffect(() => {
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    document.body.classList.add('uo-lp')
    const prevTitle = document.title
    document.title = 'AI Builder Program | Leland'
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
      document.body.classList.remove('uo-lp')
      document.title = prevTitle
    }
  }, [])

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
    document.body.classList.toggle('rb-nav-menu-open', menuOpen)
    return () => document.body.classList.remove('rb-nav-menu-open')
  }, [menuOpen])

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

  const faqs = [
    {
      q: 'What does the $1,499 include?',
      a: 'Everything. A live Level 1 cohort, AI Builder Foundations, Levels 2 and 3 with optional live sessions, Levels 4 and 5 on demand, weekly office hours with a dedicated TA, function-specific blueprints and strategy guides and agent templates, and a verified certificate. You walk away from Level 1 with a portfolio of 10+ builds.',
    },
    {
      q: 'How long do I have access?',
      a: 'Your purchase includes three months of full access to everything. You can extend your access anytime for $29/month or $119/year, which keeps it all, including office hours and re-enrollment in live Level 1 cohorts. Team seats include a full year of access.',
    },
    {
      q: 'Do I have to attend Level 1 live?',
      a: 'No, but we recommend it. Live cohorts start every two weeks, with four 90-minute sessions over two weeks. If a session doesn\'t fit your schedule, watch the recording and bring questions to office hours.',
    },
    {
      q: 'I\'m buying for a team. How does that work?',
      a: 'Same program, same price per seat, with volume discounts and centralized billing. Your people leave with a portfolio of skills, agents, and automations built for your business. <a href="https://form.typeform.com/to/bZuwV6t5" target="_blank" rel="noopener noreferrer">Talk to our team</a> for team pricing.',
    },
    {
      q: 'Are there discounts?',
      a: 'Yes. Teams get volume pricing, and we offer discounts for nonprofit, education, and military organizations. Anyone can apply for a scholarship. Talk to our team and we\'ll find the right option.',
    },
    {
      q: 'Do I need coding experience?',
      a: 'No. The program is designed for knowledge workers, not engineers. You will learn technical concepts, but everything is taught in a way that prioritizes practical application over code.',
    },
    {
      q: 'Which AI tools do I need?',
      a: "We focus on teaching concepts in a tool-agnostic way so you can bring whatever AI tools you already use. ChatGPT, Claude, and Gemini all work. Our team works from Claude, and that's what we recommend if you don't have a preferred tool.",
    },
    {
      q: 'Do I need a paid AI subscription?',
      a: "A paid subscription of $20/mo or higher for ChatGPT or Claude will give you faster responses, the full suite of features, and access to the most capable models. It's strongly recommended to get the full value of the program.",
    },
  ]

  return (
    <>
      {/* ====== Navigation ====== */}
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
              src={`${import.meta.env.BASE_URL}assets/logos/${scrolled ? 'aibp-dark' : 'aibp-light'}.png`}
              alt="AI Builder Program"
            />
          </div>
          <div className="rb-nav-actions">
            <a href="#teams" className="rb-nav-signin" onClick={() => posthog.capture('app--sales_cta_click', { source: 'nav-teams' })}>For teams</a>
            <a href={SALES_URL} target="_blank" rel="noopener noreferrer" className="rb-nav-signin" onClick={() => posthog.capture('app--sales_cta_click', { source: 'nav' })}>Talk to our team</a>
            <button type="button" className="rb-nav-getstarted" onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'nav' }); openCohortModal('nav') }}>
              Reserve your seat
            </button>
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
        </div>
        <button className="lai-mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <div className="lai-mobile-menu-links">
          <a href="#core-program" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>The program</a>
          <a href="#builds" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>What you'll build</a>
          <a href="#teams" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>For teams</a>
          <a href="#pricing" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href={SALES_URL} target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>Talk to our team</a>
        </div>
        <button type="button" className="lai-mobile-menu-cta" onClick={() => { setMenuOpen(false); openCohortModal('mobile-menu') }}>Reserve your seat</button>
      </div>

      {/* ====== Hero ====== */}
      <section className="hero" id="hero">
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

          <h1 className="hero-stagger hero-stagger-1">Build with AI to <br className="mobile-br" /><TextMorph className="rotating-text hero-morph-desktop">{heroPhrase}</TextMorph><span className="hero-morph-mobile">10x your impact</span></h1>

          <p className="hero-sub hero-stagger hero-stagger-2">Build tools that transform how you work, so you have more time and leverage to pursue what matters.</p>

          <div className="hero-ctas hero-stagger hero-stagger-3">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'hero-individual' }); openCohortModal('hero-individual') }}
            >
              For me
            </button>
            <BorderBeam size="sm" colorVariant="colorful" theme="dark" strength={1} borderRadius={999}>
              <a
                href="#teams"
                className="lai-cta-primary lai-cta-beam"
                onClick={() => posthog.capture('app--sales_cta_click', { source: 'hero-teams' })}
              >
                For my team
              </a>
            </BorderBeam>
          </div>

          <p className="hero-team-line hero-stagger hero-stagger-3">
            Buying for a team? We run this for 10-person startups through Fortune 500s.{' '}
            <a href="#teams" onClick={() => posthog.capture('app--sales_cta_click', { source: 'hero-team-line' })}>See team pricing</a>
          </p>

          <div className="hero-overview-link hero-stagger hero-stagger-3">
            <button
              type="button"
              className="hero-overview-btn"
              onClick={() => setGateSource('hero')}
            >
              Download the program overview (PDF)
            </button>
          </div>

          <div className="hero-review-row hero-stagger hero-stagger-4">
            <StarRating value={ratingAvg} />
            <span className="hero-review-text">{ratingAvg.toFixed(1)} stars from {ratingCount} reviews</span>
          </div>
        </div>
      </section>

      {/* ====== Org logos ====== */}
      <OrgLogosBand />

      {/* ====== Problem, then AIBP as the solution ====== */}
      <ProblemSection />

      {/* ====== Video: build and direct an AI agent team ====== */}
      <section className="save-time-section" id="about">
        <div className="container">
          <div className="save-time-split">
            <div className="save-time-left">
              <VideoEmbed />
            </div>
            <div className="save-time-right">
              <h2 className="save-time-headline">Start getting better results with AI</h2>
              <p className="save-time-sub">Stop doing every task yourself. Build specialized agents that triage your inbox, run research, prep your slides, ship your outreach, and more. All managed by you.</p>
              <div className="save-time-ctas">
                <button
                  type="button"
                  className="btn btn-primary save-time-explore-cta"
                  onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'video-section' }); openCohortModal('video-section') }}
                >
                  Reserve your seat
                </button>
                <a
                  href="#core-program"
                  className="btn btn-ghost save-time-explore-cta"
                  onClick={() => posthog.capture('app--curriculum_click', { source: 'video-section' })}
                >
                  See curriculum
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== The core program: Foundations + L1-L5 toggles ====== */}
      <CoreProgram />

      {/* ====== What you'll build, by role ====== */}
      <RoleUseCases />

      {/* ====== Testimonials ====== */}
      <TestimonialsBoard />

      {/* ====== Results CTA — see what people have built ====== */}
      <ResultsCTASection />

      {/* ====== Mid-page enroll strip ====== */}
      <section className="uo-enroll-strip">
        <div className="container">
          <h3 className="uo-enroll-strip-title">Ready to start building?</h3>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'mid-page-strip' }); openCohortModal('mid-page-strip') }}
          >
            Reserve your seat
          </button>
        </div>
      </section>

      {/* ====== Why: 8-12 weeks, tools, skills ====== */}
      <WhyRevealSection toolPills={toolPills} skillPills={skillPills} />

      {/* ====== For teams (hero + nav route here) ====== */}
      <section className="uo-teams" id="teams">
        <div className="container">
          <div className="uo-teams-header">
            <span className="uo-teams-eyebrow">For teams</span>
            <h2 className="uo-teams-headline">Bring your whole team, for the same price per seat.</h2>
            <p className="uo-teams-sub">
              We work with 10-person startups to Fortune 500s to drive AI impact quickly. Same program, same
              price per seat, with volume pricing and centralized billing. Your people leave with skills,
              agents, and automations built for your business. Team seats include a full year of access.
            </p>
          </div>
          <div className="uo-teams-grid">
            <div className="uo-teams-card">
              <h3>Team support for 5 to 50,000</h3>
              <p>Volume pricing that scales with seat count, and one invoice instead of a stack of expense reports.</p>
            </div>
            <div className="uo-teams-card">
              <h3>Built on your workflows</h3>
              <p>Your team brings your real processes. What they build in the sessions is yours to keep and run.</p>
            </div>
            <div className="uo-teams-card">
              <h3>Custom workshops</h3>
              <p>For larger groups we run a private cohort on your schedule, built around your stack and your use cases.</p>
            </div>
            <div className="uo-teams-card">
              <h3>Dedicated account manager</h3>
              <p>One point of contact for the whole rollout, plus office hours and a TA for every seat.</p>
            </div>
          </div>
          <div className="uo-teams-ctas">
            <a
              href="https://form.typeform.com/to/bZuwV6t5"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'teams-section' })}
            >
              Talk to our team
              <span className="arrow">&rarr;</span>
            </a>
            <button
              type="button"
              className="uo-teams-secondary"
              onClick={() => setGateSource('teams-section')}
            >
              Download the program overview
            </button>
          </div>
        </div>
      </section>

      {/* ====== Get This Expensed (reimbursement path for individuals) ====== */}
      <GetThisExpensed />

      {/* ====== Guarantees ====== */}
      <Guarantees />

      {/* ====== Value stack, ahead of the price ====== */}
      <ValueStack />

      {/* ====== Pricing ====== */}
      <SingleOfferPricing />

      {/* ====== Upcoming live L1 cohorts ====== */}
      <UpcomingCohorts />

      {/* ====== Advisor ====== */}
      <section className="uo-advisor">
        <div className="container">
          <div className="advisor-card">
            <h2>Have questions about the program?</h2>
            <p>Book a free call with an advisor and we will walk you through it.</p>
            <a href={`${SALES_URL}?utm_content=advisor-cta`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" onClick={() => posthog.capture('app--sales_cta_click', { source: 'advisor' })}>
              Schedule a call
              <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====== Certification ====== */}
      <section className="certification" id="certification">
        <div className="container">
          <div className="cert-intro">
            <h2>Walk away certified.</h2>
            <p className="cert-desc">
              Every course in the series culminates in a verified certificate of completion from Leland. Finish all five and earn the full AI Builder designation &mdash; a signal to employers, clients, and colleagues that you operate at the highest level of AI proficiency.
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
                    <span className="cert-subprogram">Use AI to 10x Your Impact &middot; Build Complex Agentic Workflows &middot; Create Autonomous Agents &middot; Build Your Agent Workforce &middot; Build Your AI Orchestration Layer</span>
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

      {/* ====== FAQ ====== */}
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
          ref={v => { if (v) { v.muted = true; v.setAttribute('muted', '') } }}
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
          <h2 className="rb-prefooter-heading">Next cohort starting {NEXT_COHORT_DISPLAY}</h2>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'prefooter' }); openCohortModal('prefooter') }}
          >
            Reserve your seat
          </button>
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

      <OverviewGate open={!!gateSource} source={gateSource || 'unknown'} onClose={() => setGateSource(null)} />

      <CohortModal />
      <FreeCourseModal />

      <LPPopup />
    </>
  )
}
