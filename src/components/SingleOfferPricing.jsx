import React from 'react'
import posthog from 'posthog-js'
import { COURSE_COHORTS } from '../pages/courseData'
import { openCohortModal } from './cohortModalStore'
import { activePartner, offerPricing } from './partnerOffer'
import '../pages/unified-offer.css'

// Shared single-offer pricing block. Rendered on the team-focused LP (/) and on the
// clone of the live program page (/program-single-price) so the two never drift.

const ENROLL_URL = (() => {
  const cohorts = COURSE_COHORTS[1] || []
  const now = new Date()
  const next = cohorts.find(c => c.enrollUrl && !c.soldOut && new Date(c.iso) >= now)
    || cohorts.find(c => c.enrollUrl && !c.soldOut)
  return next?.enrollUrl || cohorts[0]?.enrollUrl
})()

// Urgency line under the CTA, computed from real cohort data.
const NEXT_COHORT_LABEL = (() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = (COURSE_COHORTS[1] || [])
    .filter(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}/.test(c.iso))
    .map(c => ({ ...c, d: new Date(`${c.iso.slice(0, 10)}T12:00:00Z`) }))
    .filter(c => c.d >= today)
    .sort((a, b) => a.d - b.d)[0]
  if (!next) return null
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[next.d.getUTCMonth()]} ${next.d.getUTCDate()}`
})()

const SALES_URL = 'https://form.typeform.com/to/bZuwV6t5'

// The Teams card is a team CTA, so it carries utm_campaign=teams for the
// Typeform's B2B branch. The nonprofit/education/military card is not.
const TEAMS_URL = `${SALES_URL}?utm_source=program-lp&utm_medium=pricing-teams-card&utm_campaign=teams#answers-triage=c_team`
const SCHOLARSHIP_URL = 'https://joinleland.typeform.com/to/TEiacu5G?utm_campaign=landing_page_cta&utm_source=website&utm_medium=web'

export default function SingleOfferPricing({ hideHeader = false }) {
  // Off a partner route this is just the list price and listPrice is null, so
  // the markup below is the same on /program and /scaling.
  const partner = activePartner()
  const { price, listPrice, discountLabel } = offerPricing(partner)

  const included = [
    'Live Level 1 cohort, with new cohorts starting every two weeks',
    'AI Builder Foundations, plus levels 2-5 on-demand',
    'Weekly office hours and a dedicated TA you can message anytime',
    'Function-specific blueprints, strategy guides, and agent templates',
    'Curriculum updated weekly, built by AI experts',
    'Builder community and verified certificate of completion',
  ]

  const discounts = [
    {
      icon: 'teams-v2.svg',
      title: 'Teams',
      desc: 'Volume discounts and centralized billing for teams of any size.',
      cta: 'Talk to our team',
      href: TEAMS_URL,
    },
    {
      icon: 'nonprofit-education-military.svg',
      title: 'Nonprofit, education & military',
      desc: 'Special pricing for people at mission-driven organizations.',
      cta: 'Ask about discounts',
      href: SALES_URL,
    },
    {
      icon: 'scholarships.svg',
      title: 'Scholarships',
      desc: 'Anyone can apply. Cost should never be the reason you don\'t learn AI.',
      cta: 'Apply for a scholarship',
      href: `${SCHOLARSHIP_URL}&utm_content=uo-discount-scholarship`,
    },
  ]

  return (
    <section className="uo-pricing" id={hideHeader ? undefined : 'pricing'}>
      <div className="container">
        {!hideHeader && (
          <>
            <h2 className="uo-pricing-headline">Discover what you can accomplish with AI.</h2>
            <p className="uo-pricing-sub">Whatever your goals are, the AI Builder Program will empower you to move faster and achieve more with AI.</p>
          </>
        )}

        <div className="uo-price-card">
          <div className="uo-price-card-left">
            <span className="uo-price-eyebrow">AI Builder Program</span>
            <div className="uo-price-row">
              <span className="uo-price">{price}</span>
              {listPrice && <span className="uo-price-list">{listPrice}</span>}
            </div>
            {discountLabel && (
              <p className="uo-partner-offer">
                <span className="uo-partner-offer-badge">{discountLabel}</span>
                <span className="uo-partner-offer-note">
                  Code <code>{partner.discountCode}</code> is applied automatically at checkout.
                </span>
              </p>
            )}
            <div className="uo-price-ctas">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => { posthog.capture('app--enroll_cta_click', { source: 'uo-pricing' }); openCohortModal('uo-pricing') }}
              >
                Reserve your seat
                <span className="arrow">&rarr;</span>
              </button>
            </div>

            {NEXT_COHORT_LABEL && (
              <p className="uo-price-urgency">
                <span className="uo-price-urgency-date">Next cohort starts {NEXT_COHORT_LABEL}.</span>
              </p>
            )}

            <p className="uo-price-finaid">
              Need financing help?{' '}
              <a
                href={`${SCHOLARSHIP_URL}&utm_content=uo-pricing-finaid`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => posthog.capture('app--sales_cta_click', { source: 'uo-pricing-finaid' })}
              >
                Apply for a scholarship
              </a>
            </p>
          </div>
          <div className="uo-price-card-right">
            <span className="uo-price-includes-header">What's included</span>
            <ul className="uo-price-includes">
              {included.map(item => (
                <li key={item}>
                  <img src={`${import.meta.env.BASE_URL}assets/icons/checkmark.svg`} alt="" className="uo-price-check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="uo-discounts">
          {discounts.map(d => (
            <a
              key={d.title}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="uo-discount-card"
              onClick={() => posthog.capture('app--sales_cta_click', { source: `uo-discount-${d.title.toLowerCase().split(' ')[0]}` })}
            >
              <img src={`${import.meta.env.BASE_URL}assets/product-illustrations/${d.icon}`} alt="" className="uo-discount-icon" />
              <span className="uo-discount-title">{d.title}</span>
              <span className="uo-discount-desc">{d.desc}</span>
              <span className="uo-discount-link">{d.cta} &rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
