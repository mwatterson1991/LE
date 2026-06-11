import React from 'react'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatCohortDate(cohort) {
  const dateStr = cohort.iso.slice(0, 10)
  const d = new Date(dateStr + 'T12:00:00')
  const weekday = WEEKDAYS[d.getDay()]
  const base = `${weekday}, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
  // Append extra info from label (e.g. "(Copilot Only)")
  const plainDate = cohort.date?.replace(/\s*\(.*\)/, '') || ''
  const extra = cohort.label?.replace(plainDate, '').trim() || ''
  return extra ? `${base} ${extra}` : base
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
  if (sessionTimes.monday) {
    return (
      <div className="cohort-picker-times">
        {scheduleDays && <span className="cohort-picker-times-schedule">{scheduleDays}</span>}
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Mondays</span>
          <span className="cohort-picker-times-value">{sessionTimes.monday}</span>
        </div>
        <div className="cohort-picker-times-row">
          <span className="cohort-picker-times-day">Thursdays</span>
          <span className="cohort-picker-times-value">{sessionTimes.thursday}</span>
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
      <span className="cohort-picker-label">Cohort starting</span>
      <div className="cohort-picker-options">
        {cohorts.map((cohort) => {
          const disabled = !cohort.enrollUrl || cohort.soldOut
          const isActive = selected?.iso === cohort.iso
          const displayDate = formatCohortDate(cohort)
          return (
            <button
              key={cohort.iso}
              className={`cohort-picker-btn${isActive ? ' cohort-picker-btn-active' : ''}${disabled ? ' cohort-picker-btn-disabled' : ''}${cohort.soldOut ? ' cohort-picker-btn-sold' : ''}`}
              onClick={() => !disabled && onChange(cohort)}
              disabled={disabled}
              title={cohort.soldOut ? 'Sold out' : disabled ? 'Coming soon' : undefined}
            >
              <div className="cohort-picker-cal">
                <span className="cohort-picker-cal-month">{cohort.month}</span>
                <span className="cohort-picker-cal-day">{cohort.day}</span>
              </div>
              <div className="cohort-picker-text">
                <span className="cohort-picker-text-date">
                  {cohort.soldOut ? <span style={{ textDecoration: 'line-through' }}>{displayDate}</span> : displayDate}
                </span>
                {cohort.soldOut && <span className="cohort-picker-soon">Sold out</span>}
                {!cohort.soldOut && !cohort.enrollUrl && <span className="cohort-picker-soon">Soon</span>}
                {cohort.fillingFast && !cohort.soldOut && cohort.enrollUrl && <span className="cohort-picker-filling-fast">Filling fast</span>}
              </div>
              <span className={`cohort-picker-radio${isActive ? ' cohort-picker-radio-active' : ''}`} />
            </button>
          )
        })}
      </div>
      <SessionTimesLabel sessionTimes={selected?.sessionTimes} scheduleDays={selected?.scheduleDays} />
    </div>
  )
}
