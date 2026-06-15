import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSearch, FaListUl, FaMapMarkedAlt } from 'react-icons/fa';
import MapView from '../components/map/MapView';
import SpotCard from '../components/spots/SpotCard';
import Loader from '../components/common/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAvailabilitySocket } from '../hooks/useSocket';
import { getNearbySpots } from '../services/spotService';

export default function Home() {
  const { position, loading: geoLoading } = useGeolocation();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map' | 'list'
  const [query, setQuery] = useState('');

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    try {
      const { spots } = await getNearbySpots(position.lat, position.lng, 10000);
      setSpots(spots);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    if (!geoLoading) fetchSpots();
  }, [geoLoading, fetchSpots]);

  // Live availability updates
  useAvailabilitySocket(
    useCallback(({ spotId, availableSpots }) => {
      setSpots((prev) => prev.map((s) => (s._id === spotId ? { ...s, availableSpots } : s)));
    }, [])
  );

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero search */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Find & book parking near you</h1>
          <p className="mt-2 text-brand-100">
            Real-time availability across {spots.length}+ spots — reserve your spot before you arrive.
          </p>
          <form onSubmit={submitSearch} className="mx-auto mt-6 flex max-w-xl gap-2">
            <input
              className="input flex-1 text-gray-800"
              placeholder="Search by area, e.g. Indiranagar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn bg-white text-brand-700 hover:bg-brand-50">
              <FaSearch /> Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Parking near you</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'map' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
          >
            <FaMapMarkedAlt /> Map
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
          >
            <FaListUl /> List
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10">
        {loading ? (
          <Loader label="Finding parking near you…" />
        ) : view === 'map' ? (
          <div className="h-[60vh] overflow-hidden rounded-xl border border-gray-100 shadow-card">
            <MapView center={position} spots={spots} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s) => (
              <SpotCard key={s._id} spot={s} />
            ))}
            {spots.length === 0 && <p className="text-gray-500">No parking spots found nearby.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
