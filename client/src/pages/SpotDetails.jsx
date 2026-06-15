import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaMapMarkerAlt, FaStar, FaDirections, FaRegHeart, FaHeart, FaClock,
} from 'react-icons/fa';
import Loader from '../components/common/Loader';
import StarRating from '../components/common/StarRating';
import AvailabilityBadge from '../components/common/AvailabilityBadge';
import CarViewer from '../components/car/CarViewer';
import { getSpot, getReviews, addReview, toggleHelpful } from '../services/spotService';
import { useAvailabilitySocket } from '../hooks/useSocket';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, directionsUrl, AMENITY_LABELS } from '../utils/helpers';

export default function SpotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuthStore();
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ spot }, { reviews }] = await Promise.all([getSpot(id), getReviews(id)]);
      setSpot(spot);
      setReviews(reviews);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useAvailabilitySocket(
    useCallback(({ spotId, availableSpots }) => {
      if (spotId === id) setSpot((s) => (s ? { ...s, availableSpots } : s));
    }, [id]),
    id
  );

  if (loading) return <Loader className="min-h-[60vh]" />;
  if (!spot) return null;

  const isFavorite = user?.favorites?.some((f) => String(f._id || f) === id);
  const [lng, lat] = spot.location.coordinates;
  const images = spot.images?.length ? spot.images : [{ url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800' }];

  const handleFavorite = async () => {
    if (!user) return navigate('/login', { state: { from: `/spots/${id}` } });
    try {
      await toggleFavorite(id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/spots/${id}` } });
    setSubmitting(true);
    try {
      const { review } = await addReview(id, form);
      setReviews((r) => [review, ...r]);
      setForm({ rating: 5, comment: '' });
      toast.success('Review posted!');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (reviewId) => {
    if (!user) return navigate('/login');
    try {
      const { helpfulCount } = await toggleHelpful(reviewId);
      setReviews((r) => r.map((rv) => (rv._id === reviewId ? { ...rv, helpfulCount } : rv)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src={images[activeImg].url} alt={spot.name} className="h-72 w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition ${i === activeImg ? 'border-brand-400' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{spot.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-slate-400">
                <FaMapMarkerAlt className="text-brand-400" />
                {spot.address?.formatted || `${spot.address?.street}, ${spot.address?.city}`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-sm font-medium text-slate-200">
                  <FaStar className="text-amber-400" /> {spot.averageRating || 'New'} · {spot.totalReviews} reviews
                </span>
                <AvailabilityBadge available={spot.availableSpots} total={spot.totalSpots} />
              </div>
            </div>
            <button onClick={handleFavorite} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:bg-white/10" aria-label="Favorite">
              {isFavorite ? <FaHeart className="text-rose-400" /> : <FaRegHeart className="text-slate-300" />}
            </button>
          </div>

          {spot.description && <p className="mt-4 text-slate-300">{spot.description}</p>}

          {/* Amenities */}
          {spot.amenities?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-white">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {spot.amenities.map((a) => (
                  <span key={a} className="badge border border-white/10 bg-white/5 text-slate-300">
                    {AMENITY_LABELS[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hours */}
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <FaClock className="text-brand-400" />
            {spot.operatingHours?.is24x7
              ? 'Open 24×7'
              : `${spot.operatingHours?.open || '--'} – ${spot.operatingHours?.close || '--'}`}
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-white">Reviews ({spot.totalReviews})</h3>

            <form onSubmit={submitReview} className="card mb-6 p-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">Your rating:</span>
                <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size={20} />
              </div>
              <textarea
                className="input"
                rows={3}
                placeholder="Share your experience…"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
              <button type="submit" className="btn-primary mt-3" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post review'}
              </button>
              <p className="mt-2 text-xs text-slate-500">You can only review spots you've booked.</p>
            </form>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{r.user?.name || 'User'}</span>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-300">{r.comment}</p>}
                  <button onClick={() => vote(r._id)} className="mt-2 cursor-pointer text-xs text-slate-500 transition hover:text-brand-300">
                    👍 Helpful ({r.helpfulCount || 0})
                  </button>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet — be the first!</p>}
            </div>
          </div>
        </div>

        {/* Booking sidebar — reference-style glowing detail panel */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-600/25 blur-2xl" />

            {/* 3D car on a glowing turntable */}
            <div className="relative -mx-1 -mt-1 mb-3">
              <CarViewer fallbackImage={images[0]?.url} />
            </div>

            <div className="relative">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold gradient-text">{formatCurrency(spot.pricing?.hourly)}</span>
                <span className="text-sm text-slate-500">per hour</span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-400">
                {spot.pricing?.daily > 0 && <div>Daily: {formatCurrency(spot.pricing.daily)}</div>}
                {spot.pricing?.monthly > 0 && <div>Monthly: {formatCurrency(spot.pricing.monthly)}</div>}
              </div>

              <div className="my-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-sm">
                <span className="text-lg font-bold text-white">{spot.availableSpots}</span>
                <span className="text-slate-400"> of {spot.totalSpots} spots free</span>
              </div>

              <Link
                to={`/booking/${spot._id}`}
                className={`btn-primary w-full ${spot.availableSpots < 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                {spot.availableSpots < 1 ? 'Fully booked' : 'Book Now'}
              </Link>
              <a href={directionsUrl(lat, lng)} target="_blank" rel="noreferrer" className="btn-secondary mt-2 w-full">
                <FaDirections /> Get Directions
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
