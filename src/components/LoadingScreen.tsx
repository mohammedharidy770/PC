import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress: number;
  ready: boolean;
}

export default function LoadingScreen({ progress, ready }: LoadingScreenProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setHidden(true), 450);
    return () => window.clearTimeout(t);
  }, [ready]);

  if (hidden) return null;

  return (
    <div
      aria-hidden={ready}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090D] transition-opacity duration-500 ${
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-sm px-6">
        <div className="mb-6 flex items-baseline justify-between">
          <span className="font-display text-lg font-semibold tracking-tight text-[#F5F6F8]">
            PC MASTERPIECE
          </span>
          <span className="font-mono-tech text-sm font-medium text-[#C5A5FF]">
            {Math.min(100, Math.max(0, progress))}%
          </span>
        </div>

        <div className="h-[2px] w-full overflow-hidden bg-white/10">
          <div
            className="h-full bg-[#C5A5FF] transition-all duration-200 ease-out"
            style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
          />
        </div>

        <p className="mt-4 text-xs tracking-wide text-[#929BA8]">
          Preparing 3D hardware geometry and studio reflections
        </p>
      </div>
    </div>
  );
}
