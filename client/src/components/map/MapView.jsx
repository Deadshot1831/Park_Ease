import { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { availabilityLevel, availabilityColor, formatCurrency } from '../../utils/helpers';
import SpotCard from '../spots/SpotCard';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const containerStyle = { width: '100%', height: '100%' };

// Builds a coloured SVG pin data URL for a given availability level
const pinIcon = (level) => {
  const color = availabilityColor[level];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24s16-13 16-24C32 7.2 24.8 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="15" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Graceful fallback when no Maps API key is configured — shows the spots as a grid
function MapFallback({ spots }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        <FaMapMarkedAlt />
        Map preview unavailable — set <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code> to enable the interactive map.
      </div>
      <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((s) => (
          <SpotCard key={s._id} spot={s} />
        ))}
        {spots.length === 0 && <p className="text-sm text-gray-500">No parking spots found here.</p>}
      </div>
    </div>
  );
}

export default function MapView({ center, spots = [], onMarkerClick }) {
  const [active, setActive] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY || '',
    id: 'parkease-google-maps',
  });

  const mapCenter = useMemo(() => ({ lat: center.lat, lng: center.lng }), [center]);
  const handleLoad = useCallback(() => {}, []);

  if (!MAPS_KEY) return <MapFallback spots={spots} />;
  if (!isLoaded) return <div className="flex h-full items-center justify-center text-gray-400">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      onLoad={handleLoad}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      <MarkerF
        position={mapCenter}
        icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="8" fill="#2563eb" stroke="white" stroke-width="3"/></svg>'
        )}` }}
      />
      {spots.map((spot) => {
        const [lng, lat] = spot.location.coordinates;
        const level = availabilityLevel(spot.availableSpots, spot.totalSpots);
        return (
          <MarkerF
            key={spot._id}
            position={{ lat, lng }}
            icon={{ url: pinIcon(level) }}
            onClick={() => {
              setActive(spot);
              onMarkerClick?.(spot);
            }}
          />
        );
      })}

      {active && (
        <InfoWindowF
          position={{ lat: active.location.coordinates[1], lng: active.location.coordinates[0] }}
          onCloseClick={() => setActive(null)}
        >
          <div className="w-48">
            <h4 className="font-semibold text-gray-900">{active.name}</h4>
            <p className="text-xs text-gray-500">{active.address?.city}</p>
            <p className="mt-1 text-sm font-bold text-brand-700">
              {formatCurrency(active.pricing?.hourly)}/hr · {active.availableSpots} free
            </p>
            <Link to={`/spots/${active._id}`} className="mt-2 block text-sm font-medium text-brand-600 hover:underline">
              View details →
            </Link>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
