import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaParking } from 'react-icons/fa';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');

    setLoading(true);
    try {
      // Resetting signs every other device out, so the API hands back a fresh
      // token for this one — adopt it or the user is logged out immediately.
      const { token: session, user } = await api
        .post(`/auth/reset-password/${token}`, { password: form.password })
        .then((r) => r.data);
      setSession(session, user);
      toast.success('Password updated — other devices have been signed out');
      navigate('/', { replace: true });
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
          <p className="text-lg font-bold tracking-tight text-white">Park<span className="gradient-text">Ease</span></p>
          <h1 className="mt-1 text-2xl font-bold text-white">Choose a new password</h1>
          <p className="text-sm text-slate-400">At least 8 characters</p>
        </div>

        <form onSubmit={submit} className="relative space-y-4">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              className="input"
              required
              minLength={8}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="relative mt-6 text-center text-sm text-slate-400">
          Link expired?{' '}
          <Link to="/forgot-password" className="font-semibold text-brand-300 hover:text-brand-200">
            Request a new one
          </Link>
        </p>
      </div>
    </div>
  );
}
