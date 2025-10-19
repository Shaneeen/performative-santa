export default function Logo({ size = 28 }: { size?: number }) {
    return (
      <div className="flex items-center gap-2">
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" className="fill-matcha-400" />
          <path d="M8.5 13.2c1.6 1.6 1.4 3.2 3.5 3.2s1.9-1.6 3.5-3.2c1.6-1.6.6-4.2-1.6-4.2-1.1 0-1.6.6-1.9 1-.3-.4-.8-1-1.9-1-2.2 0-3.2 2.6-1.7 4.2Z"
                className="fill-white opacity-90" />
        </svg>
        <span className="text-xl font-bold text-matcha-400 tracking-tight">Performative Santa</span>
      </div>
    );
  }
  