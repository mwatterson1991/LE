import React, { useState, useEffect } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer({ targetIso, label }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    function calc() {
      const diff = new Date(targetIso) - Date.now()
      if (diff <= 0) return setTimeLeft(null)
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ days, hours, mins, secs })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  if (!timeLeft) {
    return (
      <div className="countdown-wrap">
        <span className="countdown-live">Cohort is live</span>
      </div>
    )
  }

  return (
    <div className="countdown-wrap">
      <span className="countdown-label">{label || 'First session starts in'}</span>
      <div className="countdown-units">
        <div className="countdown-unit">
          <span className="countdown-num">{pad(timeLeft.days)}</span>
          <span className="countdown-unit-label">days</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-num">{pad(timeLeft.hours)}</span>
          <span className="countdown-unit-label">hrs</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-num">{pad(timeLeft.mins)}</span>
          <span className="countdown-unit-label">min</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-num">{pad(timeLeft.secs)}</span>
          <span className="countdown-unit-label">sec</span>
        </div>
      </div>
    </div>
  )
}
