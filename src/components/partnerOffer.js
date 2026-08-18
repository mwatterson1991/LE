// Partner co-brand routes.
//
// /scaling is the Scaling.com co-branded view of the same program page served at
// /program: identical content, a partner logo in the nav, and the partner's
// discount shown on the page and applied to every checkout link.
//
// Before this existed, /scaling rendered a different component entirely, so the
// two pages drifted apart the moment /program changed. Keeping the partner as a
// lookup rather than a separate page means a partner audience always sees the
// current offer.
//
// Adding a partner is one entry here plus a route in App.jsx. No page section
// needs to know a partner exists; each one asks activePartner() and renders the
// same markup either way.

// The list price of the program, in dollars. Partner pricing is derived from it,
// so the discounted figure can never fall out of step with the full price.
export const FULL_PRICE = 1499

export const PARTNERS = {
  scaling: {
    slug: 'scaling',
    name: 'Scaling.com',
    // Lives at public/assets/logos/scaling-com.png
    logo: 'scaling-com.png',
    // Appended to checkout links as &discountCode=. Auto-applies at checkout.
    discountCode: 'scalersai50',
    discountPercent: 50,
    // Shown wherever the page needs to name the audience.
    audience: 'Scaling.com members',
  },
}

// Path -> partner. Matched on the first path segment so /scaling, /scaling/ and
// /scaling.html all resolve, matching how App.jsx routes with startsWith.
export function partnerForPath(pathname) {
  const slug = String(pathname || '')
    .replace(/^\/+/, '')
    .split(/[/?#]/)[0]
    .replace(/\.html$/, '')
  // Own keys only. A URL like /__proto__ or /constructor would otherwise walk the
  // prototype chain, return a truthy non-partner, and render "$NaN" and
  // "undefined% off for undefined" on the pricing card.
  return Object.hasOwn(PARTNERS, slug) ? PARTNERS[slug] : null
}

export function activePartner() {
  if (typeof window === 'undefined') return null
  return partnerForPath(window.location.pathname)
}

function formatUsd(amount) {
  const whole = Number.isInteger(amount)
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`
}

// The price to show, plus the struck-through list price when a discount applies.
// Returns { price, listPrice, discountLabel } with listPrice null off a partner
// route, so callers render one branch of markup and let the data decide.
export function offerPricing(partner = activePartner()) {
  if (!partner) {
    return { price: formatUsd(FULL_PRICE), listPrice: null, discountLabel: null }
  }
  const discounted = FULL_PRICE * (1 - partner.discountPercent / 100)
  return {
    price: formatUsd(discounted),
    listPrice: formatUsd(FULL_PRICE),
    discountLabel: `${partner.discountPercent}% off for ${partner.audience}`,
  }
}
