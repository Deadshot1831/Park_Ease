import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import OwnerNav from '../../components/layout/OwnerNav';
import Loader from '../../components/common/Loader';
import { getIncomingBookings, updateBookingStatus } from '../../services/bookingService';
import { formatCurrency } from '../../utils/helpers';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Incoming Bookings</h1>
      <OwnerNav />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
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
        <div className="card divide-y divide-gray-100">
          {bookings.map((b) => (
            <div key={b._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{b.parkingSpot?.name}</p>
                  <span className={`badge ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {b.user?.name} · {b.vehicle?.number} · {formatCurrency(b.amount)}
                </p>
                <p className="text-xs text-gray-400">
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
          {bookings.length === 0 && <p className="p-10 text-center text-gray-500">No bookings in this view.</p>}
        </div>
      )}
    </div>
  );
}
