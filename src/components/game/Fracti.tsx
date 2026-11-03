import { useId } from 'react';

export type FractiMood = 'idle' | 'happy' | 'thinking';

/** Personaje guía original: un cristal con rostro que acompaña al estudiante. */
export default function Fracti({ mood = 'idle', size = 96 }: { mood?: FractiMood; size?: number }) {
  // useId produce ids con ":"; se limpian para usarlos en url(#...)
  const gradientId = `fracti-g-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const mouth =
    mood === 'happy' ? 'M40 52 Q50 63 60 52' : mood === 'thinking' ? 'M42 56 Q50 52 58 56' : 'M42 54 H58';
  return (
    <svg
      className={`fracti fracti--${mood}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Fracti, el guía del Universo Fracción"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ec4b6" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
      </defs>
      <polygon points="50,6 86,38 50,94 14,38" fill={`url(#${gradientId})`} stroke="#f4c542" strokeWidth={3} />
      <path d="M14 38 H86 M50 6 L36 38 L50 94 L64 38 Z" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.5} />
      <circle cx={41} cy={40} r={4} fill="#0b1d3a" className="fracti__eye" />
      <circle cx={59} cy={40} r={4} fill="#0b1d3a" className="fracti__eye" />
      <path d={mouth} stroke="#0b1d3a" strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
}
