import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaParking, FaGoogle } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="card relative w-full max-w-md overflow-hidden p-8 animate-fade-in">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow-brand">
            <FaParking className="text-xl text-white" />
          </span>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">Log in to find and book parking</p>
        </div>

        <form onSubmit={submit} className="relative space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="relative my-4 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
        </div>

        <a href={`${API_URL}/auth/google`} className="btn-secondary relative w-full">
          <FaGoogle className="text-rose-400" /> Continue with Google
        </a>

        <p className="relative mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Sign up
          </Link>
        </p>
        <p className="relative mt-2 text-center text-xs text-slate-500">
          Demo: user@parkease.dev / password123
        </p>
      </div>
    </div>
  );
}
