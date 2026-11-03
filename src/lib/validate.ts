import type { Activity } from '../data/types';
import {
  compare,
  fraction,
  isEquivalent,
  isExactly,
  isSimplest,
  parseFraction,
  sortedIndexes,
  type Fraction,
} from './fraction';

/** Respuesta del estudiante, en el formato que produce cada componente interactivo. */
export type ActivityAnswer =
  | { type: 'choice'; index: number | null }
  | { type: 'match'; pairs: readonly (number | null)[] }
  | { type: 'order'; order: readonly number[] }
  | { type: 'shade'; shaded: readonly boolean[] }
  | { type: 'numberline'; step: number | null }
  | { type: 'fill'; numerator: string; denominator: string };

export type Verdict = 'correct' | 'incorrect' | 'incomplete';

/** Evalúa una respuesta. "incomplete" significa que faltan datos, no que sea incorrecta. */
export function evaluateAnswer(activity: Activity, answer: ActivityAnswer): Verdict {
  switch (activity.type) {
    case 'choice': {
      if (answer.type !== 'choice' || answer.index === null) return 'incomplete';
      return answer.index === activity.correctIndex ? 'correct' : 'incorrect';
    }
    case 'match': {
      if (answer.type !== 'match') return 'incomplete';
      if (answer.pairs.some((p) => p === null)) return 'incomplete';
      const ok = activity.correctPairs.every((right, i) => answer.pairs[i] === right);
      return ok ? 'correct' : 'incorrect';
    }
    case 'order': {
      if (answer.type !== 'order') return 'incomplete';
      const n = activity.items.length;
      const isPermutation =
        answer.order.length === n && new Set(answer.order).size === n &&
        answer.order.every((i) => Number.isInteger(i) && i >= 0 && i < n);
      if (!isPermutation) return 'incomplete';
      for (let k = 0; k + 1 < n; k++) {
        const a = activity.items[answer.order[k]!]!;
        const b = activity.items[answer.order[k + 1]!]!;
        if (compare(a, b) >= 0) return 'incorrect';
      }
      return 'correct';
    }
    case 'shade': {
      if (answer.type !== 'shade') return 'incomplete';
      if (answer.shaded.length !== activity.parts) return 'incomplete';
      const count = answer.shaded.filter(Boolean).length;
      if (count === 0) return 'incomplete';
      const represented = fraction(count, activity.parts);
      return isEquivalent(represented, activity.target) ? 'correct' : 'incorrect';
    }
    case 'numberline': {
      if (answer.type !== 'numberline' || answer.step === null) return 'incomplete';
      const point = fraction(answer.step, activity.denominator);
      return isEquivalent(point, activity.target) ? 'correct' : 'incorrect';
    }
    case 'fill': {
      if (answer.type !== 'fill') return 'incomplete';
      const typed = parseFraction(`${answer.numerator}/${answer.denominator}`);
      if (!typed) return 'incomplete';
      return fillMatches(typed, activity.expected, activity.mode) ? 'correct' : 'incorrect';
    }
  }
}

/** Reglas de comparación para actividades de llenado. */
export function fillMatches(typed: Fraction, expected: Fraction, mode: 'exact' | 'equivalent' | 'simplest'): boolean {
  if (mode === 'exact') return isExactly(typed, expected);
  if (!isEquivalent(typed, expected)) return false;
  if (mode === 'simplest') return isSimplest(typed);
  return true;
}

/**
 * Respuesta canónica de una actividad. Se usa en las pruebas para comprobar
 * que cada actividad del banco tiene una respuesta correcta válida.
 */
export function solutionOf(activity: Activity): ActivityAnswer {
  switch (activity.type) {
    case 'choice':
      return { type: 'choice', index: activity.correctIndex };
    case 'match':
      return { type: 'match', pairs: [...activity.correctPairs] };
    case 'order':
      return { type: 'order', order: sortedIndexes(activity.items) };
    case 'shade':
      return {
        type: 'shade',
        shaded: Array.from({ length: activity.parts }, (_, i) => i < activity.target.n),
      };
    case 'numberline':
      return {
        type: 'numberline',
        step: activity.target.n * (activity.denominator / activity.target.d),
      };
    case 'fill': {
      const e = activity.expected;
      return { type: 'fill', numerator: String(e.n), denominator: String(e.d) };
    }
  }
}
