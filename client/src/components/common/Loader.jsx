export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-400 ${className}`}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-brand-500/20 blur-md" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}
