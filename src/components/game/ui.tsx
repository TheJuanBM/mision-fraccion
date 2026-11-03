/** Componentes visuales pequeños compartidos por las pantallas. */
import { useState } from 'react';

export function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} de ${max} estrellas`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star star--on' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress">
      <div className="progress__label">
        <span>{label}</span>
        <span>{value} de {max}</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Confirmación en dos pasos para evitar borrados accidentales (sin diálogos del navegador). */
export function ResetButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <div className="reset-confirm">
      <p>Se borrará tu avance guardado en este navegador.</p>
      <button type="button" className="btn btn--danger" onClick={onConfirm}>Sí, borrar mi avance</button>
      <button type="button" className="btn btn--ghost" onClick={() => setArmed(false)}>Cancelar</button>
    </div>
  ) : (
    <button type="button" className="btn btn--ghost" onClick={() => setArmed(true)}>Reiniciar progreso</button>
  );
}
