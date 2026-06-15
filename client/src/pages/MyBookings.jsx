import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
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
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500'
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
            <div key={b._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <img
                src={b.parkingSpot?.images?.[0]?.url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200'}
                alt=""
                className="h-20 w-full rounded-lg object-cover sm:w-28"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/spots/${b.parkingSpot?._id}`} className="font-semibold text-gray-900 hover:text-brand-700">
                    {b.parkingSpot?.name || 'Parking spot'}
                  </Link>
                  <span className={`badge ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {b.vehicle?.number} · {formatCurrency(b.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                {b.qrCode && (
                  <button onClick={() => setQr(b.qrCode)} className="btn-secondary text-xs">
                    QR
                  </button>
                )}
                {['pending', 'confirmed'].includes(b.status) && (
                  <button onClick={() => handleCancel(b._id)} className="btn-ghost text-xs text-red-500">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="card p-10 text-center text-gray-500">
              No bookings here. <Link to="/" className="text-brand-600 hover:underline">Find parking →</Link>
            </div>
          )}
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQr(null)}>
          <div className="card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <img src={qr} alt="Booking QR" className="h-56 w-56" />
            <p className="mt-2 text-sm text-gray-500">Show at the entrance</p>
          </div>
        </div>
      )}
    </div>
  );
}
