export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-900/50 animate-pulse">
          <svg viewBox="0 0 64 64" fill="none" className="w-11 h-11">
            <rect x="6" y="6" width="18" height="52" rx="3" fill="rgba(255,255,255,0.9)"/>
            <rect x="26" y="6" width="18" height="52" rx="3" fill="rgba(255,255,255,0.7)"/>
            <rect x="46" y="10" width="12" height="44" rx="2" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl -z-10 scale-150" />
      </div>

      {/* Name */}
      <h1 className="text-3xl font-semibold text-white tracking-wide mb-1">
        Maktabah
      </h1>
      <p className="text-slate-500 text-sm mb-8 font-medium tracking-widest uppercase">
        مكتبة
      </p>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
