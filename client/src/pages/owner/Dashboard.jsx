import { useEffect, useState } from 'react';
import { FaParking, FaCar, FaRupeeSign, FaCheckCircle } from 'react-icons/fa';
import OwnerNav from '../../components/layout/OwnerNav';
import Loader from '../../components/common/Loader';
import MiniChart from '../../components/common/MiniChart';
import { getMySpots } from '../../services/spotService';
import { getIncomingBookings } from '../../services/bookingService';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="card card-hover flex items-center gap-4 p-5">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
      <Icon className="text-xl" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
);

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getMySpots(), getIncomingBookings()])
      .then(([{ spots }, { bookings }]) => {
        const paid = bookings.filter((b) => ['confirmed', 'active', 'completed'].includes(b.status));
        const revenue = paid.reduce((sum, b) => sum + (b.amount || 0), 0);

        // Revenue by recent month for the trend chart
        const byMonth = MONTHS.map((label, i) => {
          const monthRevenue = paid
            .filter((b) => new Date(b.createdAt).getMonth() === (6 + i) % 12)
            .reduce((s, b) => s + (b.amount || 0), 0);
          return { label, value: monthRevenue };
        });
        const peak = byMonth.reduce((best, d, i) => (d.value > byMonth[best].value ? i : best), 0);

        setStats({
          spots: spots.length,
          totalSpots: spots.reduce((s, sp) => s + sp.totalSpots, 0),
          bookings: bookings.length,
          confirmed: bookings.filter((b) => b.status === 'confirmed').length,
          revenue,
          recent: bookings.slice(0, 5),
          chart: byMonth,
          peak,
        });
      })
      .catch(() => setStats({ spots: 0, bookings: 0, revenue: 0, recent: [], chart: [], peak: -1 }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-8 sm:px-4">
      <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
      <p className="mb-5 text-sm text-slate-400">Monitor your listings, bookings and revenue in real time.</p>
      <OwnerNav />

      {!stats ? (
        <Loader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FaParking} label="Listings" value={stats.spots} tint="bg-brand-500/15 text-brand-300" />
            <StatCard icon={FaCar} label="Total spots" value={stats.totalSpots} tint="bg-sky-500/15 text-sky-300" />
            <StatCard icon={FaCheckCircle} label="Confirmed bookings" value={stats.confirmed} tint="bg-emerald-500/15 text-emerald-300" />
            <StatCard icon={FaRupeeSign} label="Revenue" value={formatCurrency(stats.revenue)} tint="bg-neon-500/15 text-neon-400" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Revenue trend chart */}
            <div className="card relative overflow-hidden p-5 lg:col-span-1">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-neon-500/20 blur-3xl" />
              <div className="relative mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-white">Revenue trend</h2>
                <span className="text-xs text-slate-500">This year</span>
              </div>
              <MiniChart data={stats.chart} highlight={stats.peak} />
            </div>

            {/* Recent bookings */}
            <div className="lg:col-span-2">
              <h2 className="mb-3 font-semibold text-white">Recent bookings</h2>
              <div className="card divide-y divide-white/5">
                {stats.recent.map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-white">{b.parkingSpot?.name}</p>
                      <p className="text-sm text-slate-400">{b.user?.name} · {b.vehicle?.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand-300">{formatCurrency(b.amount)}</p>
                      <p className="text-xs capitalize text-slate-500">{b.status}</p>
                    </div>
                  </div>
                ))}
                {stats.recent.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No bookings yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
