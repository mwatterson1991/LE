import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { useCohortModal } from './cohortModalStore'
import './overview-gate.css'

// Timed lead capture for the free intro course. Fires once, 12 seconds in.
//
// Reuses the ogate-* classes from overview-gate.css so both dialogs stay visually
// identical. That file already covers this form's shell, fields, and two-up row,
// so there is no stylesheet of its own.
//
// Submits to the same "AI Foundations Signup" HubSpot form that
// lelandcourses.com/ai-builder/foundations uses, so these signups land in the
// existing Foundations email workflow. This is just a second entry point.
//
// Uses the legacy forms endpoint with an email-only payload, exactly matching
// what the Foundations page sends. The v3 submissions API returned 200 here but
// the submission never appeared on the form and no email was sent, so this
// mirrors the known-good path rather than a different one that looks fine.
//
// no-cors means the response is opaque, so success cannot be read back. Verify
// submissions against the form's submission list, not this return value.
const HUBSPOT_PORTAL_ID = '22467258'
const HUBSPOT_FORM_ID = 'bc2ccea1-494e-4dd5-a113-dc61a1fdb2af'
const DELAY_MS = 12000
const SEEN_KEY = 'lp_free_course_seen'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function alreadySeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch (err) {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch (err) {
    /* private browsing, show it again next visit */
  }
}

async function sendToHubspot({ email }) {
  if (!HUBSPOT_FORM_ID) return { ok: false, reason: 'no-form-id' }
  const ctx = JSON.stringify({
    pageUri: window.location.href,
    pageName: document.title,
    hutk: document.cookie.match(/hubspotutk=([^;]+)/)?.[1],
  })
  try {
    await fetch(`https://forms.hubspot.com/uploads/form/v2/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&hs_context=${encodeURIComponent(ctx)}`,
    })
    return { ok: true, reason: 'opaque' }
  } catch (err) {
    return { ok: false, reason: 'network' }
  }
}

export default function FreeCourseModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [state, setState] = useState('idle') // idle | sending | done
  const emailRef = useRef(null)
  const { open: cohortOpen } = useCohortModal()

  // Hold the timer while someone is picking a cohort. Interrupting a purchase
  // with a free-course offer would cost more than the lead is worth.
  useEffect(() => {
    if (alreadySeen() || cohortOpen) return
    const t = setTimeout(() => {
      if (alreadySeen()) return
      setOpen(true)
      markSeen()
      posthog.capture('app--free_course_modal_open', { trigger: 'timer', delay_ms: DELAY_MS })
    }, DELAY_MS)
    return () => clearTimeout(t)
  }, [cohortOpen])

  useEffect(() => {
    if (!open) return
    setTimeout(() => emailRef.current?.focus(), 60)
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const close = () => {
    if (state !== 'done') posthog.capture('app--free_course_modal_dismiss', { had_email: !!email.trim() })
    setOpen(false)
  }

  const submit = async e => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!EMAIL_RE.test(cleanEmail)) {
      setError('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }
    setError(null)
    setState('sending')
    const result = await sendToHubspot({ email: cleanEmail })
    posthog.capture('app--free_course_modal_submit', {
      email: cleanEmail,
      crm_synced: result.ok,
      crm_skip_reason: result.reason,
    })
    setState('done')
  }

  return (
    <div className="ogate-backdrop" onClick={close} role="presentation">
      <div
        className="ogate fcm"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcm-title"
      >
        <button className="ogate-close" aria-label="Close" onClick={close}>&times;</button>

        {state === 'done' ? (
          <div className="ogate-done">
            <h2 id="fcm-title" className="ogate-title">Sent! Check your email.</h2>
            <p className="ogate-sub">
              We&rsquo;re sending AI Builder Foundations to <strong>{email.trim()}</strong>. It should land in the
              next few minutes.
            </p>
            <button className="btn btn-primary btn-lg" onClick={close}>Back to the page</button>
          </div>
        ) : (
          <>
            <span className="ogate-eyebrow">Free course</span>
            <h2 id="fcm-title" className="ogate-title">Start the first step, 100% free</h2>
            <p className="ogate-sub">
              Unlock the program&rsquo;s introductory course, AI Builder Foundations, for free and start doing
              more with AI today.
            </p>

            <form className="ogate-form" onSubmit={submit} noValidate>
              <label className="ogate-field">
                <span>Work email</span>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(null) }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </label>

              {error && <p className="ogate-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-lg ogate-submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Unlock free access'}
              </button>
              <p className="ogate-fine">
                We&rsquo;ll email you the course and occasional updates about the program. Unsubscribe whenever.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
