import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import OwnerNav from '../../components/layout/OwnerNav';
import Loader from '../../components/common/Loader';
import { getIncomingBookings, updateBookingStatus } from '../../services/bookingService';
import { formatCurrency } from '../../utils/helpers';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  confirmed: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  active: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30',
  completed: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
  cancelled: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
};

const TABS = ['all', 'confirmed', 'active', 'completed'];

export default function IncomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { bookings } = await getIncomingBookings(tab === 'all' ? undefined : tab);
      setBookings(bookings);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Marked ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-3 py-8 sm:px-4">
      <h1 className="text-2xl font-bold text-white">Incoming Bookings</h1>
      <div className="mt-5" />
      <OwnerNav />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t ? 'bg-brand-gradient text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card divide-y divide-white/5">
          {bookings.map((b) => (
            <div key={b._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{b.parkingSpot?.name}</p>
                  <span className={`badge ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <p className="text-sm text-slate-400">
                  {b.user?.name} · {b.vehicle?.number} · <span className="text-brand-300">{formatCurrency(b.amount)}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {b.status === 'confirmed' && (
                  <button onClick={() => setStatus(b._id, 'active')} className="btn-secondary text-xs">
                    Check in
                  </button>
                )}
                {b.status === 'active' && (
                  <button onClick={() => setStatus(b._id, 'completed')} className="btn-primary text-xs">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="p-10 text-center text-slate-400">No bookings in this view.</p>}
        </div>
      )}
    </div>
  );
}
