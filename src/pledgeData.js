// Single source of truth for the 100M Pledge counter so the home page band and
// the /pledge page always show the same number. Update PLEDGE_TOTAL here and
// both surfaces stay in sync.
export const PLEDGE_TOTAL = 222742
export const PLEDGE_GOAL = 100000000

// People learning AI on Leland added today (today's count shown next to the
// cumulative total on the pledge page).
export const PLEDGE_TODAY = 1130

// Monthly cumulative total of people learning AI on Leland. This drives the
// growth chart on the /pledge page. For now these values are maintained by hand;
// the intent is to wire this to Databricks so the cumulative total updates
// automatically each month (query the people-learning table, group by month,
// running total). The final entry should match PLEDGE_TOTAL above.
export const PLEDGE_SERIES = [
  { month: 'May 2025', value: 4200 },
  { month: 'Jun 2025', value: 9800 },
  { month: 'Jul 2025', value: 17500 },
  { month: 'Aug 2025', value: 27000 },
  { month: 'Sep 2025', value: 39000 },
  { month: 'Oct 2025', value: 54000 },
  { month: 'Nov 2025', value: 71000 },
  { month: 'Dec 2025', value: 92000 },
  { month: 'Jan 2026', value: 116000 },
  { month: 'Feb 2026', value: 141000 },
  { month: 'Mar 2026', value: 166000 },
  { month: 'Apr 2026', value: 190000 },
  { month: 'May 2026', value: 208000 },
  { month: 'Jun 2026', value: PLEDGE_TOTAL },
]
