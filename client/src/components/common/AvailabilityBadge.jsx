import { availabilityLevel, availabilityLabel } from '../../utils/helpers';

const styles = {
  available: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  limited: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  full: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
};

export default function AvailabilityBadge({ available, total }) {
  const level = availabilityLevel(available, total);
  return (
    <span className={`badge backdrop-blur-md ${styles[level]}`}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      {availabilityLabel[level]}
      {level !== 'full' && total ? ` · ${available}/${total}` : ''}
    </span>
  );
}
