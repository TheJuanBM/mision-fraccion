import { describe, expect, it } from 'vitest';
import { ACTIVITIES } from '../src/data/activities';
import { MISSIONS } from '../src/data/missions';
import type { Activity } from '../src/data/types';
import {
  add,
  allDistinct,
  fraction as f,
  isEquivalent,
  isSimplest,
  subtract,
  withDenominator,
} from '../src/lib/fraction';
import { evaluateAnswer, solutionOf } from '../src/lib/validate';

/** Cada actividad debe tener los campos pedagógicos obligatorios. */
function assertComplete(a: Activity): void {
  expect(a.id).toMatch(/^M[1-4]-A[1-5]$/);
  expect(a.title.length).toBeGreaterThan(0);
  expect(a.objective.length).toBeGreaterThan(0);
  expect(a.prompt.length).toBeGreaterThan(0);
  expect(a.explanation.length).toBeGreaterThan(0);
  expect(a.hint.length).toBeGreaterThan(0);
}

describe('banco de actividades: estructura', () => {
  it('contiene 20 actividades, cinco por misión', () => {
    expect(ACTIVITIES).toHaveLength(20);
    for (const mission of [1, 2, 3, 4] as const) {
      expect(ACTIVITIES.filter((a) => a.mission === mission)).toHaveLength(5);
    }
  });

  it('no repite identificadores', () => {
    const ids = ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tiene cuatro misiones con recompensa y narrativa', () => {
    expect(MISSIONS.map((m) => m.id)).toEqual([1, 2, 3, 4]);
    for (const m of MISSIONS) {
      expect(m.badge.length).toBeGreaterThan(0);
      expect(m.introParagraphs.length).toBeGreaterThan(0);
    }
  });

  it.each(ACTIVITIES.map((a) => [a.id, a] as const))('%s tiene campos completos', (_id, activity) => {
    assertComplete(activity);
  });
});

describe('banco de actividades: respuestas correctas', () => {
  it.each(ACTIVITIES.map((a) => [a.id, a] as const))('%s: la respuesta canónica es correcta', (_id, activity) => {
    expect(evaluateAnswer(activity, solutionOf(activity))).toBe('correct');
  });

  it('las opciones de selección múltiple tienen una respuesta válida y única', () => {
    for (const a of ACTIVITIES) {
      if (a.type !== 'choice') continue;
      expect(a.correctIndex).toBeGreaterThanOrEqual(0);
      expect(a.correctIndex).toBeLessThan(a.options.length);
      expect(new Set(a.options).size).toBe(a.options.length);
    }
  });

  it('las parejas de emparejamiento son biyectivas', () => {
    for (const a of ACTIVITIES) {
      if (a.type !== 'match') continue;
      expect(a.correctPairs).toHaveLength(a.left.length);
      expect(new Set(a.correctPairs).size).toBe(a.left.length);
      expect(a.right).toHaveLength(a.left.length);
    }
  });

  it('las actividades de ordenar tienen valores distintos', () => {
    for (const a of ACTIVITIES) {
      if (a.type === 'order') expect(allDistinct(a.items)).toBe(true);
    }
  });
});

describe('banco de actividades: matemática verificada', () => {
  const byId = (id: string) => ACTIVITIES.find((a) => a.id === id)!;

  it('M1-A3 y M1-A5 apuntan a 3/4 y 1/4', () => {
    expect(byId('M1-A3')).toMatchObject({ type: 'shade', parts: 4, target: { n: 3, d: 4 } });
    expect(byId('M1-A5')).toMatchObject({ type: 'numberline', denominator: 4, target: { n: 1, d: 4 } });
  });

  it('M1-A4: cada figura corresponde a su nombre verbal correcto', () => {
    const a = byId('M1-A4');
    if (a.type !== 'match') throw new Error('tipo inesperado');
    a.left.forEach((item, i) => {
      expect(item.fraction).toBeDefined();
      const right = a.right[a.correctPairs[i]!]!;
      const expected = { 'cuatro sextos': f(4, 6), 'un medio': f(1, 2), 'dos quintos': f(2, 5), 'tres cuartos': f(3, 4) }[right];
      expect(expected && isEquivalent(item.fraction!, expected)).toBe(true);
    });
  });

  it('M2-A1: los pares de equivalencia son realmente equivalentes', () => {
    const a = byId('M2-A1');
    if (a.type !== 'match') throw new Error('tipo inesperado');
    const rightValues = [f(6, 8), f(2, 6), f(4, 6), f(2, 4)];
    a.left.forEach((item, i) => {
      expect(isEquivalent(item.fraction!, rightValues[a.correctPairs[i]!]!)).toBe(true);
    });
  });

  it('M2-A2: 1/2 = 3/6', () => {
    const a = byId('M2-A2');
    expect(a.type === 'fill' && isEquivalent(f(1, 2), a.expected)).toBe(true);
    expect(withDenominator(f(1, 2), 6)).toEqual(f(3, 6));
  });

  it('M2-A3: 3/4 es mayor que 3/5', () => {
    expect(isEquivalent(f(3, 4), f(3, 5))).toBe(false);
    expect(byId('M2-A3')).toMatchObject({ type: 'choice', correctIndex: 1 });
  });

  it('M2-A5: la opción correcta es equivalente a 2/3 y mayor que 1/2', () => {
    const a = byId('M2-A5');
    if (a.type !== 'choice') throw new Error('tipo inesperado');
    const parse = (s: string) => {
      const [n, d] = s.split('/').map(Number);
      return f(n!, d!);
    };
    const options = a.options.map(parse);
    const correct = options[a.correctIndex]!;
    expect(isEquivalent(correct, f(2, 3))).toBe(true);
    expect(correct.n * 2 > correct.d).toBe(true);
    options.forEach((opt, i) => {
      if (i === a.correctIndex) return;
      const ok = isEquivalent(opt, f(2, 3)) && opt.n * 2 > opt.d;
      expect(ok).toBe(false);
    });
  });

  it('M3-A1..A4 y M4-A2..A5: el resultado esperado coincide con la suma o resta exacta', () => {
    expect(add(f(2, 7), f(3, 7))).toEqual(f(5, 7));
    expect(subtract(f(5, 6), f(2, 6))).toEqual(f(1, 2));
    expect(add(f(1, 2), f(1, 4))).toEqual(f(3, 4));
    expect(subtract(f(2, 3), f(1, 6))).toEqual(f(1, 2));
    expect(add(f(2, 5), f(1, 5))).toEqual(f(3, 5));
    expect(subtract(f(12, 12), add(f(5, 12), f(4, 12)))).toEqual(f(1, 4));
    expect(add(add(f(1, 3), f(2, 6)), f(1, 6))).toEqual(f(5, 6));
  });

  it('M3-A5 y M4-A1: 1/3 + 1/4 = 7/12 y 3/4 + 1/4 = 1', () => {
    expect(add(f(1, 3), f(1, 4))).toEqual(f(7, 12));
    expect(add(f(3, 4), f(1, 4))).toEqual(f(1, 1));
  });

  it('las respuestas esperadas de "forma más simple" son irreducibles', () => {
    for (const a of ACTIVITIES) {
      if (a.type === 'fill' && a.mode === 'simplest') {
        expect(isSimplest(a.expected)).toBe(true);
      }
    }
  });

  it('una respuesta incorrecta no se marca como correcta (muestra de control)', () => {
    const a = byId('M1-A3');
    const wrong = Array.from({ length: 4 }, (_, i) => i < 2);
    expect(evaluateAnswer(a, { type: 'shade', shaded: wrong })).toBe('incorrect');
  });
});
