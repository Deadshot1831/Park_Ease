import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  confirmed: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  active: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30',
  completed: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
  cancelled: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
};

const TABS = ['all', 'confirmed', 'completed', 'cancelled'];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [qr, setQr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { bookings } = await getMyBookings(tab === 'all' ? undefined : tab);
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

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-white">My Bookings</h1>

      <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1">
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
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card card-hover flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <img
                src={b.parkingSpot?.images?.[0]?.url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200'}
                alt=""
                className="h-20 w-full rounded-xl object-cover sm:w-28"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/spots/${b.parkingSpot?._id}`} className="font-semibold text-white hover:text-brand-300">
                    {b.parkingSpot?.name || 'Parking spot'}
                  </Link>
                  <span className={`badge ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">
                  {b.vehicle?.number} · <span className="text-brand-300">{formatCurrency(b.amount)}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {['confirmed', 'active'].includes(b.status) && (
                  <Link to="/guard" className="btn-secondary text-xs">
                    Monitor
                  </Link>
                )}
                {b.qrCode && (
                  <button onClick={() => setQr(b.qrCode)} className="btn-secondary text-xs">
                    QR
                  </button>
                )}
                {['pending', 'confirmed'].includes(b.status) && (
                  <button onClick={() => handleCancel(b._id)} className="btn-ghost text-xs text-rose-300 hover:text-rose-200">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              No bookings here. <Link to="/" className="text-brand-300 hover:text-brand-200">Find parking →</Link>
            </div>
          )}
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setQr(null)}>
          <div className="card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <img src={qr} alt="Booking QR" className="h-56 w-56 rounded-xl bg-white p-2" />
            <p className="mt-2 text-sm text-slate-400">Show at the entrance</p>
          </div>
        </div>
      )}
    </div>
  );
}
