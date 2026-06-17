import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import { getSpot } from '../services/spotService';
import { createBooking, createOrder, verifyPayment } from '../services/bookingService';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/helpers';

// Load Razorpay checkout script on demand
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const toLocalInput = (d) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export default function Booking() {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const now = new Date();
  const [form, setForm] = useState({
    startTime: toLocalInput(new Date(now.getTime() + 30 * 60000)),
    endTime: toLocalInput(new Date(now.getTime() + 150 * 60000)),
    vehicleNumber: user?.vehicles?.[0]?.number || '',
    vehicleType: user?.vehicles?.[0]?.type || 'car',
  });

  useEffect(() => {
    getSpot(spotId)
      .then(({ spot }) => setSpot(spot))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [spotId]);

  if (loading) return <Loader className="min-h-[60vh]" />;
  if (!spot) return null;

  const start = new Date(form.startTime);
  const end = new Date(form.endTime);
  const hours = Math.max(0, (end - start) / 3600000);
  const amount =
    hours >= 24 && spot.pricing.daily > 0
      ? Math.ceil(hours / 24) * spot.pricing.daily
      : Math.ceil(hours) * (spot.pricing.hourly || 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (hours <= 0) return toast.error('End time must be after start time');
    setProcessing(true);
    try {
      // 1. Create the pending booking
      const { booking } = await createBooking({
        parkingSpot: spotId,
        vehicle: { number: form.vehicleNumber, type: form.vehicleType },
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      // 2. Create a payment order
      const { order, keyId } = await createOrder(booking._id);

      // 3a. Mock mode (no Razorpay keys) — verify directly
      if (order.mock || !keyId) {
        const { booking: confirmedBooking } = await verifyPayment({
          razorpayOrderId: order.id,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock',
        });
        setConfirmed(confirmedBooking);
        toast.success('Booking confirmed!');
        return;
      }

      // 3b. Real Razorpay checkout
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load payment gateway');

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ParkEase',
        description: spot.name,
        order_id: order.id,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#7c3aed' },
        modal: {
          // User closed the checkout without paying — keep booking pending for retry
          ondismiss: () => {
            setProcessing(false);
            toast('Payment cancelled — your booking is held under "My Bookings".', { icon: 'ℹ️' });
          },
        },
        handler: async (resp) => {
          try {
            const { booking: confirmedBooking } = await verifyPayment({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            setConfirmed(confirmedBooking);
            toast.success('Booking confirmed!');
          } catch (err) {
            toast.error(err.message);
          } finally {
            setProcessing(false);
          }
        },
      });
      // Surface gateway-reported failures (card declined, etc.)
      rzp.on('payment.failed', (resp) => {
        setProcessing(false);
        toast.error(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
      // Note: processing stays true while the modal is open; it is cleared in
      // ondismiss / handler / payment.failed above.
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  if (confirmed) {
    return (
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <div className="card relative overflow-hidden p-8 text-center animate-fade-in">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <FaCheckCircle className="relative mx-auto text-5xl text-emerald-400" />
          <h1 className="relative mt-4 text-2xl font-bold text-white">Booking Confirmed!</h1>
          <p className="relative mt-1 text-slate-400">{spot.name}</p>
          {confirmed.qrCode && (
            <img src={confirmed.qrCode} alt="Booking QR code" className="relative mx-auto mt-4 h-44 w-44 rounded-xl bg-white p-2" />
          )}
          <p className="relative mt-2 text-sm text-slate-400">Show this QR code at the entrance.</p>
          <div className="relative mt-6 flex gap-2">
            <button onClick={() => navigate('/my-bookings')} className="btn-primary flex-1">
              My Bookings
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary flex-1">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Book {spot.name}</h1>
      <p className="mt-1 text-slate-400">{spot.address?.formatted}</p>

      <form onSubmit={handlePay} className="card mt-6 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Start</label>
            <input type="datetime-local" className="input" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <label className="label">End</label>
            <input type="datetime-local" className="input" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Vehicle number</label>
            <input className="input" required placeholder="KA01AB1234" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
          </div>
          <div>
            <label className="label">Vehicle type</label>
            <select className="input" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
              {['car', 'bike', 'suv', 'truck', 'other'].map((t) => (
                <option key={t} value={t} className="bg-ink-850 capitalize">{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Duration</span>
            <span>{hours.toFixed(1)} hrs</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Rate</span>
            <span>{formatCurrency(spot.pricing?.hourly)}/hr</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
            <span>Total</span>
            <span className="gradient-text">{formatCurrency(amount)}</span>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={processing || hours <= 0}>
          {processing ? 'Processing…' : `Pay ${formatCurrency(amount)} & Confirm`}
        </button>
      </form>
    </div>
  );
}
