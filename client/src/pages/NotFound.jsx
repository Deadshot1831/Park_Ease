import { Link } from 'react-router-dom';
import { FaParking } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <FaParking className="text-5xl text-brand-400" />
      <h1 className="text-5xl font-bold gradient-text">404</h1>
      <p className="text-slate-400">This spot doesn't exist — it may have been taken.</p>
      <Link to="/" className="btn-primary">
        Back to map
      </Link>
    </div>
  );
}
