import type { Fraction } from '../../lib/fraction';
import { toText } from '../../lib/fraction';
import type { Visual } from '../../data/types';

/** Ancho de referencia (unidades del viewBox) para todas las representaciones. */
export const VIEW_WIDTH = 320;
const BAR_HEIGHT = 48;
const LINE_PAD = 20;

/** Posición horizontal de la marca k en una recta de `total` tramos. */
export function tickX(k: number, total: number): number {
  return LINE_PAD + (k * (VIEW_WIDTH - 2 * LINE_PAD)) / total;
}

/** Barra rectangular dividida en partes iguales; las coloreadas son el numerador. */
export function FractionBar({ fraction, width = VIEW_WIDTH, caption }: { fraction: Fraction; width?: number; caption?: string }) {
  const segment = width / fraction.d;
  const label = `Barra dividida en ${fraction.d} partes iguales; ${fraction.n} coloreadas: ${toText(fraction)}`;
  return (
    <figure className="fraction-figure">
      <svg
        className="fraction-bar"
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${BAR_HEIGHT}`}
        style={{ width: '100%', maxWidth: width }}
      >
        {Array.from({ length: fraction.d }, (_, i) => (
          <rect
            key={i}
            x={i * segment}
            y={0}
            width={segment}
            height={BAR_HEIGHT}
            className={i < fraction.n ? 'seg seg--on' : 'seg'}
          />
        ))}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Recta numérica estática con marcas en cada tramo y la fracción marcada, si existe. */
export function NumberLine({ max, denominator, marked, caption }: { max: 1 | 2; denominator: number; marked?: Fraction; caption?: string }) {
  const total = max * denominator;
  const y = 40;
  const markedX = marked ? tickX((marked.n * denominator) / marked.d, total) : null;
  return (
    <figure className="fraction-figure">
      <svg
        className="number-line"
        role="img"
        aria-label={`Recta numérica de 0 a ${max} dividida en ${total} tramos iguales${marked ? `, con el punto ${toText(marked)}` : ''}`}
        viewBox={`0 0 ${VIEW_WIDTH} 64`}
        style={{ width: '100%', maxWidth: VIEW_WIDTH }}
      >
        <line x1={LINE_PAD} y1={y} x2={VIEW_WIDTH - LINE_PAD} y2={y} className="nl-line" />
        {Array.from({ length: total + 1 }, (_, k) => (
          <line key={k} x1={tickX(k, total)} y1={y - 8} x2={tickX(k, total)} y2={y + 8} className="nl-tick" />
        ))}
        <text x={tickX(0, total)} y={y + 24} textAnchor="middle" className="nl-label">0</text>
        <text x={tickX(total, total)} y={y + 24} textAnchor="middle" className="nl-label">{max}</text>
        {markedX !== null && (
          <>
            <circle cx={markedX} cy={y} r={7} className="nl-point" />
            <text x={markedX} y={y - 14} textAnchor="middle" className="nl-label">{toText(marked!)}</text>
          </>
        )}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Renderiza cualquier representación visual de una actividad o misión. */
export function VisualBlock({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'bar':
      return <FractionBar fraction={visual.fraction} caption={visual.caption} />;
    case 'bars':
      return (
        <div className="bars-stack">
          {visual.fractions.map((fr, i) => (
            <FractionBar key={`${toText(fr)}-${i}`} fraction={fr} width={VIEW_WIDTH} caption={toText(fr)} />
          ))}
          {visual.caption && <p className="visual-caption">{visual.caption}</p>}
        </div>
      );
    case 'numberline':
      return <NumberLine max={visual.max} denominator={visual.denominator} marked={visual.marked} caption={visual.caption} />;
  }
}
