import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaParking, FaUserCircle, FaBars, FaTimes, FaBell, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout, isOwner } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Pill tab: active = solid white pill (reference), inactive = muted
  const pill = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-white text-ink-900 shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="glass mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 shadow-glass sm:px-4">
        <Link to="/" className="flex items-center gap-2 pl-1 text-lg font-bold tracking-tight text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-brand">
            <FaParking className="text-sm text-white" />
          </span>
          Park<span className="gradient-text">Ease</span>
        </Link>

        {/* Center pill tabs */}
        <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 md:flex">
          <NavLink to="/" className={pill} end>
            Find Parking
          </NavLink>
          <NavLink to="/search" className={pill}>
            Search
          </NavLink>
          <NavLink to="/guard" className={pill}>
            Monitor
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={pill}>
              My Bookings
            </NavLink>
          )}
          {isOwner() && (
            <NavLink to="/owner" className={pill}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 lg:flex">
                <FaMapMarkerAlt className="text-brand-400" /> Chicago
              </span>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Notifications">
                <FaBell />
              </button>
              <Link to="/profile" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition hover:bg-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <FaUserCircle className="text-2xl text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-100">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="glass mx-auto mt-2 max-w-7xl p-3 md:hidden">
          <div className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
            <NavLink to="/" className={pill} end>
              Find Parking
            </NavLink>
            <NavLink to="/search" className={pill}>
              Search
            </NavLink>
            {user && (
              <NavLink to="/my-bookings" className={pill}>
                My Bookings
              </NavLink>
            )}
            {isOwner() && (
              <NavLink to="/owner" className={pill}>
                Dashboard
              </NavLink>
            )}
            <div className="mt-2 border-t border-white/10 pt-2">
              {user ? (
                <>
                  <NavLink to="/profile" className={pill}>
                    Profile
                  </NavLink>
                  <button onClick={handleLogout} className="btn-ghost w-full justify-start">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-secondary flex-1">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary flex-1">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
