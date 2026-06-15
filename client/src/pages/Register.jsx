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
      <div className="card w-full max-w-md p-8 animate-fade-in">
        <div className="mb-6 text-center">
          <FaParking className="mx-auto text-3xl text-brand-600" />
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Create your account</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    form.role === opt.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600'
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

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
