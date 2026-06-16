import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBell, FaCog } from 'react-icons/fa';

const TABS = ['Dashboard', 'Calendar', 'Reports', 'Emergency'];

export default function GuardTopBar({ location = '13 Skyline, Chicago, 60611' }) {
  const [active, setActive] = useState('Dashboard');
  return (
    <header className="flex items-center justify-between gap-4">
      <Link to="/" className="text-xl font-bold tracking-tight text-white">
        Park<span className="text-slate-400">.Guard</span>
      </Link>

      <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl md:flex">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`cursor-pointer rounded-xl px-5 py-2 text-sm font-semibold transition ${
              active === t ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden max-w-[260px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 sm:flex">
          <FaMapMarkerAlt className="shrink-0 text-brand-400" /> <span className="truncate">{location}</span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Notifications">
          <FaBell />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Settings">
          <FaCog />
        </button>
      </div>
    </header>
  );
}
