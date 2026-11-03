import { useState } from 'react';
import type {
  ChoiceActivity,
  FillActivity,
  MatchActivity,
  NumberLineActivity,
  OrderActivity,
  ShadeActivity,
} from '../../data/types';
import { toText } from '../../lib/fraction';
import type { ActivityAnswer } from '../../lib/validate';
import { FractionBar, VIEW_WIDTH, tickX } from './FractionVisual';

/**
 * Componentes de entrada. Cada uno entrega una respuesta con el formato de
 * ActivityAnswer; la validación ocurre en src/lib/validate.ts.
 * Todas las interacciones usan botones y campos de texto, por lo que funcionan
 * con teclado, ratón y pantalla táctil sin arrastrar elementos.
 */

interface InputProps<A> {
  activity: A;
  locked: boolean;
  onSubmit: (answer: ActivityAnswer) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ChoiceInput({ activity, locked, onSubmit }: InputProps<ChoiceActivity>) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="input-block">
      <div className="options" role="group" aria-label="Opciones de respuesta">
        {activity.options.map((option, i) => (
          <button
            key={option}
            type="button"
            className="option"
            aria-pressed={selected === i}
            disabled={locked}
            onClick={() => setSelected(i)}
          >
            <span className="option__letter" aria-hidden="true">{LETTERS[i]}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn--primary"
        disabled={locked || selected === null}
        onClick={() => onSubmit({ type: 'choice', index: selected })}
      >
        Comprobar
      </button>
    </div>
  );
}

export function MatchInput({ activity, locked, onSubmit }: InputProps<MatchActivity>) {
  const [pairs, setPairs] = useState<(number | null)[]>(() => activity.left.map(() => null));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const pairWith = (leftIndex: number, rightIndex: number) => {
    // Cada elemento de la derecha solo puede estar emparejado una vez.
    setPairs((prev) => prev.map((v, j) => (v === rightIndex ? null : j === leftIndex ? rightIndex : v)));
    setSelectedLeft(null);
  };

  const handleLeft = (i: number) => {
    if (locked) return;
    if (pairs[i] !== null) {
      setPairs((prev) => prev.map((v, j) => (j === i ? null : v)));
      setSelectedLeft(i);
      return;
    }
    setSelectedLeft(selectedLeft === i ? null : i);
  };

  const complete = pairs.every((p) => p !== null);

  return (
    <div className="input-block">
      <div className="match">
        <ul className="match__column" aria-label="Figuras">
          {activity.left.map((item, i) => {
            const partner = pairs[i];
            return (
              <li key={item.label}>
                <button
                  type="button"
                  className="match__item"
                  aria-pressed={selectedLeft === i}
                  disabled={locked}
                  onClick={() => handleLeft(i)}
                >
                  {item.fraction && <FractionBar fraction={item.fraction} width={200} />}
                  <span className="match__meta">
                    {item.label}
                    {partner !== null && partner !== undefined && ` → ${activity.right[partner]}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="match__column" aria-label="Nombres en palabras">
          {activity.right.map((text, r) => {
            const usedBy = pairs.findIndex((p) => p === r);
            return (
              <li key={text}>
                <button
                  type="button"
                  className="option option--compact"
                  aria-pressed={usedBy !== -1}
                  disabled={locked || selectedLeft === null}
                  onClick={() => selectedLeft !== null && pairWith(selectedLeft, r)}
                >
                  {text}
                  {usedBy !== -1 && <span className="sr-note"> (emparejado con {activity.left[usedBy]?.label})</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="hint-line" aria-live="polite">
        {selectedLeft !== null
          ? `Elegiste ${activity.left[selectedLeft]?.label}. Ahora toca su nombre.`
          : 'Toca una figura y luego su nombre.'}
      </p>
      <button
        type="button"
        className="btn btn--primary"
        disabled={locked || !complete}
        onClick={() => onSubmit({ type: 'match', pairs })}
      >
        Comprobar parejas
      </button>
    </div>
  );
}

export function OrderInput({ activity, locked, onSubmit }: InputProps<OrderActivity>) {
  const [order, setOrder] = useState<number[]>(() => activity.items.map((_, i) => i));

  const move = (position: number, delta: -1 | 1) => {
    const target = position + delta;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      const moved = next[position]!;
      next[position] = next[target]!;
      next[target] = moved;
      return next;
    });
  };

  return (
    <div className="input-block">
      <ol className="order-list" aria-label="Fracciones por ordenar">
        {order.map((itemIndex, position) => {
          const item = activity.items[itemIndex]!;
          return (
            <li key={itemIndex} className="order-list__item">
              <span className="order-list__pos" aria-hidden="true">{position + 1}</span>
              <span className="order-list__value">
                <FractionBar fraction={item} width={180} />
                <strong>{toText(item)}</strong>
              </span>
              <span className="order-list__moves">
                <button
                  type="button"
                  className="btn btn--icon"
                  aria-label={`Subir ${toText(item)}`}
                  disabled={locked || position === 0}
                  onClick={() => move(position, -1)}
                >▲</button>
                <button
                  type="button"
                  className="btn btn--icon"
                  aria-label={`Bajar ${toText(item)}`}
                  disabled={locked || position === order.length - 1}
                  onClick={() => move(position, 1)}
                >▼</button>
              </span>
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn--primary" disabled={locked} onClick={() => onSubmit({ type: 'order', order })}>
        Comprobar orden
      </button>
    </div>
  );
}

export function ShadeInput({ activity, locked, onSubmit }: InputProps<ShadeActivity>) {
  const [shaded, setShaded] = useState<boolean[]>(() => Array.from({ length: activity.parts }, () => false));
  const count = shaded.filter(Boolean).length;
  return (
    <div className="input-block">
      <div className="shade" role="group" aria-label={`Barra de ${activity.parts} partes iguales`}>
        {shaded.map((on, i) => (
          <button
            key={i}
            type="button"
            className={`shade__part${on ? ' is-on' : ''}`}
            aria-pressed={on}
            aria-label={`Parte ${i + 1} de ${activity.parts}`}
            disabled={locked}
            onClick={() => setShaded((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          />
        ))}
      </div>
      <p className="hint-line">Partes coloreadas: {count} de {activity.parts}</p>
      <button type="button" className="btn btn--primary" disabled={locked || count === 0} onClick={() => onSubmit({ type: 'shade', shaded })}>
        Comprobar
      </button>
    </div>
  );
}

export function NumberLineInput({ activity, locked, onSubmit }: InputProps<NumberLineActivity>) {
  const total = activity.max * activity.denominator;
  const [step, setStep] = useState<number | null>(null);
  return (
    <div className="input-block">
      <div className="numberline-picker">
        <svg viewBox={`0 0 ${VIEW_WIDTH} 64`} className="number-line" aria-hidden="true" focusable="false" style={{ width: '100%' }}>
          <line x1={tickX(0, total)} y1={40} x2={tickX(total, total)} y2={40} className="nl-line" />
          {Array.from({ length: total + 1 }, (_, k) => (
            <line key={k} x1={tickX(k, total)} y1={32} x2={tickX(k, total)} y2={48} className="nl-tick" />
          ))}
          <text x={tickX(0, total)} y={64} textAnchor="middle" className="nl-label">0</text>
          <text x={tickX(total, total)} y={64} textAnchor="middle" className="nl-label">{activity.max}</text>
        </svg>
        <div className="numberline-picker__points" role="group" aria-label={`Puntos de la recta: ${total} tramos iguales`}>
          {Array.from({ length: total + 1 }, (_, k) => (
            <button
              key={k}
              type="button"
              className={`nl-point-button${step === k ? ' is-on' : ''}`}
              style={{ left: `${(tickX(k, total) / VIEW_WIDTH) * 100}%` }}
              aria-pressed={step === k}
              aria-label={`Punto ${k} de ${total}`}
              disabled={locked}
              onClick={() => setStep(k)}
            />
          ))}
        </div>
      </div>
      <p className="hint-line">{step === null ? 'Toca un punto de la recta.' : `Punto elegido: ${step} de ${total} tramos.`}</p>
      <button type="button" className="btn btn--primary" disabled={locked || step === null} onClick={() => onSubmit({ type: 'numberline', step })}>
        Comprobar
      </button>
    </div>
  );
}

export function FillInput({ locked, onSubmit }: InputProps<FillActivity>) {
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  // Solo dígitos: el valor se muestra como texto en React, nunca como HTML.
  const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 3);
  return (
    <div className="input-block">
      <div className="fill">
        <label className="fill__field">
          <span>Numerador</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={numerator}
            disabled={locked}
            onChange={(e) => setNumerator(digitsOnly(e.target.value))}
          />
        </label>
        <span className="fill__slash" aria-hidden="true">/</span>
        <label className="fill__field">
          <span>Denominador</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={denominator}
            disabled={locked}
            onChange={(e) => setDenominator(digitsOnly(e.target.value))}
          />
        </label>
      </div>
      <button
        type="button"
        className="btn btn--primary"
        disabled={locked || numerator === '' || denominator === ''}
        onClick={() => onSubmit({ type: 'fill', numerator, denominator })}
      >
        Comprobar
      </button>
    </div>
  );
}
