import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import AvailabilityBadge from '../common/AvailabilityBadge';
import { formatCurrency } from '../../utils/helpers';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=60';

export default function SpotCard({ spot, distanceKm }) {
  const image = spot.images?.[0]?.url || PLACEHOLDER;
  return (
    <Link
      to={`/spots/${spot._id}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
        <div className="absolute left-2 top-2">
          <AvailabilityBadge available={spot.availableSpots} total={spot.totalSpots} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-white">{spot.name}</h3>
          {spot.averageRating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-200">
              <FaStar className="text-amber-400" /> {spot.averageRating}
            </span>
          )}
        </div>
        <p className="line-clamp-1 flex items-center gap-1 text-sm text-slate-400">
          <FaMapMarkerAlt className="shrink-0 text-brand-400" />
          {spot.address?.formatted || `${spot.address?.street}, ${spot.address?.city}`}
        </p>
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2.5">
          <span className="text-lg font-bold gradient-text">
            {formatCurrency(spot.pricing?.hourly)}
            <span className="text-xs font-normal text-slate-500">/hr</span>
          </span>
          {(distanceKm != null || spot.distance != null) && (
            <span className="text-xs text-slate-500">
              {(distanceKm ?? spot.distance / 1000).toFixed(1)} km away
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
