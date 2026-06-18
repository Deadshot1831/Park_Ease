import { Link } from 'react-router-dom';
import { FaParking, FaHeadset } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="glass mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-sm text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient">
            <FaParking className="text-xs text-white" />
          </span>
          Park<span className="gradient-text">Ease</span>
        </div>
        <p className="text-center">Smart parking, booked in advance — find, compare &amp; reserve.</p>
        <div className="flex items-center gap-4">
          <Link to="/help" className="flex items-center gap-1.5 text-slate-300 transition hover:text-brand-300">
            <FaHeadset className="text-brand-400" /> Help &amp; Support
          </Link>
          <span>© {new Date().getFullYear()} ParkEase</span>
        </div>
      </div>
    </footer>
  );
}
