import React from 'react'

function getWeekday(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Denver' })
}

function SessionTimesLabel({ sessionTimes, scheduleDays }) {
  if (!sessionTimes) return null
  if (sessionTimes.morning) {
    return (
      <div className="cohort-picker-times">
        {scheduleDays && <span className="cohort-picker-times-schedule">{scheduleDays}</span>}
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Morning</span>
          <span className="cohort-picker-times-value">{sessionTimes.morning}</span>
        </div>
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Afternoon</span>
          <span className="cohort-picker-times-value">{sessionTimes.afternoon}</span>
        </div>
        <span className="cohort-picker-times-note">90-min sessions · Attend either section each week</span>
      </div>
    )
  }
  if (sessionTimes.tuesday) {
    return (
      <div className="cohort-picker-times">
        {scheduleDays && <span className="cohort-picker-times-schedule">{scheduleDays}</span>}
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
          const disabled = !cohort.enrollUrl || cohort.soldOut
          return (
            <button
              key={cohort.iso}
              className={`cohort-picker-btn${selected?.iso === cohort.iso ? ' cohort-picker-btn-active' : ''}${disabled ? ' cohort-picker-btn-disabled' : ''}${cohort.soldOut ? ' cohort-picker-btn-sold' : ''}`}
              onClick={() => !disabled && onChange(cohort)}
              disabled={disabled}
              title={cohort.soldOut ? 'Sold out' : disabled ? 'Coming soon' : undefined}
            >
              {cohort.soldOut ? <span style={{ textDecoration: 'line-through' }}>{cohort.label}</span> : cohort.label}
              {cohort.soldOut && <span className="cohort-picker-soon"> · Sold out</span>}
              {!cohort.soldOut && !cohort.enrollUrl && <span className="cohort-picker-soon"> · Soon</span>}
              {cohort.fillingFast && !cohort.soldOut && cohort.enrollUrl && <span className="cohort-picker-filling-fast">Filling fast</span>}
            </button>
          )
        })}
      </div>
      <SessionTimesLabel sessionTimes={selected?.sessionTimes} scheduleDays={selected?.scheduleDays} />
    </div>
  )
}
