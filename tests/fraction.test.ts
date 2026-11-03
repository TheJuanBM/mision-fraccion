import { describe, expect, it } from 'vitest';
import {
  add,
  allDistinct,
  compare,
  fraction,
  fraction as f,
  gcd,
  isEquivalent,
  isSimplest,
  lcm,
  parseFraction,
  scale,
  simplify,
  sortedIndexes,
  subtract,
  toText,
  verbalName,
  withDenominator,
} from '../src/lib/fraction';

describe('fraction (construcción)', () => {
  it('acepta numerador >= 0 y denominador >= 1', () => {
    expect(fraction(0, 5)).toEqual({ n: 0, d: 5 });
    expect(fraction(3, 4)).toEqual({ n: 3, d: 4 });
  });

  it('rechaza denominador cero, negativos y no enteros', () => {
    expect(() => fraction(1, 0)).toThrow();
    expect(() => fraction(-1, 2)).toThrow();
    expect(() => fraction(1.5, 2)).toThrow();
    expect(() => fraction(1, -3)).toThrow();
  });
});

describe('gcd y lcm', () => {
  it('calcula el máximo común divisor', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 5)).toBe(1);
    expect(gcd(0, 9)).toBe(9);
    expect(gcd(8, 0)).toBe(8);
  });

  it('calcula el mínimo común múltiplo', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 4)).toBe(12);
    expect(lcm(2, 8)).toBe(8);
  });
});

describe('simplificación', () => {
  it('reduce a la forma irreducible', () => {
    expect(simplify(f(6, 8))).toEqual({ n: 3, d: 4 });
    expect(simplify(f(3, 12))).toEqual({ n: 1, d: 4 });
    expect(simplify(f(5, 7))).toEqual({ n: 5, d: 7 });
  });

  it('representa 0 como 0/1', () => {
    expect(simplify(f(0, 6))).toEqual({ n: 0, d: 1 });
  });

  it('detecta si ya está en forma más simple', () => {
    expect(isSimplest(f(5, 6))).toBe(true);
    expect(isSimplest(f(4, 6))).toBe(false);
  });
});

describe('equivalencia', () => {
  it('identifica fracciones equivalentes por multiplicación cruzada', () => {
    expect(isEquivalent(f(1, 2), f(2, 4))).toBe(true);
    expect(isEquivalent(f(2, 3), f(4, 6))).toBe(true);
    expect(isEquivalent(f(3, 4), f(6, 8))).toBe(true);
    expect(isEquivalent(f(2, 4), f(1, 3))).toBe(false);
    expect(isEquivalent(f(3, 5), f(3, 4))).toBe(false);
  });

  it('amplifica manteniendo el valor', () => {
    expect(scale(f(2, 3), 2)).toEqual({ n: 4, d: 6 });
    expect(() => scale(f(2, 3), 0)).toThrow();
  });

  it('encuentra la equivalencia con un denominador dado o null si no existe', () => {
    expect(withDenominator(f(1, 2), 6)).toEqual({ n: 3, d: 6 });
    expect(withDenominator(f(2, 3), 7)).toBeNull();
  });
});

describe('comparación y orden', () => {
  it('compara por multiplicación cruzada', () => {
    expect(compare(f(3, 4), f(3, 5))).toBe(1);
    expect(compare(f(1, 4), f(1, 2))).toBe(-1);
    expect(compare(f(2, 4), f(1, 2))).toBe(0);
  });

  it('ordena índices de menor a mayor', () => {
    const list = [f(3, 4), f(1, 4), f(5, 8), f(1, 2)];
    expect(sortedIndexes(list)).toEqual([1, 3, 2, 0]);
  });

  it('detecta valores repetidos', () => {
    expect(allDistinct([f(1, 2), f(2, 4)])).toBe(false);
    expect(allDistinct([f(1, 2), f(1, 3)])).toBe(true);
  });
});

describe('suma y resta exactas', () => {
  it('suma con igual denominador y simplifica', () => {
    expect(add(f(2, 7), f(3, 7))).toEqual({ n: 5, d: 7 });
    expect(add(f(1, 4), f(3, 4))).toEqual({ n: 1, d: 1 });
  });

  it('suma con diferente denominador usando el mínimo común múltiplo', () => {
    expect(add(f(1, 2), f(1, 4))).toEqual({ n: 3, d: 4 });
    expect(add(f(1, 3), f(1, 4))).toEqual({ n: 7, d: 12 });
    expect(add(f(2, 3), f(1, 6))).toEqual({ n: 5, d: 6 });
  });

  it('resta con igual denominador y simplifica', () => {
    expect(subtract(f(5, 6), f(2, 6))).toEqual({ n: 1, d: 2 });
  });

  it('resta con diferente denominador', () => {
    expect(subtract(f(2, 3), f(1, 6))).toEqual({ n: 1, d: 2 });
    expect(subtract(f(5, 12), f(4, 12))).toEqual({ n: 1, d: 12 });
  });

  it('no admite resultados negativos', () => {
    expect(() => subtract(f(1, 4), f(1, 2))).toThrow();
  });
});

describe('lectura y texto', () => {
  it('lee fracciones escritas con formato a/b', () => {
    expect(parseFraction(' 3 / 4 ')).toEqual({ n: 3, d: 4 });
    expect(parseFraction('3/0')).toBeNull();
    expect(parseFraction('3,4')).toBeNull();
    expect(parseFraction('abc')).toBeNull();
    expect(parseFraction('')).toBeNull();
  });

  it('escribe la fracción como texto', () => {
    expect(toText(f(2, 5))).toBe('2/5');
  });

  it('nombra fracciones en palabras', () => {
    expect(verbalName(f(1, 2))).toBe('un medio');
    expect(verbalName(f(2, 2))).toBe('dos medios');
    expect(verbalName(f(3, 4))).toBe('tres cuartos');
    expect(verbalName(f(2, 5))).toBe('dos quintos');
    expect(verbalName(f(4, 6))).toBe('cuatro sextos');
    expect(verbalName(f(1, 3))).toBe('un tercio');
    expect(verbalName(f(5, 7))).toBe('cinco séptimos');
    expect(verbalName(f(3, 13))).toBeNull();
  });
});
