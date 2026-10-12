import { activePartner } from './partnerOffer'

// The checkout links used by the landing page: the cohort modal and the Level 1
// date strip both read from here, so they can never end up selling different
// products. This is the one file to edit when links change.
//
// Currently on bootcamp urn:bootcamp:69af7e391104a7bb1cbf5715. These match the
// per-cohort enrollUrls in courseData.js today, but they are kept explicit here
// rather than derived, so the landing page's links can be changed without
// touching the data the live /program page shares.
//
// Keyed by cohort start date. A cohort with no entry here is not offered for
// purchase and does not appear in the modal or the strip.
export const UNIFIED_CHECKOUT = {
  '2026-08-17': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231fa5e0ed35ab57e28232)',
  '2026-09-01': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a4fd3ad5c417da5103a1abd)',
  '2026-09-14': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a51144504bd393e57d03958)',
  '2026-10-05': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a511527100f60fd68b8fb51)',
  '2026-10-19': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a51165104bd393e57d0397c)',
  '2026-11-02': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a69077397de3ed8feceec1f)',
  '2026-11-16': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6ac92aa8513db10108cda5f2)',
  '2026-12-07': 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6ac92b02ecff5dc86fa80b90)',
}

// "I'm not sure yet": enroll now, choose a start date later. Same bootcamp as
// every dated cohort above, so an undecided buyer gets the same product.
const PICK_LATER_BASE_URL =
  'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a7cebc6e425705fa14adbb7)'

// Partner routes (/scaling) sell the same cohorts at the partner's discount. The
// code is appended here rather than at the route, so no link can reach checkout
// without it and changing cohort links stays a one-file edit.
export function withPartnerDiscount(url) {
  if (!url) return url
  const code = activePartner()?.discountCode
  if (!code) return url
  if (/[?&]discountCode=/i.test(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}discountCode=${encodeURIComponent(code)}`
}

export function unifiedCheckoutFor(iso) {
  const url = UNIFIED_CHECKOUT[String(iso).slice(0, 10)]
  return url ? withPartnerDiscount(url) : null
}

export function pickLaterUrl() {
  return withPartnerDiscount(PICK_LATER_BASE_URL)
}
