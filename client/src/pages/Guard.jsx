import { Suspense, lazy, useState, useEffect } from 'react';
import {
  FaExclamationTriangle, FaPhone, FaMicrophone, FaPause, FaPlus, FaMinus,
  FaExpand, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight,
  FaVideo, FaRss, FaRegCalendarAlt,
} from 'react-icons/fa';
import GuardTopBar from '../components/guard/GuardTopBar';
import Waveform from '../components/guard/Waveform';
import MiniChart from '../components/common/MiniChart';

const GarageScene = lazy(() => import('../components/guard/GarageScene'));
const CarScene = lazy(() => import('../components/car/CarScene'));

const CHART = [
  { label: 'Jul', value: 42 },
  { label: 'Aug', value: 60 },
  { label: 'Sep', value: 96 },
  { label: 'Oct', value: 54 },
  { label: 'Nov', value: 80 },
  { label: 'Dec', value: 50 },
];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  const h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${p(now.getMonth() + 1)}/${p(now.getDate())}/${String(now.getFullYear()).slice(2)} ${p(h12)}.${p(now.getMinutes())}.${p(now.getSeconds())} ${ampm}`;
}

/* ---------- Left: garage scene + overlays ---------- */
function GaragePanel() {
  const time = useClock();
  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-950 sm:h-[400px]">
      <Suspense fallback={null}>
        <GarageScene />
      </Suspense>

      {/* Alert marker over the monitored car */}
      <div className="pointer-events-none absolute left-[42%] top-[26%] flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_0_30px_-4px_rgba(255,45,85,0.8)]">
          <span className="absolute inset-0 rounded-full border-2 border-rose-500/70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 55%)' }} />
          <FaExclamationTriangle className="text-lg text-rose-500" />
        </div>
        <span className="-mt-1 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white" />
      </div>

      {/* D-pad */}
      <div className="absolute bottom-4 left-4 grid grid-cols-3 grid-rows-3 gap-1">
        {[
          { c: 'col-start-2 row-start-1', icon: <FaChevronUp /> },
          { c: 'col-start-1 row-start-2', icon: <FaChevronLeft /> },
          { c: 'col-start-2 row-start-2', icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> },
          { c: 'col-start-3 row-start-2', icon: <FaChevronRight /> },
          { c: 'col-start-2 row-start-3', icon: <FaChevronDown /> },
        ].map((b, i) => (
          <button key={i} className={`${b.c} flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15`}>
            {b.icon}
          </button>
        ))}
      </div>

      {/* Zoom + fullscreen */}
      <div className="absolute bottom-16 right-4 flex flex-col gap-1.5">
        {[<FaPlus key="p" />, <FaMinus key="m" />].map((ic, i) => (
          <button key={i} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15">
            {ic}
          </button>
        ))}
      </div>

      {/* Timestamp + fullscreen */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <div className="rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur-md">
          Today: {time}
        </div>
        <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/15">
          <FaExpand />
        </button>
      </div>
    </div>
  );
}

/* ---------- Transcript + voice recorder ---------- */
function TranscriptPanel() {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-40 rounded-full bg-brand-600/20 blur-2xl" />
      <p className="relative text-[15px] leading-relaxed text-slate-200">
        Hey, Sarah! The system picked up an impact on your windshield, but don't
        worry—it's nothing serious. I checked it myself, and there's not even a scratch.
        Turns out, a kid was playing around and accidentally
        <span className="ml-0.5 inline-block w-px animate-pulse bg-slate-200">&nbsp;</span>
      </p>

      <div className="relative mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200">
          <FaMicrophone className="text-sm" />
        </span>
        <span className="shrink-0 text-sm text-slate-400">You're saying…</span>
        <Waveform className="flex-1 justify-center overflow-hidden" />
        <span className="hidden shrink-0 text-xs text-slate-400 sm:block">Pause record</span>
        <button className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-rose-500 text-white transition hover:bg-rose-600" aria-label="Pause recording">
          <FaPause className="text-xs" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Emergency ---------- */
function EmergencyPanel() {
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

      <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
          <FaRss className="text-xs" />
        </span>
        Drag to emergency call
      </button>
    </div>
  );
}

/* ---------- Right detail panel ---------- */
function DetailPanel() {
  const [tab, setTab] = useState('Overview');
  const tabs = [
    { k: 'Overview' },
    { k: 'Payment', badge: 2 },
    { k: 'History' },
  ];
  return (
    <div className="card relative flex flex-col overflow-hidden p-4">
      <div className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-brand-600/20 blur-3xl" />

      {/* Tabs */}
      <div className="relative flex items-center gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition ${
              tab === t.k ? 'border-white text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.k}
            {t.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gradient px-1.5 text-[11px] font-bold text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Got a punch chip */}
      <div className="relative mt-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-900 shadow-sm">
          <FaExclamationTriangle className="text-rose-500" /> Got a punch
        </span>
      </div>

      {/* 3D car turntable */}
      <div className="relative -my-1 h-40">
        <Suspense fallback={null}>
          <CarScene color="#dfe3ec" rotateSpeed={0.5} />
        </Suspense>
      </div>

      {/* Carousel control */}
      <div className="relative mx-auto mb-3 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">
        <button className="cursor-pointer text-xs hover:text-white"><FaChevronLeft /></button>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <button className="cursor-pointer text-xs hover:text-white"><FaChevronRight /></button>
      </div>

      {/* Title + specs */}
      <h2 className="relative text-2xl font-bold tracking-tight text-white">Voedo Horizon 3000 FX</h2>
      <div className="relative mt-3 grid grid-cols-3 gap-2">
        {[
          ['P-204', 'Seat'],
          ['VEL-204X', 'Number'],
          ['Sedan', 'Body'],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="font-semibold text-white">{v}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      {/* Two info cards */}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-3.5 shadow-glow-brand">
          <p className="font-semibold text-white">Sarah Connor</p>
          <p className="text-xs text-white/70">Complete monitoring</p>
          <div className="mt-4 flex items-center justify-between">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=70"
              alt="Sarah Connor"
              className="h-9 w-9 rounded-full border-2 border-white/40 object-cover"
            />
            <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30">
              <FaPhone className="text-xs" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <p className="font-semibold text-white">Reserved until</p>
          <p className="text-xs text-slate-500">Paid parking time</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-white">14.08</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300">
              <FaRegCalendarAlt className="text-xs" />
            </span>
          </div>
        </div>
      </div>

      {/* Rental time chart */}
      <div className="relative mt-5 flex items-center justify-between">
        <h4 className="font-semibold text-white">Rental time</h4>
        <button className="flex cursor-pointer items-center gap-1 text-xs text-slate-400">
          This year <FaChevronDown className="text-[9px]" />
        </button>
      </div>
      <div className="relative mt-2">
        <MiniChart data={CHART} highlight={2} height={130} />
      </div>
    </div>
  );
}

export default function Guard() {
  return (
    <div className="min-h-screen p-3 sm:p-4">
      <div className="mx-auto max-w-[1440px] rounded-[28px] border border-white/10 bg-ink-900/70 p-3 shadow-glass backdrop-blur-2xl sm:p-5">
        <GuardTopBar />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-4">
            <GaragePanel />
            <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
              <TranscriptPanel />
              <EmergencyPanel />
            </div>
          </div>
          <DetailPanel />
        </div>
      </div>
    </div>
  );
}
