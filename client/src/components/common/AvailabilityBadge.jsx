import { availabilityLevel, availabilityLabel } from '../../utils/helpers';

const styles = {
  available: 'bg-green-100 text-green-700',
  limited: 'bg-amber-100 text-amber-700',
  full: 'bg-red-100 text-red-700',
};

export default function AvailabilityBadge({ available, total }) {
  const level = availabilityLevel(available, total);
  return (
    <span className={`badge ${styles[level]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {availabilityLabel[level]}
      {level !== 'full' && total ? ` · ${available}/${total}` : ''}
    </span>
  );
}
