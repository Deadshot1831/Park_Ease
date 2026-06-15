import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Loader from '../common/Loader';

export default function ProtectedRoute({ children, ownerOnly = false }) {
  const { user, loading, isOwner } = useAuthStore();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (ownerOnly && !isOwner()) return <Navigate to="/" replace />;

  return children;
}
