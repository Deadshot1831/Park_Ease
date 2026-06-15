import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [vehicles, setVehicles] = useState(user.vehicles || []);
  const [newVehicle, setNewVehicle] = useState({ number: '', type: 'car', model: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, vehicles });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addVehicle = () => {
    if (!newVehicle.number) return toast.error('Vehicle number required');
    setVehicles((v) => [...v, newVehicle]);
    setNewVehicle({ number: '', type: 'car', model: '' });
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input cursor-not-allowed opacity-60" value={user.email} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-3 font-semibold text-white">My Vehicles</h2>
        <div className="space-y-2">
          {vehicles.map((v, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <span className="text-sm text-slate-200">
                <span className="font-medium text-white">{v.number}</span>
                <span className="text-slate-500"> · {v.type}{v.model ? ` · ${v.model}` : ''}</span>
              </span>
              <button onClick={() => setVehicles((vs) => vs.filter((_, idx) => idx !== i))} className="cursor-pointer text-rose-400/70 transition hover:text-rose-400">
                <FaTrash size={14} />
              </button>
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles added.</p>}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
          <input className="input" placeholder="Number" value={newVehicle.number} onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })} />
          <select className="input" value={newVehicle.type} onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}>
            {['car', 'bike', 'suv', 'truck', 'other'].map((t) => <option key={t} value={t} className="bg-ink-850">{t}</option>)}
          </select>
          <input className="input" placeholder="Model (optional)" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
          <button onClick={addVehicle} className="btn-secondary"><FaPlus /></button>
        </div>
      </div>

      <button onClick={save} className="btn-primary mt-6" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
