import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OwnerNav from '../../components/layout/OwnerNav';
import { createSpot, uploadImages } from '../../services/spotService';
import { AMENITY_LABELS } from '../../utils/helpers';

const STEPS = ['Basics', 'Location', 'Pricing & Amenities', 'Photos'];

export default function AddSpot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'commercial',
    parkingType: 'open',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '',
    lat: '12.9759',
    lng: '77.6045',
    totalSpots: 10,
    hourly: 40,
    daily: 300,
    monthly: 5000,
    amenities: [],
    is24x7: false,
    open: '08:00',
    close: '22:00',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const { images: uploaded } = await uploadImages(files);
      setImages((prev) => [...prev, ...uploaded]);
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await createSpot({
        name: form.name,
        description: form.description,
        type: form.type,
        parkingType: form.parkingType,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          formatted: `${form.street}, ${form.city}, ${form.state}`,
        },
        location: { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)] },
        totalSpots: Number(form.totalSpots),
        availableSpots: Number(form.totalSpots),
        pricing: { hourly: Number(form.hourly), daily: Number(form.daily), monthly: Number(form.monthly) },
        amenities: form.amenities,
        operatingHours: { is24x7: form.is24x7, open: form.open, close: form.close },
        images,
      });
      toast.success('Parking spot created!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.name.trim();
    if (step === 1) return form.street && form.lat && form.lng;
    return true;
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Add a Parking Spot</h1>
      <OwnerNav />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className={`hidden text-xs sm:block ${i === step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="card space-y-4 p-6">
        {step === 0 && (
          <>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Indiranagar Smart Park" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Listing type</label>
                <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {['commercial', 'street', 'private'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Parking type</label>
                <select className="input" value={form.parkingType} onChange={(e) => set('parkingType', e.target.value)}>
                  {['covered', 'open', 'underground', 'multilevel'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label">Street address</label>
              <input className="input" value={form.street} onChange={(e) => set('street', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
              <div><label className="label">State</label><input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">PIN</label><input className="input" value={form.zip} onChange={(e) => set('zip', e.target.value)} /></div>
              <div><label className="label">Latitude</label><input className="input" value={form.lat} onChange={(e) => set('lat', e.target.value)} /></div>
              <div><label className="label">Longitude</label><input className="input" value={form.lng} onChange={(e) => set('lng', e.target.value)} /></div>
            </div>
            <p className="text-xs text-gray-400">Tip: right-click a location in Google Maps to copy its lat,lng.</p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Total spots</label><input type="number" className="input" value={form.totalSpots} onChange={(e) => set('totalSpots', e.target.value)} /></div>
              <div><label className="label">Hourly (₹)</label><input type="number" className="input" value={form.hourly} onChange={(e) => set('hourly', e.target.value)} /></div>
              <div><label className="label">Daily (₹)</label><input type="number" className="input" value={form.daily} onChange={(e) => set('daily', e.target.value)} /></div>
              <div><label className="label">Monthly (₹)</label><input type="number" className="input" value={form.monthly} onChange={(e) => set('monthly', e.target.value)} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-brand-600" checked={form.is24x7} onChange={(e) => set('is24x7', e.target.checked)} /> Open 24×7
            </label>
            {!form.is24x7 && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Opens</label><input type="time" className="input" value={form.open} onChange={(e) => set('open', e.target.value)} /></div>
                <div><label className="label">Closes</label><input type="time" className="input" value={form.close} onChange={(e) => set('close', e.target.value)} /></div>
              </div>
            )}
            <div>
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => toggleAmenity(key)} className={`badge border ${form.amenities.includes(key) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label className="label">Photos</label>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <img key={i} src={img.url} alt="" className="h-20 w-24 rounded-lg object-cover" />
              ))}
            </div>
            {images.length === 0 && <p className="text-xs text-gray-400">Photos are optional but boost bookings.</p>}
          </>
        )}

        <div className="flex justify-between pt-2">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="btn-secondary" disabled={step === 0}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary" disabled={!canNext()}>
              Next
            </button>
          ) : (
            <button onClick={submit} className="btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
