import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter } from 'react-icons/fa';
import SpotCard from '../components/spots/SpotCard';
import FilterPanel from '../components/spots/FilterPanel';
import Loader from '../components/common/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import { searchSpots } from '../services/spotService';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const { position } = useGeolocation();
  const [query, setQuery] = useState(params.get('q') || '');
  const [sort, setSort] = useState('distance');
  const [filters, setFilters] = useState({});
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { spots } = await searchSpots({
        q: query || undefined,
        sort,
        lat: position.lat,
        lng: position.lng,
        ...cleanFilters,
      });
      setSpots(spots);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, sort, filters, position]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const submit = (e) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
    runSearch();
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      <form onSubmit={submit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search area or parking name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
        <button type="button" className="btn-secondary lg:hidden" onClick={() => setShowFilters((s) => !s)}>
          <FaFilter />
        </button>
      </form>

      <div className="flex gap-6">
        <aside className={`${showFilters ? 'block' : 'hidden'} w-full shrink-0 lg:block lg:w-64`}>
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{loading ? 'Searching…' : `${spots.length} results`}</p>
            <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="distance">Nearest</option>
              <option value="price">Cheapest</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {spots.map((s) => (
                <SpotCard key={s._id} spot={s} />
              ))}
              {spots.length === 0 && (
                <p className="col-span-full py-10 text-center text-gray-500">No spots match your filters.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
