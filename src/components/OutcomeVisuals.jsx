import React from 'react'
import './outcome-visuals.css'

// Inline animated visuals for the outcomes accordion. One per outcome, each a small
// self-contained SVG/CSS scene. Built to the AI Builder brand tokens (cream surfaces,
// yellow #F5C84B, blue #7BA4E0, rust #B85A2B, ink #1A1A1A) with no emojis and no icons
// inside the scene itself, per the concept-animator rules.
//
// These run only while their row is open, so seven of them never animate at once.

const S = { w: 460, h: 300 }

function Frame({ children, label }) {
  return (
    <div className="ov">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} width="100%" role="img" aria-label={label}>
        <rect x="0" y="0" width={S.w} height={S.h} rx="14" fill="#FBF8F2" />
        {children}
      </svg>
    </div>
  )
}

/* 1. Foundations — four modules fill in one at a time */
export function VisualFoundations() {
  return (
    <Frame label="Four foundation modules completing one after another">
      <text x="28" y="44" className="ov-eyebrow">FOUNDATIONS</text>
      {[0, 1, 2, 3].map(i => (
        <g key={i} className="ov-stagger" style={{ animationDelay: `${0.3 + i * 0.45}s` }}>
          <rect x="28" y={72 + i * 52} width="404" height="40" rx="9" fill="#F2EBDD" />
          <rect x="28" y={72 + i * 52} width="404" height="40" rx="9" fill="rgba(245,200,75,0.35)"
                className="ov-fill" style={{ animationDelay: `${0.6 + i * 0.45}s` }} />
          <text x="46" y={97 + i * 52} className="ov-label">Module {i + 1}</text>
          <circle cx="410" cy={92 + i * 52} r="9" fill="#F5C84B"
                  className="ov-pop" style={{ animationDelay: `${0.95 + i * 0.45}s` }} />
        </g>
      ))}
    </Frame>
  )
}

/* 2. Ship a product without code — a page assembles itself */
export function VisualProduct() {
  return (
    <Frame label="A landing page assembling section by section">
      <rect x="28" y="28" width="404" height="244" rx="10" fill="#F2EBDD" />
      <rect x="28" y="28" width="404" height="26" rx="10" fill="#E5C9A8" />
      <circle cx="46" cy="41" r="4" fill="#FFFFFF" />
      <circle cx="60" cy="41" r="4" fill="#FFFFFF" />
      <rect x="44" y="70" width="230" height="22" rx="5" fill="#1A1A1A" className="ov-grow" style={{ animationDelay: '0.3s' }} />
      <rect x="44" y="102" width="150" height="10" rx="5" fill="#4C4C4C" className="ov-grow" style={{ animationDelay: '0.6s' }} />
      <rect x="44" y="126" width="86" height="26" rx="13" fill="#F5C84B" className="ov-pop" style={{ animationDelay: '0.9s' }} />
      {[0, 1, 2].map(i => (
        <rect key={i} x={44 + i * 126} y="176" width="110" height="72" rx="8" fill="#FFFFFF"
              className="ov-stagger" style={{ animationDelay: `${1.2 + i * 0.22}s` }} />
      ))}
    </Frame>
  )
}

/* 3. Inbox on autopilot — messages get drafted replies */
export function VisualInbox() {
  return (
    <Frame label="Inbox messages receiving drafted replies automatically">
      <text x="28" y="44" className="ov-eyebrow">INBOX</text>
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="28" y={66 + i * 52} width="190" height="40" rx="9" fill="#F2EBDD" />
          <rect x="42" y={80 + i * 52} width={110 - i * 16} height="8" rx="4" fill="#4C4C4C" opacity="0.5" />
          <path d={`M224 ${86 + i * 52} L266 ${86 + i * 52}`} stroke="#B85A2B" strokeWidth="2.5"
                markerEnd="url(#ovArrow)" className="ov-draw" style={{ animationDelay: `${0.5 + i * 0.4}s` }} />
          <g className="ov-stagger" style={{ animationDelay: `${0.8 + i * 0.4}s` }}>
            <rect x="272" y={66 + i * 52} width="160" height="40" rx="9" fill="rgba(245,200,75,0.35)" />
            <text x="286" y={91 + i * 52} className="ov-label">Draft ready</text>
          </g>
        </g>
      ))}
      <defs>
        <marker id="ovArrow" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="7" orient="auto">
          <path d="M0 0 L10 4 L0 8 z" fill="#B85A2B" />
        </marker>
      </defs>
    </Frame>
  )
}

/* 4. Spreadsheet to deck — cells become a slide */
export function VisualDeck() {
  return (
    <Frame label="Spreadsheet cells turning into a finished slide">
      <text x="28" y="42" className="ov-eyebrow">RAW DATA</text>
      <g>
        {[0, 1, 2, 3, 4].map(r => [0, 1, 2].map(c => (
          <rect key={`${r}-${c}`} x={28 + c * 44} y={58 + r * 30} width="40" height="24" rx="4"
                fill="#F2EBDD" className="ov-stagger" style={{ animationDelay: `${0.15 + (r * 3 + c) * 0.05}s` }} />
        )))}
      </g>
      <path d="M176 130 L226 130" stroke="#B85A2B" strokeWidth="2.5" markerEnd="url(#ovArrow2)"
            className="ov-draw" style={{ animationDelay: '1.1s' }} />
      <g className="ov-stagger" style={{ animationDelay: '1.4s' }}>
        <rect x="238" y="62" width="194" height="140" rx="10" fill="#F2EBDD" />
        <rect x="254" y="80" width="120" height="14" rx="4" fill="#1A1A1A" />
        <rect x="254" y="104" width="70" height="7" rx="3" fill="#4C4C4C" opacity="0.55" />
        {[46, 70, 34, 58].map((h, i) => (
          <rect key={i} x={256 + i * 42} y={186 - h} width="26" height={h} rx="3" fill="#7BA4E0"
                className="ov-rise" style={{ animationDelay: `${1.7 + i * 0.14}s`, transformOrigin: `0px 186px` }} />
        ))}
      </g>
      <defs>
        <marker id="ovArrow2" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="7" orient="auto">
          <path d="M0 0 L10 4 L0 8 z" fill="#B85A2B" />
        </marker>
      </defs>
    </Frame>
  )
}

