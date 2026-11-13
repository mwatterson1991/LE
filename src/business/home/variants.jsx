import React, { useEffect, useState } from 'react'

// Review-only switcher for sections that have more than one option. Choices
// live in the URL (?v=hero:b,paths:b) so a link reproduces exactly what someone
// saw. Option A is always the default and what ships unless we decide otherwise.
// To add an option: add it here, then branch on `v.<section>` in the page.
export const VARIANT_SECTIONS = [
  { id: 'hero', name: 'Hero', options: [{ key: 'a', label: 'Product hero (Hi-fi 4)' }, { key: 'b', label: 'Audience switcher (Idea D)' }] },
  { id: 'paths', name: 'Paths', options: [{ key: 'a', label: 'AI tile + four doors (Idea A)' }, { key: 'b', label: 'Glass rows (Hi-fi 6)' }] },
  { id: 'deep', name: 'AI transformation', options: [{ key: 'a', label: 'Image cards (Hi-fi 4)' }, { key: 'b', label: 'Sticky scroll (Idea D)' }] },
]

const DEFAULTS = Object.fromEntries(VARIANT_SECTIONS.map((s) => [s.id, 'a']))

function parse(search) {
  const raw = new URLSearchParams(search).get('v') || ''
  const out = { ...DEFAULTS }
  raw.split(',').forEach((pair) => {
    const [id, key] = pair.split(':')
    const sec = VARIANT_SECTIONS.find((s) => s.id === id)
    if (sec && sec.options.some((o) => o.key === key)) out[id] = key
  })
  return out
}

function serialize(v) {
  return VARIANT_SECTIONS.filter((s) => v[s.id] !== 'a').map((s) => `${s.id}:${v[s.id]}`).join(',')
}

/** Current variant per section. Defaults render at build time; the URL is read after mount. */
export function useHomeVariants() {
  const [v, setV] = useState(DEFAULTS)
  useEffect(() => { setV(parse(window.location.search)) }, [])
  const choose = (id, key) => {
    setV((prev) => {
      const next = { ...prev, [id]: key }
      // Built by hand so the URL stays readable (?v=hero:b) instead of %3A-encoded.
      const params = new URLSearchParams(window.location.search)
      params.delete('v')
      const rest = params.toString()
      const s = serialize(next)
      const query = [s ? `v=${s}` : '', rest].filter(Boolean).join('&')
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
      return next
    })
  }
  return [v, choose]
}

function useOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  return [open, setOpen]
}

export function VariantToggle({ v, choose }) {
  const [open, setOpen] = useOpen()
  const changed = VARIANT_SECTIONS.filter((s) => v[s.id] !== 'a').length
  return (
    <div className={`bh-vt${open ? ' is-open' : ''}`}>
      <div className="bh-vt-panel" role="dialog" aria-label="Section variations" aria-hidden={!open}>
        <div className="bh-vt-head">
          <b>Variations</b>
          <span>Review only. Links keep your picks.</span>
        </div>
        {VARIANT_SECTIONS.map((s) => (
          <div className="bh-vt-row" key={s.id}>
            <span className="bh-vt-name">{s.name}</span>
            <div className="bh-vt-opts" role="radiogroup" aria-label={s.name}>
              {s.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  role="radio"
                  aria-checked={v[s.id] === o.key}
                  title={o.label}
                  className={`bh-vt-opt${v[s.id] === o.key ? ' is-on' : ''}`}
                  onClick={() => choose(s.id, o.key)}
                  tabIndex={open ? 0 : -1}
                >
                  {o.key.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="bh-vt-desc">{s.options.find((o) => o.key === v[s.id]).label}</span>
          </div>
        ))}
      </div>
      <button type="button" className="bh-vt-pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 4h10M2 10h10M5 2v4M9 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        Variations{changed ? <em>{changed}</em> : null}
      </button>
    </div>
  )
}
