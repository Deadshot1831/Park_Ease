import { AMENITY_LABELS } from '../../utils/helpers';

const TYPES = ['commercial', 'street', 'private'];

export default function FilterPanel({ filters, onChange, className = '' }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleAmenity = (a) => {
    const list = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    const next = list.includes(a) ? list.filter((x) => x !== a) : [...list, a];
    set('amenities', next.join(','));
  };

  const selected = filters.amenities ? filters.amenities.split(',') : [];

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <label className="label">Max price (₹/hr)</label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.maxPrice || 100}
          onChange={(e) => set('maxPrice', e.target.value === '100' ? '' : e.target.value)}
          className="w-full accent-brand-600"
        />
        <div className="text-sm text-gray-500">{filters.maxPrice ? `Up to ₹${filters.maxPrice}` : 'Any price'}</div>
      </div>

      <div>
        <label className="label">Type</label>
        <select className="input" value={filters.type || ''} onChange={(e) => set('type', e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Minimum rating</label>
        <select className="input" value={filters.minRating || ''} onChange={(e) => set('minRating', e.target.value)}>
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="accent-brand-600"
          checked={filters.availableOnly === 'true'}
          onChange={(e) => set('availableOnly', e.target.checked ? 'true' : '')}
        />
        Available only
      </label>

      <div>
        <label className="label">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AMENITY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleAmenity(key)}
              className={`badge border ${
                selected.includes(key)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
