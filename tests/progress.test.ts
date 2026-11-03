import { describe, expect, it } from 'vitest';
import {
  emptyProgress,
  isMissionUnlocked,
  missionCompleted,
  parseProgress,
  recordCorrect,
  starsFor,
  totalStars,
} from '../src/lib/progress';

const KNOWN = new Set(['M1-A1', 'M1-A2', 'M2-A1']);

describe('estrellas', () => {
  it('asigna 3, 2 y 1 estrellas según los intentos, sin llegar nunca a 0', () => {
    expect(starsFor(1)).toBe(3);
    expect(starsFor(2)).toBe(2);
    expect(starsFor(3)).toBe(1);
    expect(starsFor(50)).toBe(1);
  });
});

describe('registro de actividades', () => {
  it('registra una actividad resuelta una sola vez', () => {
    const p1 = recordCorrect(emptyProgress(), 'M1-A1', 2);
    expect(p1.completed['M1-A1']).toEqual({ stars: 2, attempts: 2 });
    const p2 = recordCorrect(p1, 'M1-A1', 1);
    expect(p2).toBe(p1);
  });

  it('suma estrellas totales', () => {
    let p = recordCorrect(emptyProgress(), 'M1-A1', 1);
    p = recordCorrect(p, 'M1-A2', 4);
    expect(totalStars(p)).toBe(4);
  });

  it('acota los intentos a valores razonables', () => {
    const p = recordCorrect(emptyProgress(), 'M1-A1', 1e9);
    expect(p.completed['M1-A1']!.attempts).toBeLessThanOrEqual(10_000);
  });
});

describe('desbloqueo de misiones', () => {
  const missions = [['M1-A1', 'M1-A2'], ['M2-A1']];

  it('la primera misión siempre está disponible', () => {
    expect(isMissionUnlocked(emptyProgress(), 0, missions)).toBe(true);
  });

  it('una misión se desbloquea cuando la anterior está completa', () => {
    expect(isMissionUnlocked(emptyProgress(), 1, missions)).toBe(false);
    const p = recordCorrect(recordCorrect(emptyProgress(), 'M1-A1', 1), 'M1-A2', 1);
    expect(missionCompleted(p, missions[0]!)).toBe(true);
    expect(isMissionUnlocked(p, 1, missions)).toBe(true);
  });
});

describe('lectura segura de localStorage', () => {
  it('descarta datos que no son objetos', () => {
    expect(parseProgress(null, KNOWN)).toEqual(emptyProgress());
    expect(parseProgress('texto', KNOWN)).toEqual(emptyProgress());
    expect(parseProgress([1, 2], KNOWN)).toEqual(emptyProgress());
  });

  it('descarta identificadores desconocidos y valores fuera de rango', () => {
    const raw = {
      completed: {
        'M1-A1': { stars: 3, attempts: 1 },
        'M9-Z9': { stars: 3, attempts: 1 },
        'M1-A2': { stars: 0, attempts: 1 },
        'M2-A1': { stars: 2, attempts: -4 },
      },
    };
    const parsed = parseProgress(raw, KNOWN);
    expect(Object.keys(parsed.completed)).toEqual(['M1-A1']);
  });

  it('ignora claves peligrosas como __proto__', () => {
    const raw = JSON.parse('{"completed":{"__proto__":{"stars":3,"attempts":1},"M1-A1":{"stars":3,"attempts":1}}}');
    const parsed = parseProgress(raw, KNOWN);
    expect(Object.keys(parsed.completed)).toEqual(['M1-A1']);
    expect(({} as Record<string, unknown>)['stars']).toBeUndefined();
  });

  it('rechaza valores no enteros', () => {
    const raw = { completed: { 'M1-A1': { stars: 2.5, attempts: 1 } } };
    expect(parseProgress(raw, KNOWN).completed).toEqual({});
  });
});
