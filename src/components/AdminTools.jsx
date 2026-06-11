import React, { useState, useRef, useEffect } from 'react'
import { useAdminTools } from './AdminToolsContext'
import './AdminTools.css'

const toggles = [
  { key: 'trackCards', label: 'Track Cards', options: ['v1', 'v2', 'v3'] },
]

export default function AdminTools() {
  const { variants, setVariant } = useAdminTools()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        className="admin-tools-trigger"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Admin tools"
      >
        ···
      </button>
      <div
        ref={panelRef}
        className={`admin-tools-panel${open ? ' admin-tools-panel-open' : ''}`}
      >
        <div className="admin-tools-panel-title">Admin Tools</div>
        {toggles.map(toggle => (
          <div className="admin-tools-row" key={toggle.key}>
            <span className="admin-tools-row-label">{toggle.label}</span>
            <div className="admin-tools-segmented">
              {toggle.options.map(opt => (
                <button
                  key={opt}
                  className={`admin-tools-seg-btn${variants[toggle.key] === opt ? ' admin-tools-seg-active' : ''}`}
                  onClick={() => setVariant(toggle.key, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