/* 5. Your own AI system — pieces orbit a core */
export function VisualSystem() {
  const bits = [
    ['Context file', -110, -62],
    ['Skill library', 112, -58],
    ['Working folder', -118, 58],
    ['Portfolio', 116, 62],
  ]
  return (
    <Frame label="A personal AI system with context, skills and folders connected to a core">
      <g transform={`translate(${S.w / 2} ${S.h / 2})`}>
        {bits.map(([, x, y], i) => (
          <path key={i} d={`M${x > 0 ? x - 12 : x + 12} ${y} L0 0`} stroke="#E5C9A8" strokeWidth="2.5"
                className="ov-draw" style={{ animationDelay: `${0.7 + i * 0.18}s` }} />
        ))}
        <circle r="46" fill="rgba(245,200,75,0.2)" className="ov-breathe" />
        <circle r="32" fill="#F5C84B" className="ov-pop" />
        <text y="5" textAnchor="middle" className="ov-core">You</text>
        {bits.map(([label, x, y], i) => (
          <g key={label} transform={`translate(${x} ${y})`} className="ov-stagger"
             style={{ animationDelay: `${0.3 + i * 0.18}s` }}>
            <rect x="-58" y="-16" width="116" height="32" rx="8" fill="#F2EBDD" />
            <text y="5" textAnchor="middle" className="ov-label">{label}</text>
          </g>
        ))}
      </g>
    </Frame>
  )
}

/* 6. Second brain — scattered notes converge into a searchable store */
export function VisualBrain() {
  const notes = [[52, 62], [140, 44], [232, 66], [64, 130], [156, 116], [246, 138]]
  return (
    <Frame label="Scattered notes converging into one searchable knowledge base">
      {notes.map(([x, y], i) => (
        <g key={i} className="ov-converge" style={{ animationDelay: `${0.3 + i * 0.13}s` }}>
          <rect x={x} y={y} width="56" height="40" rx="7" fill="#F2EBDD" />
          <rect x={x + 10} y={y + 12} width="30" height="5" rx="2.5" fill="#4C4C4C" opacity="0.5" />
          <rect x={x + 10} y={y + 24} width="20" height="5" rx="2.5" fill="#4C4C4C" opacity="0.35" />
        </g>
      ))}
      <g className="ov-stagger" style={{ animationDelay: '1.5s' }}>
        <rect x="290" y="96" width="142" height="108" rx="12" fill="rgba(123,164,224,0.15)" />
        <text x="361" y="132" textAnchor="middle" className="ov-label">Second brain</text>
        <rect x="308" y="150" width="106" height="24" rx="12" fill="#FFFFFF" />
        <text x="361" y="166" textAnchor="middle" className="ov-mini">ask anything</text>
        <circle cx="361" cy="192" r="5" fill="#7BA4E0" className="ov-breathe" />
      </g>
    </Frame>
  )
}

/* 7. Cloud agent — a schedule fires a pipeline with nobody at the desk */
export function VisualCloud() {
  const steps = ['Trigger', 'Agent', 'QA', 'Done']
  return (
    <Frame label="A scheduled agent running a pipeline in the cloud with no person involved">
      <text x="28" y="44" className="ov-eyebrow">RUNS WITHOUT YOU</text>
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <circle key={i} cx={40 + i * 12} cy="72" r="4" fill="#E5C9A8" />
        ))}
        <circle cx="40" cy="72" r="6" fill="#F5C84B" className="ov-tick" />
      </g>
      {steps.map((label, i) => (
        <g key={label}>
          <g className="ov-stagger" style={{ animationDelay: `${0.4 + i * 0.32}s` }}>
            <rect x="28" y={104 + i * 46} width="250" height="34" rx="9" fill="#F2EBDD" />
            <text x="46" y={126 + i * 46} className="ov-label">{label}</text>
          </g>
          {i < 3 && (
            <path d={`M52 ${138 + i * 46} L52 ${150 + i * 46}`} stroke="#B85A2B" strokeWidth="2.5"
                  className="ov-draw" style={{ animationDelay: `${0.7 + i * 0.32}s` }} />
          )}
        </g>
      ))}
      <g className="ov-stagger" style={{ animationDelay: '1.9s' }}>
        <rect x="300" y="150" width="132" height="76" rx="12" fill="rgba(31,83,64,0.1)" />
        <text x="366" y="182" textAnchor="middle" className="ov-label">Cloud</text>
        <text x="366" y="202" textAnchor="middle" className="ov-mini">always on</text>
      </g>
    </Frame>
  )
}

export const OUTCOME_VISUALS = {
  foundations: VisualFoundations,
  product: VisualProduct,
  inbox: VisualInbox,
  deck: VisualDeck,
  system: VisualSystem,
  brain: VisualBrain,
  cloud: VisualCloud,
}
