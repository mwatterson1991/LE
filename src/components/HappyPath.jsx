import React from 'react'
import posthog from 'posthog-js'
import './happy-path.css'

// One section: headline, subhead, and the path. Level names only, no descriptions.
const SALES_URL = 'https://form.typeform.com/to/bZuwV6t5'
// V7 level titles. The path shows groupings; this spells out what each level is
// called without turning the section into a curriculum dump.
const LEVELS = [
  { n: 1, title: 'Use AI to 10x Your Impact' },
  { n: 2, title: 'Build Complex Agentic Workflows' },
  { n: 3, title: 'Create Autonomous Agents' },
  { n: 4, title: 'Build Your Agent Workforce' },
  { n: 5, title: 'Build Your AI Orchestration Layer' },
]

const STOPS = [
  { key: 'foundations', label: 'AI Builder Foundations', tag: 'Before you start', tone: 'prep' },
  { key: 'l1', label: 'Level 1', tag: 'The live program', tone: 'live' },
  { key: 'l23', label: 'Levels 2 & 3', tag: 'Go deeper', tone: 'core' },
  { key: 'l45', label: 'Levels 4 & 5', tag: 'Advanced skills', tone: 'adv' },
]

export default function HappyPath() {
  return (
    <section className="hp" id="happy-path">
      <div className="container">
        <div className="hp-header">
          <h2 className="hp-headline">In 2 weeks, you&rsquo;ll have an AI portfolio with 10+ automations.</h2>
          <p className="hp-sub">Then, keep improving your AI skills at your own pace, with live support.</p>
        </div>

        <div className="hp-path">
          {/* The rail is scoped to the stops. On mobile it runs vertically, and
              spanning the whole path made it cut through the copy below. */}
          <div className="hp-track">
            <div className="hp-line" aria-hidden="true"><span className="hp-line-fill" /></div>

            <ol className="hp-stops">
              {STOPS.map((s, i) => (
                <li className={`hp-stop hp-stop-${s.tone}`} key={s.key} style={{ '--i': i }}>
                  <span className="hp-node" aria-hidden="true" />
                  <span className="hp-stop-label">{s.label}</span>
                  <span className="hp-stop-tag">{s.tag}</span>
                </li>
              ))}
            </ol>
          </div>

          <details className="hp-levels">
            <summary>See level titles</summary>
            <ul className="hp-levels-list">
              {LEVELS.map(l => (
                <li key={l.n}>
                  <span className="hp-levels-n">Level {l.n}</span>
                  <span className="hp-levels-t">{l.title}</span>
                </li>
              ))}
            </ul>
          </details>

          <div className="hp-anytime">
            <div className="hp-anytime-copy">
              <span className="hp-anytime-tag">Anytime</span>
              <p className="hp-anytime-text">
                Access our library of function-specific resources and sign up for live office hours
                whenever you need them.
              </p>
            </div>
            <ul className="hp-anytime-list">
              <li>Function-specific blueprints</li>
              <li>Skill and agent templates</li>
              <li>Live office hours</li>
            </ul>
          </div>

          <p className="hp-deeper">
            Want a free consultation to determine if the program is right for you?{' '}
            <a
              href={SALES_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture('app--sales_cta_click', { source: 'happy-path-deeper' })}
            >
              Talk with our team
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
