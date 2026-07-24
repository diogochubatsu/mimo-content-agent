import { useState } from 'react'

export default function Rating({ initialRating = 0, readonly = false }) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
          onClick={() => !readonly && setRating(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
      {rating > 0 && <span className="rating-value">{rating}/5</span>}
      
      <style jsx>{`
        .rating { display: inline-flex; align-items: center; gap: 5px; }
        .star { font-size: 1.5rem; color: #ddd; cursor: pointer; transition: color 0.2s; }
        .star.filled { color: #ffc107; }
        .rating-value { margin-left: 10px; color: #666; font-size: 0.9rem; }
      `}</style>
    </div>
  )
}
