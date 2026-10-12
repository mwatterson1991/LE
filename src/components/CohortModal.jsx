import React, { useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { COURSE_COHORTS } from '../pages/courseData'
import { useCohortModal, closeCohortModal } from './cohortModalStore'
import { unifiedCheckoutFor, pickLaterUrl } from './unifiedCheckout'
import './cohort-modal.css'

// Every "Reserve your seat" CTA opens this. Checkout links come from
// unifiedCheckout.js (the unified-offer bootcamp SKU), NOT from courseData.js,
// which still points at the old per-level Level 1 bootcamp.
//
// Only cohorts with a unified-offer SKU can be bought. Scheduled cohorts without
// one yet are still listed, greyed out as "Enrollment opens soon", so visitors
// can see every future date without being sent to a checkout that doesn't exist.

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function upcomingL1() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (COURSE_COHORTS[1] || [])
    .filter(c => /^\d{4}-\d{2}-\d{2}/.test(c.iso))
    .map(c => {
      const d = new Date(`${c.iso.slice(0, 10)}T12:00:00Z`)
      return { ...c, d, daysOut: Math.round((d - today) / 86400000) }
    })
    .filter(c => c.daysOut >= 0)
    .map(c => ({ ...c, checkoutUrl: unifiedCheckoutFor(c.iso) }))
    .sort((a, b) => a.d - b.d)
}

export default function CohortModal() {
  const { open, source } = useCohortModal()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    posthog.capture('app--cohort_modal_open', { source })
    const onKey = e => { if (e.key === 'Escape') closeCohortModal() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, source])

  if (!open) return null

  const cohorts = upcomingL1()
  const firstOpen = cohorts.find(c => !c.soldOut && c.checkoutUrl)
  const pickLater = pickLaterUrl()

  const pick = (label, url, extra = {}) => {
    posthog.capture('app--cohort_selected', { source, choice: label, ...extra })
  }

  return (
    <div className="cm-backdrop" onClick={closeCohortModal} role="presentation">
      <div
        className="cm"
        ref={panelRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
      >
        <button className="cm-close" aria-label="Close" onClick={closeCohortModal}>&times;</button>

        <div className="cm-head">
          <span className="cm-eyebrow">Level 1 &middot; The live program</span>
          <h2 id="cm-title" className="cm-title">Select your cohort</h2>
          <p className="cm-sub">These are the live dates you would attend. Four 90-minute sessions over two weeks.</p>
          <p className="cm-note">Can&rsquo;t make one live? Every session is recorded, and recordings are always available.</p>
        </div>

        <div className="cm-list">
          {cohorts.map(c => {
            const times = [...new Set(Object.values(c.sessionTimes || {}))]
            const isNext = firstOpen && c.iso === firstOpen.iso
            if (c.soldOut || !c.checkoutUrl) {
              return (
                <div className="cm-row cm-row-out" key={c.iso}>
                  <span className="cm-cal">
                    <span className="cm-cal-m">{MONTHS[c.d.getUTCMonth()]}</span>
                    <span className="cm-cal-d">{c.d.getUTCDate()}</span>
                  </span>
                  <span className="cm-info">
                    <span className="cm-date">{DAYS[c.d.getUTCDay()]}, {c.label}</span>
                    <span className="cm-meta">{c.scheduleDays}</span>
                  </span>
                  <span className="cm-tag cm-tag-out">{c.soldOut ? 'Sold out' : 'Enrollment opens soon'}</span>
                </div>
              )
            }
            return (
              <a
                className="cm-row"
                key={c.iso}
                href={c.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => pick(c.label, c.checkoutUrl, { cohort: c.iso })}
              >
                <span className="cm-cal">
                  <span className="cm-cal-m">{MONTHS[c.d.getUTCMonth()]}</span>
                  <span className="cm-cal-d">{c.d.getUTCDate()}</span>
                </span>
                <span className="cm-info">
                  <span className="cm-date">
                    {DAYS[c.d.getUTCDay()]}, {c.label}
                    {isNext && <span className="cm-next">Next up</span>}
                  </span>
                  <span className="cm-meta">{c.scheduleDays}</span>
                  {times.length > 0 && <span className="cm-times">{times.join(' or ')}</span>}
                </span>
                <span className="cm-tag">
                  {c.daysOut === 0 ? 'Starts today' : c.daysOut === 1 ? 'Starts tomorrow' : `In ${c.daysOut} days`}
                </span>
                <span className="cm-arrow" aria-hidden="true">&rarr;</span>
              </a>
            )
          })}

          <a
            className="cm-row cm-row-unsure"
            href={pickLater}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => pick('not-sure-yet', pickLater)}
          >
            <span className="cm-cal cm-cal-q"><span className="cm-cal-d">?</span></span>
            <span className="cm-info">
              <span className="cm-date">I&rsquo;m not sure yet</span>
              <span className="cm-meta">Enroll now and choose your start date later.</span>
            </span>
            <span className="cm-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <p className="cm-fine">Every cohort is the same price and includes every level. Scholarships and team pricing available.</p>
      </div>
    </div>
  )
}
