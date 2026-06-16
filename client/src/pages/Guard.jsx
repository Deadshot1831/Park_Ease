import { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaExclamationTriangle, FaPhone, FaMicrophone, FaPause, FaPlay, FaPlus, FaMinus,
  FaExpand, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight,
  FaVideo, FaRss, FaRegCalendarAlt, FaCheckCircle, FaCar,
  FaClock, FaWallet, FaHeadset, FaShieldAlt,
} from 'react-icons/fa';
import GuardTopBar from '../components/guard/GuardTopBar';
import Waveform from '../components/guard/Waveform';
import MiniChart from '../components/common/MiniChart';
import { useAuthStore } from '../store/authStore';
import { getMyBookings, getPaymentHistory } from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';

const GarageScene = lazy(() => import('../components/guard/GarageScene'));
const CarScene = lazy(() => import('../components/car/CarScene'));

const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=70';
const DEMO_CHART = [
  { label: 'Jul', value: 42 }, { label: 'Aug', value: 60 }, { label: 'Sep', value: 96 },
  { label: 'Oct', value: 54 }, { label: 'Nov', value: 80 }, { label: 'Dec', value: 50 },
];
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const INIT_YAW = Math.atan2(11, 12);
const CAM_INIT = { yaw: INIT_YAW, pitch: 9, zoom: 46 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtTime = (d) => {
  const t = new Date(d);
  return `${String(t.getHours()).padStart(2, '0')}.${String(t.getMinutes()).padStart(2, '0')}`;
};

const STATUS_CHIP = {
  confirmed: { label: 'Confirmed', icon: FaCheckCircle, cls: 'text-emerald-500' },
  active: { label: 'Active now', icon: FaCheckCircle, cls: 'text-sky-500' },
  pending: { label: 'Awaiting payment', icon: FaExclamationTriangle, cls: 'text-amber-500' },
  completed: { label: 'Completed', icon: FaCheckCircle, cls: 'text-slate-500' },
  cancelled: { label: 'Cancelled', icon: FaExclamationTriangle, cls: 'text-rose-500' },
};

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  const h = now.getHours();
  const h12 = h % 12 || 12;
  return `${p(now.getMonth() + 1)}/${p(now.getDate())}/${String(now.getFullYear()).slice(2)} ${p(h12)}.${p(now.getMinutes())}.${p(now.getSeconds())} ${h >= 12 ? 'PM' : 'AM'}`;
}

/* ---------- Left: garage scene + functional overlays ---------- */
function GaragePanel({ control, spot, onRotate, onTilt, onZoom }) {
  const time = useClock();
  const boxRef = useRef(null);

  const toggleFullscreen = () => {
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => toast.error('Fullscreen not allowed'));
  };

  const dpad = [
    { c: 'col-start-2 row-start-1', icon: <FaChevronUp />, on: () => onTilt(1.4) },
    { c: 'col-start-1 row-start-2', icon: <FaChevronLeft />, on: () => onRotate(-0.32) },
    { c: 'col-start-2 row-start-2', icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />, on: () => control && (control.current = { ...CAM_INIT }) },
    { c: 'col-start-3 row-start-2', icon: <FaChevronRight />, on: () => onRotate(0.32) },
    { c: 'col-start-2 row-start-3', icon: <FaChevronDown />, on: () => onTilt(-1.4) },
  ];

  return (
    <div ref={boxRef} className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-950 sm:h-[400px]">
      <Suspense fallback={null}>
        <GarageScene control={control} />
      </Suspense>

      {spot && (
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-xs text-slate-200 backdrop-blur-md">
          <FaCar className="text-brand-400" />
          <span className="font-semibold text-white">{spot.availableSpots ?? '—'}</span>
          <span className="text-slate-400">of {spot.totalSpots ?? '—'} free</span>
        </div>
      )}

      <div className="pointer-events-none absolute left-[42%] top-[26%] flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_0_30px_-4px_rgba(255,45,85,0.8)]">
          <span className="absolute inset-0 rounded-full border-2 border-rose-500/70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 55%)' }} />
          <FaExclamationTriangle className="text-lg text-rose-500" />
        </div>
        <span className="-mt-1 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white" />
      </div>

      {/* D-pad (rotates / tilts the camera) */}
      <div className="absolute bottom-4 left-4 grid grid-cols-3 grid-rows-3 gap-1">
        {dpad.map((b, i) => (
          <button key={i} onClick={b.on} className={`${b.c} flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15`}>
            {b.icon}
          </button>
        ))}
      </div>

      {/* Zoom */}
      <div className="absolute bottom-16 right-4 flex flex-col gap-1.5">
        <button onClick={() => onZoom(9)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15"><FaPlus /></button>
        <button onClick={() => onZoom(-9)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15"><FaMinus /></button>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <div className="rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur-md">
          Today: {time}
        </div>
        <button onClick={toggleFullscreen} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15" aria-label="Fullscreen">
          <FaExpand />
        </button>
      </div>
    </div>
  );
}

/* ---------- Transcript + voice recorder (pause works) ---------- */
function TranscriptPanel({ message }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-40 rounded-full bg-brand-600/20 blur-2xl" />
      <p className="relative text-[15px] leading-relaxed text-slate-200">
        {message}
        <span className="ml-0.5 inline-block w-px animate-pulse bg-slate-200">&nbsp;</span>
      </p>

      <div className="relative mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200">
          <FaMicrophone className="text-sm" />
        </span>
        <span className="shrink-0 text-sm text-slate-400">{paused ? 'Paused' : "You're saying…"}</span>
        <Waveform paused={paused} className="flex-1 justify-center overflow-hidden" />
        <span className="hidden shrink-0 text-xs text-slate-400 sm:block">{paused ? 'Resume' : 'Pause record'}</span>
        <button onClick={() => setPaused((p) => !p)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-rose-500 text-white transition hover:bg-rose-600" aria-label={paused ? 'Resume' : 'Pause'}>
          {paused ? <FaPlay className="text-xs" /> : <FaPause className="text-xs" />}
        </button>
      </div>
    </div>
  );
}

/* ---------- Emergency (drag-to-call works) ---------- */
function EmergencyPanel() {
  const call = () => {
    toast.success('Connecting you to emergency support…');
    setTimeout(() => { try { window.location.href = 'tel:112'; } catch { /* ignore */ } }, 400);
  };
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-6 top-6 h-24 w-24 rounded-full bg-rose-500/20 blur-2xl" />
      <h3 className="text-lg font-semibold text-white">Something wrong?</h3>
      <p className="mt-1 text-sm text-slate-400">Don't think!<br />Call for help!</p>
      <div className="relative my-4 flex justify-end">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-400 shadow-[0_0_24px_-6px_rgba(244,63,94,0.7)]">
          <FaVideo />
        </span>
      </div>
      <button onClick={call} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
          <FaRss className="text-xs" />
        </span>
        Tap for emergency call
      </button>
    </div>
  );
}

