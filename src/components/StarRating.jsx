import './StarRating.css'

// Fractional star rating. Renders five stars and fills them left-to-right to
// `value` (out of 5) using a two-layer width clip: a dim "empty" row underneath
// and a gold "fill" row on top, clipped to (value / 5). A 4.6 leaves the fifth
// star ~60% gold. Pure CSS — the fill tracks whatever `value` it's given.
//
// Decorative by design: the adjacent "N/5 from N reviews" text is the
// authoritative label, so the stars are aria-hidden to avoid a screen reader
// announcing the rating twice.

const STAR_PATH =
  'M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z'

function StarRow({ color, size }) {
  return (
    <span className="star-rating-row">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="star-rating-star"
          viewBox="0 0 20 20"
          fill={color}
          width={size}
          height={size}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  )
}

export default function StarRating({
  value,
  size = 18,
  gap = 2,
  fillColor = '#FFD667',
  emptyColor = 'rgba(255, 255, 255, 0.24)',
}) {
  const pct = Math.max(0, Math.min(1, (value || 0) / 5)) * 100
  return (
    <span
      className="star-rating"
      style={{ '--star-fill': `${pct}%`, '--star-gap': `${gap}px` }}
      aria-hidden="true"
    >
      <StarRow color={emptyColor} size={size} />
      <span className="star-rating-fill">
        <StarRow color={fillColor} size={size} />
      </span>
    </span>
  )
}
