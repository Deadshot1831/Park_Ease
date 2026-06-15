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
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-elevated"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={spot.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2">
          <AvailabilityBadge available={spot.availableSpots} total={spot.totalSpots} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900">{spot.name}</h3>
          {spot.averageRating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-gray-700">
              <FaStar className="text-amber-400" /> {spot.averageRating}
            </span>
          )}
        </div>
        <p className="line-clamp-1 flex items-center gap-1 text-sm text-gray-500">
          <FaMapMarkerAlt className="shrink-0 text-brand-400" />
          {spot.address?.formatted || `${spot.address?.street}, ${spot.address?.city}`}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-700">
            {formatCurrency(spot.pricing?.hourly)}
            <span className="text-xs font-normal text-gray-400">/hr</span>
          </span>
          {(distanceKm != null || spot.distance != null) && (
            <span className="text-xs text-gray-400">
              {(distanceKm ?? spot.distance / 1000).toFixed(1)} km away
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
