import { NavLink } from 'react-router-dom';
import { FaChartLine, FaList, FaPlus, FaInbox } from 'react-icons/fa';

const links = [
  { to: '/owner', label: 'Overview', icon: FaChartLine, end: true },
  { to: '/owner/listings', label: 'My Listings', icon: FaList },
  { to: '/owner/listings/new', label: 'Add Spot', icon: FaPlus },
  { to: '/owner/bookings', label: 'Bookings', icon: FaInbox },
];

export default function OwnerNav() {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-brand-gradient text-white shadow-glow-brand'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Icon size={14} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
