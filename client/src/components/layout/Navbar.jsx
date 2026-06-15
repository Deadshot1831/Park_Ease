import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaParking, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout, isOwner } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <FaParking className="text-2xl" />
          ParkEase
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLink} end>
            Find Parking
          </NavLink>
          <NavLink to="/search" className={navLink}>
            Search
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={navLink}>
              My Bookings
            </NavLink>
          )}
          {isOwner() && (
            <NavLink to="/owner" className={navLink}>
              Owner Dashboard
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Logout
              </button>
            </div>
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

        <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
            <NavLink to="/" className={navLink} end>
              Find Parking
            </NavLink>
            <NavLink to="/search" className={navLink}>
              Search
            </NavLink>
            {user && (
              <NavLink to="/my-bookings" className={navLink}>
                My Bookings
              </NavLink>
            )}
            {isOwner() && (
              <NavLink to="/owner" className={navLink}>
                Owner Dashboard
              </NavLink>
            )}
            <div className="mt-2 border-t border-gray-100 pt-2">
              {user ? (
                <>
                  <NavLink to="/profile" className={navLink}>
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
