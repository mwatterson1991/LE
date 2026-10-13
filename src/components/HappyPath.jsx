import React from 'react'
import posthog from 'posthog-js'
import './happy-path.css'

// The curriculum: one foundation (AI Foundations), context under everything,
// then four disciplines people take in whatever order fits.
// Individual-facing CTA: no teams prefill, and carries utm_source so these
// leads are attributable to /program instead of arriving untagged.
const SALES_URL = 'https://joinleland.typeform.com/to/bZuwV6t5?utm_source=program-lp'

const FOUNDATION_GROUPS = [
  {
    name: 'Essentials',
    mode: 'Self-paced',
    items: ['Explore what AI can do', 'Use AI every day', 'Give AI your context', 'Use it safely'],
  },
  {
    name: 'First builds',
    mode: 'Live with a cohort',
    items: ['Build a real product', 'Automate your email', 'Analyze data and decks', 'Launch your AI system'],
  },
]

const CONTEXT_ITEMS = ['Build a second brain', 'Build an agentic OS', 'Add skills and tools', 'Share team context']

// Icons are 24x24 line drawings, stroked by CSS.
const DISCIPLINES = [
  {
    name: 'Creation',
    line: 'Turn ideas into finished work.',
    items: ['Build apps and sites', 'Design with AI', 'Make decks and docs', 'Ship real products'],
    icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  },
  {
    name: 'Automation',
    line: 'Hand off the work that repeats.',
    items: ['Map automations', 'Build workflows', 'Ship automations', 'Run proactive agents'],
    icon: <path d="M4 12h4l3-8 4 16 3-8h2" />,
  },
  {
    name: 'Orchestration',
    line: 'Get agents working as one team.',
    items: ['Build subagents', 'Scope AI employees', 'Build pipelines', 'Improve agent teams'],
    icon: <><circle cx="5" cy="12" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 12h5l5-6M12 12l5 6" /></>,
  },
  {
    name: 'Operations',
    line: 'Run AI safely and within budget.',
    items: ['Evaluate agents', 'Host and deploy', 'Set guardrails', 'Optimize cost'],
    icon: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  },
]

export default function HappyPath() {
  return (
    <section className="hp cd-section" id="happy-path">
      <div className="container">
        <div className="hp-header">
          <span className="cd-eyebrow">The curriculum</span>
          <h2 className="hp-headline">One foundation. Four disciplines.</h2>
          <p className="hp-sub">
            Everyone builds the foundation first, with a live cohort. Then each person goes deep in the
            disciplines their work needs, in whatever order fits. Context runs through all of it.
          </p>
        </div>

        <div className="cd-found">
          <div>
            <span className="cd-tag">Everyone starts here</span>
            <h3>AI Foundations</h3>
            <p>The shared baseline every person builds first, on the tools you already have.</p>
          </div>
          <div className="cd-fgs">
            {FOUNDATION_GROUPS.map(g => (
              <div key={g.name} className="cd-fg">
                <b>{g.name}<em>{g.mode}</em></b>
                <ul>{g.items.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-ctx">
          <div className="cd-ctx-h">
            <div className="cd-ic">
              <svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>
            </div>
            <div>
              <b>Context, everywhere</b>
              <span>The skill under every discipline: teaching AI how your work works.</span>
            </div>
          </div>
          <ul>{CONTEXT_ITEMS.map(i => <li key={i}>{i}</li>)}</ul>
        </div>

        <div className="cd-grid">
          {DISCIPLINES.map(d => (
            <div key={d.name} className="cd-card">
              <div className="cd-ic"><svg viewBox="0 0 24 24">{d.icon}</svg></div>
              <h3>{d.name}</h3>
              <p>{d.line}</p>
              <ul className="cd-list">{d.items.map(i => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="cd-modes">
          <b>Every discipline, your way</b>
          <span>Live with a cohort</span>
          <span>Self-paced</span>
          <span>Or a mix of both</span>
        </div>

        <div className="hp-anytime">
          <div className="hp-anytime-copy">
            <span className="hp-anytime-tag">Always on</span>
            <p className="hp-anytime-text">
              A library of function-specific blueprints and skill templates, refreshed weekly, plus live
              office hours whenever your team needs them.
            </p>
          </div>
          <div className="cd-lib" aria-hidden="true">
            <div className="cd-doc cd-d1">
              <div className="cd-dh"><span className="cd-dic">MD</span>sales-blueprint.md</div>
              <i style={{ width: '80%' }} /><i style={{ width: '64%' }} /><i style={{ width: '72%' }} />
              <span className="cd-tagp">Function blueprint</span>
            </div>
            <div className="cd-doc cd-d2">
              <div className="cd-dh"><span className="cd-dic y">/</span>SKILL.md · inbox-triage</div>
              <div className="cd-code"><i style={{ width: '56%' }} /><i style={{ width: '78%' }} /><i className="y" style={{ width: '40%' }} /></div>
              <span className="cd-tagp">Skill template</span>
            </div>
            <div className="cd-doc cd-d3">
              <div className="cd-dh"><span className="cd-dic g" />Office hours</div>
              <div className="cd-slots"><b>Tue 11am</b><b className="on">Thu 2pm</b><b>Fri 9am</b></div>
              <span className="cd-tagp">Live, weekly</span>
            </div>
          </div>
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
    </section>
  )
}
