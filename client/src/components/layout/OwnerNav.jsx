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
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
              isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`
          }
        >
          <Icon size={14} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
