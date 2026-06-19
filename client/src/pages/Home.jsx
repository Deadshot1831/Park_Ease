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

// Moved here from the (removed) standalone showcase page
import './showcase/showcase.css';
import ScrollHero from './showcase/ScrollHero';
import FeaturesSection from './showcase/FeaturesSection';
import SpecsSection from './showcase/SpecsSection';
import ClosingCTA from './showcase/ClosingCTA';

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
    <div className="flex flex-1 flex-col">
      {/* Scroll-driven hero (Higgsfield video) — full-bleed */}
      <div className="lux">
        <ScrollHero />
      </div>

      {/* Functional parking finder */}
      <section id="parking" className="mx-auto w-full max-w-7xl scroll-mt-24 px-3 pt-10 sm:px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Parking near you</h2>
            <p className="mt-1 text-sm text-slate-400">
              {loading ? 'Finding nearby spots…' : `${available} of ${spots.length} spots open right now.`}
            </p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-11"
                placeholder="Search by area, e.g. Indiranagar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>

        <div className="mt-5 flex items-center justify-between">
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

        <div className="pb-12 pt-5">
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
      </section>

      {/* Showcase marketing sections */}
      <div className="lux">
        <FeaturesSection />
        <SpecsSection />
        <ClosingCTA />
      </div>
    </div>
  );
}
