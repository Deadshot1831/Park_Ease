// Decorative animated audio waveform (violet/fuchsia), pure CSS bars
export default function Waveform({ bars = 36, className = '' }) {
  return (
    <div className={`flex h-6 items-center gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = (i % 12) * 0.08;
        const base = 30 + Math.abs(Math.sin(i * 0.7)) * 70; // varied heights
        return (
          <span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${base}%`,
              background: 'linear-gradient(180deg,#e879f9,#7c3aed)',
              animation: `wave 1.1s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}
