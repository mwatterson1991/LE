import React, { useState, useEffect, useRef } from 'react'
import { useSiteData } from '../siteData.jsx'
import posthog from 'posthog-js'

// Small deterministic tilt per card, mirroring the results page marquee
const MQ_ROTATIONS = [-2, 1.5, -1, 2.5, -2.5, 1, -0.5, 2, -1.5, 0.5]
const MQ_PX_PER_SEC = 45

function DemoCard({ demo, index }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <a
      href={`https://www.lelandcourses.com/program/results/?demo=${demo.streamUid}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mq-card"
      style={{ transform: `rotate(${MQ_ROTATIONS[index % MQ_ROTATIONS.length]}deg)` }}
      onClick={() => posthog.capture('app--results_demo_click', { source: 'testimonials', demo: demo.name })}
    >
      <div className="mq-video">
        {!imgFailed ? (
          <img
            src={demo.thumb}
            alt={demo.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="mq-video-ph">Video coming soon</div>
        )}
      </div>
      <span className="mq-name">{demo.name}</span>
      <p className="mq-what">{demo.whatBuilt}</p>
      <div className="mq-meta">
        {demo.fn && <span className="tag">{demo.fn}</span>}
      </div>
    </a>
  )
}

export default function ResultsCTASection({
  label = 'Proof It Works',
  heading = 'See what people have built',
  subhead = 'Watch real demos of what AI Builder Program graduates have built during the program.',
} = {}) {
  const demos = useSiteData('demos.json') || []
  const trackRef = useRef(null)

  const levels = [...new Set(demos.map(d => d.level).filter(Boolean))].sort()
  const doubled = [...demos, ...demos]

  useEffect(() => {
    if (!demos.length) return
    const setSpeed = () => {
      const track = trackRef.current
      if (!track) return
      const oneSetWidth = track.scrollWidth / 2
      track.style.animationDuration = `${oneSetWidth / MQ_PX_PER_SEC}s`
    }
    setSpeed()
    window.addEventListener('resize', setSpeed)
    return () => window.removeEventListener('resize', setSpeed)
  }, [demos])

  return (
    <section className="results-cta-section">
      <div className="results-cta-intro">
        <p className="testimonials-label">
          <span className="testimonials-dot" />
          {label}
        </p>
        <h2 className="testimonials-heading">{heading}</h2>
        <p className="results-cta-subhead">{subhead}</p>
        {demos.length > 0 && (
          <p className="results-cta-meta">
            {demos.length} demos <span className="results-cta-meta-dot" /> Levels {levels[0]}&ndash;{levels[levels.length - 1]}
          </p>
        )}
      </div>

      {demos.length > 0 && (
        <div className="mq-wrap">
          <div className="mq-track" ref={trackRef}>
            {doubled.map((d, i) => <DemoCard demo={d} index={i} key={i} />)}
          </div>
        </div>
      )}

      <div className="results-cta-btn-wrap">
        <a
          href="https://www.lelandcourses.com/program/results/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg results-cta-btn"
          onClick={() => posthog.capture('app--results_cta_click', { source: 'testimonials' })}
        >
          See our results <span className="arrow">→</span>
        </a>
      </div>
    </section>
  )
}
