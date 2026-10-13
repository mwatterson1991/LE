import React, { useState } from 'react'
import posthog from 'posthog-js'
import { OUTCOME_VISUALS } from './OutcomeVisuals'
import './outcomes-section.css'

// What people walk out with, not a syllabus. Each row is a finished thing you own.
// Sourced from the Curriculum V7 session builds: Foundations, all four Level 1
// sessions, and two from Level 2.
const OUTCOMES = [
  {
    key: 'foundations',
    icon: 'ideation.svg',
    title: 'Learn the Basics of Building with AI',
    body: [
      'Get fluent in the fundamentals before your cohort even starts.',
      'Work through four short async modules built around hands-on projects instead of lectures. No coding experience and no paid AI subscription required.',
      'Show up to your first live session ready to build.',
    ],
    visual: 'foundations',
  },
  {
    key: 'product',
    icon: 'digital-products.svg',
    title: 'Build a Real Product with World-Class Design',
    body: [
      'Create a finished, custom-designed product in 90 minutes without writing a line of code.',
      'Brief your AI in plain English and watch the layout, sections, and copy come together. Pull the design DNA off a site you love and turn it into a reusable skill you keep using afterward.',
      'Walk out of session one with something you would actually show someone.',
    ],
    visual: 'product',
  },
  {
    key: 'inbox',
    icon: 'message.svg',
    title: 'Automate Communication in Your Voice',
    body: [
      'Connect your real tools, teach your AI how you write, and put it on a schedule.',
      'Build an email manager that drafts replies every morning before you open your laptop. They sound like you because you wrote the voice guide it works from.',
      'This is the build people tell us bought back their first real hour.',
    ],
    visual: 'inbox',
  },
  {
    key: 'deck',
    icon: 'analytics.svg',
    title: 'Analyze Data and Design Presentations That Build Themselves',
    body: [
      'Go from an ugly spreadsheet to clean insights and a polished, on-brand deck.',
      'Skip the formulas and the design tools. Build the workflow once and point it at any dataset you get handed after that.',
      'Turn an afternoon of work into something you kick off and walk away from.',
    ],
    visual: 'deck',
  },
  {
    key: 'brain',
    icon: 'session-notes.svg',
    title: 'Build Your Second Brain with AI',
    body: [
      'Turn your notes, docs, and past work into something your agents can search in real time.',
      'Every session starts with your full context already loaded instead of a blank slate.',
      'Ask it anything about your own work and get an answer grounded in what you actually wrote.',
    ],
    visual: 'brain',
  },
  {
    key: 'cloud',
    icon: 'scheduling.svg',
    title: 'Build a Cloud-Based Agentic Workflow and QA System',
    body: [
      'Move your automations off your laptop and into the cloud on a schedule.',
      'Add a QA layer that checks the agent\'s own output before anything reaches you, so you are not proofreading a robot all day.',
      'It runs overnight, on weekends, and through your meetings. You review exceptions instead of doing the work.',
    ],
    visual: 'cloud',
  },
]

function OutcomeRow({ item, open, onToggle }) {
  const Visual = OUTCOME_VISUALS[item.visual]
  return (
    <div className={`uo-out${open ? ' open' : ''}`}>
      <button
        type="button"
        className="uo-out-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="uo-out-icon">
          <img src={`${import.meta.env.BASE_URL}assets/product-illustrations/${item.icon}`} alt="" loading="lazy" />
        </span>
        <span className="uo-out-heads">
          <span className="uo-out-title">{item.title}</span>
        </span>
        <span className="uo-out-plus" aria-hidden="true" />
      </button>
      <div className="uo-out-body">
        <div className="uo-out-body-inner">
          <div className="uo-out-grid">
            <div className="uo-out-copy">
              {item.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="uo-out-visual">
              {Visual ? <Visual /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OutcomesSection() {
  const [open, setOpen] = useState(null)

  return (
    <section className="uo-outcomes" id="outcomes">
      <div className="container">
        <div className="uo-outcomes-header">
          <h2 className="uo-outcomes-headline">Every session is a guided build.</h2>
          <p className="uo-outcomes-sub">
            Live with an expert instructor, on the tools your team already uses. Here&rsquo;s a
            sample of what people learn to automate.
          </p>
        </div>

        <div className="uo-outcomes-list">
          {OUTCOMES.map(item => (
            <OutcomeRow
              key={item.key}
              item={item}
              open={open === item.key}
              onToggle={() => {
                const next = open === item.key ? null : item.key
                setOpen(next)
                if (next) posthog.capture('app--outcome_open', { outcome: item.key })
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
