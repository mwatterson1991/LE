import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import './overview-gate.css'

// HubSpot portal is already loaded site-wide via index.html (id 22467258).
// FORM_ID must be a real HubSpot form GUID before this ships. Until it's set the
// gate still captures the email to PostHog and still delivers the PDF, so a
// missing id degrades to "we lose the CRM record" and never to "download broken".
const HUBSPOT_PORTAL_ID = '22467258'
const HUBSPOT_FORM_ID = '' // TODO: paste the HubSpot form GUID here
const PDF_URL = '/ai-builder-program-overview.pdf'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function sendToHubspot({ email, firstName, company }) {
  if (!HUBSPOT_FORM_ID) return { ok: false, reason: 'no-form-id' }
  const fields = [{ name: 'email', value: email }]
  if (firstName) fields.push({ name: 'firstname', value: firstName })
  if (company) fields.push({ name: 'company', value: company })
  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          context: {
            pageUri: window.location.href,
            pageName: document.title,
            hutk: document.cookie.match(/hubspotutk=([^;]+)/)?.[1],
          },
        }),
      }
    )
    return { ok: res.ok, reason: res.ok ? null : `http-${res.status}` }
  } catch (err) {
    return { ok: false, reason: 'network' }
  }
}

export default function OverviewGate({ open, onClose, source = 'unknown' }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState(null)
  const [state, setState] = useState('idle') // idle | sending | done
  const emailRef = useRef(null)

  useEffect(() => {
    if (open) {
      setState('idle')
      setError(null)
      posthog.capture('app--overview_gate_open', { source })
      setTimeout(() => emailRef.current?.focus(), 60)
    }
  }, [open, source])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const deliver = () => {
    window.open(PDF_URL, '_blank', 'noopener')
    setState('done')
  }

  const submit = async (e) => {
    e.preventDefault()
    const clean = email.trim()
    if (!EMAIL_RE.test(clean)) {
      setError('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }
    setError(null)
    setState('sending')
    const result = await sendToHubspot({ email: clean, firstName: firstName.trim(), company: company.trim() })
    posthog.capture('app--overview_gate_submit', {
      source,
      email: clean,
      company: company.trim() || null,
      crm_synced: result.ok,
      crm_skip_reason: result.reason,
    })
    deliver()
  }

  return (
    <div className="ogate-backdrop" onClick={onClose} role="presentation">
      <div
        className="ogate"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ogate-title"
      >
        <button className="ogate-close" aria-label="Close" onClick={onClose}>&times;</button>

        {state === 'done' ? (
          <div className="ogate-done">
            <h2 id="ogate-title" className="ogate-title">Your overview is downloading.</h2>
            <p className="ogate-sub">
              If your browser blocked the popup, <a href={PDF_URL} target="_blank" rel="noopener noreferrer">grab it here</a>.
            </p>
            <button className="btn btn-primary btn-lg" onClick={onClose}>Back to the page</button>
          </div>
        ) : (
          <>
            <span className="ogate-eyebrow">Program overview</span>
            <h2 id="ogate-title" className="ogate-title">Where should we send it?</h2>
            <p className="ogate-sub">
              Two pages covering every level, what you build, what it costs, and the upcoming cohort dates.
              Good for forwarding to a manager.
            </p>

            <form className="ogate-form" onSubmit={submit} noValidate>
              <label className="ogate-field">
                <span>Work email</span>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </label>
              <div className="ogate-row">
                <label className="ogate-field">
                  <span>First name <em>optional</em></span>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                </label>
                <label className="ogate-field">
                  <span>Company <em>optional</em></span>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                </label>
              </div>

              {error && <p className="ogate-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-lg ogate-submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send me the overview'}
              </button>
              <p className="ogate-fine">
                We'll email you about the program. Unsubscribe whenever.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
