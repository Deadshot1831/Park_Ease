import { useEffect, useState } from 'react';
import { FaParking, FaCar, FaRupeeSign, FaCheckCircle } from 'react-icons/fa';
import OwnerNav from '../../components/layout/OwnerNav';
import Loader from '../../components/common/Loader';
import { getMySpots } from '../../services/spotService';
import { getIncomingBookings } from '../../services/bookingService';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tint}`}>
      <Icon className="text-xl" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getMySpots(), getIncomingBookings()])
      .then(([{ spots }, { bookings }]) => {
        const revenue = bookings
          .filter((b) => ['confirmed', 'active', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + (b.amount || 0), 0);
        setStats({
          spots: spots.length,
          totalSpots: spots.reduce((s, sp) => s + sp.totalSpots, 0),
          bookings: bookings.length,
          confirmed: bookings.filter((b) => b.status === 'confirmed').length,
          revenue,
          recent: bookings.slice(0, 5),
        });
      })
      .catch(() => setStats({ spots: 0, bookings: 0, revenue: 0, recent: [] }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
      <OwnerNav />

      {!stats ? (
        <Loader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FaParking} label="Listings" value={stats.spots} tint="bg-brand-50 text-brand-600" />
            <StatCard icon={FaCar} label="Total spots" value={stats.totalSpots} tint="bg-blue-50 text-blue-600" />
            <StatCard icon={FaCheckCircle} label="Confirmed bookings" value={stats.confirmed} tint="bg-green-50 text-green-600" />
            <StatCard icon={FaRupeeSign} label="Revenue" value={formatCurrency(stats.revenue)} tint="bg-amber-50 text-amber-600" />
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-900">Recent bookings</h2>
          <div className="card divide-y divide-gray-100">
            {stats.recent.map((b) => (
              <div key={b._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{b.parkingSpot?.name}</p>
                  <p className="text-sm text-gray-500">{b.user?.name} · {b.vehicle?.number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(b.amount)}</p>
                  <p className="text-xs capitalize text-gray-400">{b.status}</p>
                </div>
              </div>
            ))}
            {stats.recent.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No bookings yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
