import { FaStar, FaRegStar } from 'react-icons/fa';

export default function StarRating({ value = 0, size = 16, onChange, className = '' }) {
  const interactive = typeof onChange === 'function';
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const Icon = filled ? FaStar : FaRegStar;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(n)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Icon size={size} className="text-amber-400" />
          </button>
        );
      })}
    </div>
  );
}
