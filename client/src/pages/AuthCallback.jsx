import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';

// Handles the redirect from Google OAuth: ?token=...
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('parkease_token', token);
      loadUser().then(() => navigate('/', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, loadUser]);

  return <Loader label="Signing you in…" className="min-h-screen" />;
}