/* ---------- Right detail panel ---------- */
function DetailPanel({ vm, bookings, payments, count, idx, onPrev, onNext, onRange }) {
  const [tab, setTab] = useState('Overview');
  const tabs = [{ k: 'Overview' }, { k: 'Payment', badge: vm.pendingPayments || undefined }, { k: 'History' }];
  const Status = STATUS_CHIP[vm.status] || null;
  const dots = Math.min(count || 1, 5);

  return (
    <div className="card relative flex flex-col overflow-hidden p-4">
      <div className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative flex items-center gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition ${tab === t.k ? 'border-white text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.k}
            {t.badge && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gradient px-1.5 text-[11px] font-bold text-white">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <div className="relative mt-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-900 shadow-sm">
              {Status ? <Status.icon className={Status.cls} /> : <FaExclamationTriangle className="text-rose-500" />}
              {Status ? Status.label : 'Got a punch'}
            </span>
          </div>

          <div className="relative -my-1 h-40">
            <Suspense fallback={null}>
              <CarScene color="#dfe3ec" rotateSpeed={0.5} />
            </Suspense>
          </div>

          {/* Carousel — switches the monitored booking */}
          <div className="relative mx-auto mb-3 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">
            <button onClick={onPrev} disabled={count < 2} className="cursor-pointer text-xs hover:text-white disabled:opacity-30"><FaChevronLeft /></button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: dots }).map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx % dots ? 'w-4 bg-brand-400' : 'w-1.5 bg-slate-500'}`} />
              ))}
            </div>
            <button onClick={onNext} disabled={count < 2} className="cursor-pointer text-xs hover:text-white disabled:opacity-30"><FaChevronRight /></button>
          </div>

          <h2 className="relative truncate text-2xl font-bold tracking-tight text-white">{vm.title}</h2>
          <div className="relative mt-3 grid grid-cols-3 gap-2">
            {vm.specs.map(([v, l]) => (
              <div key={l}>
                <p className="truncate font-semibold text-white">{v}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-3.5 shadow-glow-brand">
              <p className="truncate font-semibold text-white">{vm.userName}</p>
              <p className="text-xs text-white/70">Complete monitoring</p>
              <div className="mt-4 flex items-center justify-between">
                <img src={vm.avatar} alt={vm.userName} className="h-9 w-9 rounded-full border-2 border-white/40 object-cover" />
                <button onClick={() => toast('Calling support…', { icon: '📞' })} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30">
                  <FaPhone className="text-xs" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <p className="font-semibold text-white">Reserved until</p>
              <p className="text-xs text-slate-500">Paid parking time</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{vm.reservedUntil}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                  <FaRegCalendarAlt className="text-xs" />
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-5 flex items-center justify-between">
            <h4 className="font-semibold text-white">Rental time</h4>
            <button onClick={onRange} className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white">
              {vm.rangeLabel} <FaChevronDown className="text-[9px]" />
            </button>
          </div>
          <div className="relative mt-2">
            <MiniChart data={vm.chart} highlight={vm.chartPeak} height={130} />
          </div>
        </>
      )}

      {tab === 'Payment' && (
        <div className="relative mt-4 space-y-2">
          {payments.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No payments yet.</p>}
          {payments.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{p.booking?.parkingSpot?.name || 'Parking booking'}</p>
                <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-300">{formatCurrency(p.amount)}</p>
                <p className={`text-xs capitalize ${p.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'History' && (
        <div className="relative mt-4 space-y-2">
          {bookings.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No bookings yet.</p>}
          {bookings.map((b) => (
            <div key={b._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{b.parkingSpot?.name || 'Parking spot'}</p>
                <p className="text-xs text-slate-500">{new Date(b.startTime).toLocaleDateString()} · {b.vehicle?.number}</p>
              </div>
              <span className="text-xs capitalize text-slate-400">{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Alternate top-tab views ---------- */
function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}><Icon className="text-xl" /></div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function CalendarView({ bookings }) {
  const upcoming = bookings
    .filter((b) => new Date(b.startTime) >= new Date(Date.now() - 12 * 3600e3) && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  return (
    <div className="mt-4">
      <h2 className="mb-3 text-lg font-semibold text-white">Upcoming parking</h2>
      <div className="card divide-y divide-white/5">
        {upcoming.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">No upcoming bookings. <Link to="/search" className="text-brand-300 hover:text-brand-200">Find parking →</Link></p>
        )}
        {upcoming.map((b) => (
          <div key={b._id} className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-gradient text-white">
              <span className="text-[10px] uppercase">{new Date(b.startTime).toLocaleString('en', { month: 'short' })}</span>
              <span className="text-lg font-bold leading-none">{new Date(b.startTime).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{b.parkingSpot?.name}</p>
              <p className="text-sm text-slate-400">{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.vehicle?.number}</p>
            </div>
            <span className="text-xs capitalize text-slate-400">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsView({ bookings, payments, chart, chartPeak }) {
  const active = bookings.filter((b) => ['confirmed', 'active'].includes(b.status)).length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const spent = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaCar} label="Total bookings" value={bookings.length} tint="bg-brand-500/15 text-brand-300" />
        <StatCard icon={FaClock} label="Active" value={active} tint="bg-sky-500/15 text-sky-300" />
        <StatCard icon={FaCheckCircle} label="Completed" value={completed} tint="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={FaWallet} label="Total spent" value={formatCurrency(spent)} tint="bg-neon-500/15 text-neon-400" />
      </div>
      <div className="card p-5">
        <h3 className="mb-2 font-semibold text-white">Spend by month</h3>
        <div className="max-w-md"><MiniChart data={chart} highlight={chartPeak} height={150} /></div>
      </div>
    </div>
  );
}

function EmergencyView() {
  const call = () => { toast.success('Connecting you to emergency support…'); setTimeout(() => { try { window.location.href = 'tel:112'; } catch { /* ignore */ } }, 400); };
  const tips = [
    { icon: FaHeadset, t: '24/7 support', d: 'Reach a ParkEase agent any time for booking or access issues.' },
    { icon: FaShieldAlt, t: 'On-site security', d: 'Every monitored lot has CCTV and a guard contact on file.' },
    { icon: FaVideo, t: 'Incident capture', d: 'Impacts and alerts are recorded automatically for your records.' },
  ];
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <div className="card relative overflow-hidden p-6 lg:col-span-1">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/25 blur-3xl" />
        <h2 className="relative text-xl font-semibold text-white">Emergency</h2>
        <p className="relative mt-1 text-sm text-slate-400">Need urgent help at your parking spot?</p>
        <button onClick={call} className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-glow-danger transition hover:bg-rose-600">
          <FaPhone /> Call emergency (112)
        </button>
      </div>
      <div className="grid gap-4 lg:col-span-2 sm:grid-cols-3">
        {tips.map(({ icon: Icon, t, d }) => (
          <div key={t} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300"><Icon /></span>
            <p className="mt-3 font-semibold text-white">{t}</p>
            <p className="mt-1 text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Guard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('Dashboard');
  const [idx, setIdx] = useState(0);
  const [range, setRange] = useState('year'); // 'year' | 'all'
  const control = useRef({ ...CAM_INIT });

  useEffect(() => {
    if (!user) return;
    getMyBookings().then((r) => setBookings(r.bookings || [])).catch(() => {});
    getPaymentHistory().then((r) => setPayments(r.payments || [])).catch(() => {});
  }, [user]);

  // Bookings that can be monitored (confirmed/active first, else all)
  const monitorList = useMemo(() => {
    const live = bookings
      .filter((b) => ['confirmed', 'active'].includes(b.status))
      .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    return live.length ? live : bookings;
  }, [bookings]);

  useEffect(() => setIdx(0), [monitorList.length]);
  const activeBooking = monitorList[idx] || null;

  // Camera control handlers
  const onRotate = (d) => { control.current.yaw += d; };
  const onTilt = (d) => { control.current.pitch = clamp(control.current.pitch + d, 5.5, 15); };
  const onZoom = (d) => { control.current.zoom = clamp(control.current.zoom + d, 26, 82); };

  const vm = useMemo(() => {
    const spot = activeBooking?.parkingSpot;
    const paid = bookings.filter((b) => ['confirmed', 'active', 'completed'].includes(b.status));
    const inRange = range === 'year'
      ? paid.filter((b) => new Date(b.createdAt).getFullYear() === new Date().getFullYear())
      : paid;
    const byMonth = MONTHS.map((label, i) => ({
      label,
      value: inRange.filter((b) => new Date(b.createdAt).getMonth() === (6 + i) % 12).reduce((s, b) => s + (b.amount || 0), 0),
    }));
    const hasReal = byMonth.some((m) => m.value > 0);
    const chart = hasReal ? byMonth : DEMO_CHART;
    const chartPeak = chart.reduce((best, d, i) => (d.value > chart[best].value ? i : best), 0);

    const firstName = user?.name?.split(' ')[0] || 'there';
    const message = activeBooking
      ? `Hi ${firstName}! Your booking at ${spot?.name} is ${activeBooking.status}. Vehicle ${activeBooking.vehicle?.number} is being monitored and your spot is reserved until ${fmtTime(activeBooking.endTime)}. Tap below if you need anything.`
      : `Hey, Sarah! The system picked up an impact on your windshield, but don't worry—it's nothing serious. I checked it myself, and there's not even a scratch. Turns out, a kid was playing around and accidentally`;

    return {
      location: spot?.address?.formatted || '13 Skyline, Chicago, 60611',
      title: spot?.name || 'Voedo Horizon 3000 FX',
      specs: [
        [activeBooking ? `#${activeBooking._id.slice(-5).toUpperCase()}` : 'P-204', 'Booking'],
        [activeBooking?.vehicle?.number || 'VEL-204X', 'Vehicle'],
        [cap(activeBooking?.vehicle?.type) || 'Sedan', 'Type'],
      ],
      userName: user?.name || 'Sarah Connor',
      avatar: user?.avatar || AVATAR_FALLBACK,
      reservedUntil: activeBooking ? fmtTime(activeBooking.endTime) : '14.08',
      status: activeBooking?.status,
      spot,
      chart,
      chartPeak,
      rangeLabel: range === 'year' ? 'This year' : 'All time',
      message,
      pendingPayments: payments.filter((p) => ['created', 'failed'].includes(p.status)).length,
    };
  }, [activeBooking, bookings, payments, user, range]);

  return (
    <div className="min-h-screen p-3 sm:p-4">
      <div className="mx-auto max-w-[1440px] rounded-[28px] border border-white/10 bg-ink-900/70 p-3 shadow-glass backdrop-blur-2xl sm:p-5">
        <GuardTopBar location={vm.location} tab={tab} onTab={setTab} />

        {!user && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-400/20 bg-brand-500/10 px-4 py-2.5 text-sm text-brand-100">
            <span>You're viewing demo data. Log in to monitor your real ParkEase booking.</span>
            <Link to="/login" className="font-semibold text-white underline">Log in →</Link>
          </div>
        )}

        {tab === 'Dashboard' && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-4">
              <GaragePanel control={control} spot={vm.spot} onRotate={onRotate} onTilt={onTilt} onZoom={onZoom} />
              <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
                <TranscriptPanel message={vm.message} />
                <EmergencyPanel />
              </div>
            </div>
            <DetailPanel
              vm={vm}
              bookings={bookings}
              payments={payments}
              count={monitorList.length}
              idx={idx}
              onPrev={() => setIdx((i) => (i - 1 + monitorList.length) % Math.max(1, monitorList.length))}
              onNext={() => setIdx((i) => (i + 1) % Math.max(1, monitorList.length))}
              onRange={() => setRange((r) => (r === 'year' ? 'all' : 'year'))}
            />
          </div>
        )}

        {tab === 'Calendar' && <CalendarView bookings={bookings} />}
        {tab === 'Reports' && <ReportsView bookings={bookings} payments={payments} chart={vm.chart} chartPeak={vm.chartPeak} />}
        {tab === 'Emergency' && <EmergencyView />}
      </div>
    </div>
  );
}
