import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaParking, FaEnvelope } from 'react-icons/fa';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // The API deliberately answers the same way whether or not the address is
      // registered, so the confirmation must not imply the account exists.
      setSent(true);
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
          <h1 className="mt-1 text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-slate-400">
            {sent ? 'Check your inbox' : "We'll email you a link to set a new one"}
          </p>
        </div>

        {sent ? (
          <div className="relative space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/20">
              <FaEnvelope className="text-xl text-brand-300" />
            </span>
            <p className="text-sm text-slate-300">
              If an account exists for <span className="font-semibold text-white">{email}</span>, a reset
              link is on its way. It expires in 30 minutes.
            </p>
            <Link to="/login" className="btn-secondary w-full">Back to log in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="relative space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="relative mt-6 text-center text-sm text-slate-400">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
