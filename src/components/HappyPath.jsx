import React from 'react'
import posthog from 'posthog-js'
import './happy-path.css'

// One section: headline, subhead, and the path. Level names only, no descriptions.
const SALES_URL = 'https://form.typeform.com/to/bZuwV6t5'
// V7 level titles, the four session titles inside each level, and how each level
// is delivered. Session titles only, no descriptions: enough for a reader to see
// what a level covers without the section becoming a curriculum dump.
const LEVELS = [
  {
    n: 1,
    title: 'Use AI to 10x Your Impact',
    tag: 'Live recommended',
    tone: 'live',
    sessions: [
      'Build a real product',
      'Automate your communication',
      'Analyze data and build decks',
      'Launch your AI system',
    ],
  },
  {
    n: 2,
    title: 'Build Complex Agentic Workflows',
    tag: 'Live optional',
    tone: 'optional',
    sessions: [
      'Build your automation roadmap',
      'Cloud-based agentic workflows',
      'Build your second brain',
      'Ship custom automations',
    ],
  },
  {
    n: 3,
    title: 'Create Autonomous Agents',
    tag: 'Live optional',
    tone: 'optional',
    sessions: [
      'Build your agentic OS',
      'Build your first subagents',
      'Add skills, tools, and context',
      'Evaluate your agent',
    ],
  },
  {
    n: 4,
    title: 'Build Your Agent Workforce',
    tag: 'On-demand',
    tone: 'ondemand',
    sessions: [
      'Scope your AI employee',
      'Build an orchestrated pipeline',
      'Host and deploy your agent',
      'Self-improving agent team',
    ],
  },
  {
    n: 5,
    title: 'Design Your AI Orchestration Layer',
    tag: 'On-demand',
    tone: 'ondemand',
    sessions: [
      'Optimize performance and cost',
      'Create shared context systems',
      'Make agents proactive',
      'Security and guardrails',
    ],
  },
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

          {/* Open, not a disclosure. This is the answer to "what do I actually get",
              and behind a summary almost nobody read it. */}
          <div className="hp-levels">
            <ul className="hp-levels-list">
              {LEVELS.map(l => (
                <li key={l.n}>
                  <span className="hp-levels-n">Level {l.n}</span>
                  <span className="hp-levels-main">
                    <span className="hp-levels-t">{l.title}</span>
                    <span className={`hp-levels-tag hp-levels-tag-${l.tone}`}>{l.tag}</span>
                  </span>
                  <ol className="hp-levels-sessions">
                    {l.sessions.map(s => <li key={s}>{s}</li>)}
                  </ol>
                </li>
              ))}
            </ul>
          </div>

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
