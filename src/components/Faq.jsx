import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Shared FAQ accordion (leland.ai design) used across the site so every page's
// FAQ looks and behaves the same. Pass `items` as [{ q, a }].
const ChevronIcon = () => (
  <svg className="lai-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={`lai-faq-item${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="lai-faq-q">
        <h3 className="lai-faq-question">{item.q}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}>
          <ChevronIcon />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="lai-faq-answer">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Faq({ items, defaultOpen = null }) {
  const [openFaq, setOpenFaq] = useState(defaultOpen)
  return (
    <div className="lai-faq-list">
      {items.map((item, i) => (
        <FaqItem key={i} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
      ))}
    </div>
  )
}
