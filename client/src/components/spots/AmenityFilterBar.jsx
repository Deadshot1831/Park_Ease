import { FaChargingStation, FaVideo, FaClock, FaWheelchair, FaShieldAlt, FaWarehouse } from 'react-icons/fa';

// The popular amenities, promoted as one-tap headline filters. EV charging is
// visually highlighted (green) to lean into EV drivers.
const QUICK = [
  { key: 'ev_charging', label: 'EV Charging', icon: FaChargingStation, ev: true },
  { key: 'cctv', label: 'CCTV', icon: FaVideo },
  { key: '24x7', label: '24×7', icon: FaClock },
  { key: 'covered', label: 'Covered', icon: FaWarehouse },
  { key: 'security_guard', label: 'Security', icon: FaShieldAlt },
  { key: 'wheelchair', label: 'Accessible', icon: FaWheelchair },
];

export default function AmenityFilterBar({ selected = [], onToggle, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {QUICK.map(({ key, label, icon: Icon, ev }) => {
        const active = selected.includes(key);
        const activeCls = ev
          ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
          : 'border-brand-400/50 bg-brand-500/20 text-brand-200';
        const iconCls = active ? (ev ? 'text-emerald-400' : 'text-brand-300') : 'text-slate-400';
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(key)}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              active ? activeCls : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'
            }`}
          >
            <Icon className={iconCls} /> {label}
          </button>
        );
      })}
    </div>
  );
}
