import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaParking } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate(form.role === 'owner' ? '/owner' : '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="card relative w-full max-w-md overflow-hidden p-8 animate-fade-in">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-neon-500/25 blur-3xl" />
        <div className="relative mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow-brand">
            <FaParking className="text-xl text-white" />
          </span>
          <p className="text-lg font-bold tracking-tight text-white">Park<span className="gradient-text">Ease</span></p>
          <h1 className="mt-1 text-2xl font-bold text-white">Create your account</h1>
        </div>

        <form onSubmit={submit} className="relative space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91…" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'user', t: 'Find parking' },
                { v: 'owner', t: 'List my space' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setForm({ ...form, role: opt.v })}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    form.role === opt.v ? 'border-brand-400/50 bg-brand-500/20 text-brand-200' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {opt.t}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Sign Up'}
          </button>
        </form>

        <p className="relative mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
