import React from 'react'

function SessionTimesLabel({ sessionTimes }) {
  if (!sessionTimes) return null
  if (sessionTimes.morning) {
    return (
      <div className="cohort-picker-times">
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Morning</span>
          <span className="cohort-picker-times-value">{sessionTimes.morning}</span>
        </div>
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Afternoon</span>
          <span className="cohort-picker-times-value">{sessionTimes.afternoon}</span>
        </div>
        <span className="cohort-picker-times-note">Attend either section each week</span>
      </div>
    )
  }
  if (sessionTimes.tuesday) {
    return (
      <div className="cohort-picker-times">
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Tuesdays</span>
          <span className="cohort-picker-times-value">{sessionTimes.tuesday}</span>
        </div>
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Fridays</span>
          <span className="cohort-picker-times-value">{sessionTimes.friday}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function CohortPicker({ cohorts, selected, onChange }) {
  if (!cohorts || cohorts.length <= 1) return null
  return (
    <div className="cohort-picker">
      <span className="cohort-picker-label">Select your start date</span>
      <div className="cohort-picker-options">
        {cohorts.map((cohort) => {
          const disabled = !cohort.enrollUrl
          return (
            <button
              key={cohort.iso}
              className={`cohort-picker-btn${selected?.iso === cohort.iso ? ' cohort-picker-btn-active' : ''}${disabled ? ' cohort-picker-btn-disabled' : ''}`}
              onClick={() => !disabled && onChange(cohort)}
              disabled={disabled}
              title={disabled ? 'Coming soon' : undefined}
            >
              {cohort.label}
              {disabled && <span className="cohort-picker-soon"> · Soon</span>}
            </button>
          )
        })}
      </div>
      <SessionTimesLabel sessionTimes={selected?.sessionTimes} />
    </div>
  )
}
