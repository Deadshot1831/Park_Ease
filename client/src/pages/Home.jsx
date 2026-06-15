import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSearch, FaListUl, FaMapMarkedAlt, FaBolt } from 'react-icons/fa';
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

  useAvailabilitySocket(
    useCallback(({ spotId, availableSpots }) => {
      setSpots((prev) => prev.map((s) => (s._id === spotId ? { ...s, availableSpots } : s)));
    }, [])
  );

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const available = spots.filter((s) => s.availableSpots > 0).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 pt-6 sm:px-4">
      {/* Hero */}
      <section className="glass relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-neon-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge mx-auto mb-4 border border-white/10 bg-white/5 text-brand-200">
            <FaBolt className="text-neon-400" /> Real-time availability
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Find & book <span className="gradient-text">parking</span> near you
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Reserve a guaranteed spot before you arrive — {available} of {spots.length} nearby spots open right now.
          </p>
          <form onSubmit={submitSearch} className="mx-auto mt-7 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-11"
                placeholder="Search by area, e.g. Indiranagar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              <FaSearch /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-5">
        <h2 className="text-lg font-semibold text-white">Parking near you</h2>
        <div className="pill-group">
          <button
            onClick={() => setView('map')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${view === 'map' ? 'bg-white text-ink-900' : 'text-slate-300 hover:text-white'}`}
          >
            <FaMapMarkedAlt /> Map
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${view === 'list' ? 'bg-white text-ink-900' : 'text-slate-300 hover:text-white'}`}
          >
            <FaListUl /> List
          </button>
        </div>
      </div>

      <div className="flex-1 pb-8">
        {loading ? (
          <Loader label="Finding parking near you…" />
        ) : view === 'map' ? (
          <div className="h-[62vh] overflow-hidden rounded-2xl border border-white/10 shadow-glass">
            <MapView center={position} spots={spots} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s) => (
              <SpotCard key={s._id} spot={s} />
            ))}
            {spots.length === 0 && <p className="text-slate-400">No parking spots found nearby.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
