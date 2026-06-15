import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import OwnerNav from '../../components/layout/OwnerNav';
import Loader from '../../components/common/Loader';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { getMySpots, deleteSpot, updateSpot, updateAvailability } from '../../services/spotService';
import { formatCurrency } from '../../utils/helpers';

export default function MyListings() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMySpots()
      .then(({ spots }) => setSpots(spots))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteSpot(id);
      toast.success('Listing deleted');
      setSpots((s) => s.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleActive = async (spot) => {
    try {
      await updateSpot(spot._id, { isActive: !spot.isActive });
      setSpots((s) => s.map((x) => (x._id === spot._id ? { ...x, isActive: !x.isActive } : x)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setAvailability = async (spot, value) => {
    try {
      const { spot: updated } = await updateAvailability(spot._id, value);
      setSpots((s) => s.map((x) => (x._id === spot._id ? updated : x)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-8 sm:px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Listings</h1>
        <Link to="/owner/listings/new" className="btn-primary">
          <FaPlus /> Add Spot
        </Link>
      </div>
      <div className="mt-5" />
      <OwnerNav />

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {spots.map((spot) => (
            <div key={spot._id} className="card card-hover flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img
                src={spot.images?.[0]?.url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200'}
                alt=""
                className="h-20 w-full rounded-xl object-cover sm:w-28"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/spots/${spot._id}`} className="font-semibold text-white hover:text-brand-300">
                    {spot.name}
                  </Link>
                  <AvailabilityBadge available={spot.availableSpots} total={spot.totalSpots} />
                  {!spot.isActive && <span className="badge bg-white/10 text-slate-400">Inactive</span>}
                </div>
                <p className="text-sm text-slate-400">
                  {spot.address?.city} · <span className="text-brand-300">{formatCurrency(spot.pricing?.hourly)}/hr</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-slate-500">Available:</label>
                  <input
                    type="number"
                    min="0"
                    max={spot.totalSpots}
                    defaultValue={spot.availableSpots}
                    onBlur={(e) => setAvailability(spot, Number(e.target.value))}
                    className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-100 outline-none focus:border-brand-400/60"
                  />
                  <span className="text-xs text-slate-500">/ {spot.totalSpots}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(spot)} className="btn-ghost cursor-pointer text-xl" title="Toggle active">
                  {spot.isActive ? <FaToggleOn className="text-emerald-400" /> : <FaToggleOff className="text-slate-500" />}
                </button>
                <button onClick={() => remove(spot._id)} className="btn-ghost cursor-pointer text-rose-400/70 hover:text-rose-400">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          {spots.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              No listings yet.{' '}
              <Link to="/owner/listings/new" className="text-brand-300 hover:text-brand-200">
                Add your first spot →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
