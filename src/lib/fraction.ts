/**
 * Motor matemático de fracciones.
 *
 * Todas las operaciones usan aritmética entera exacta (multiplicaciones,
 * sumas y comparaciones cruzadas). No se usan aproximaciones decimales.
 * Alcance: fracciones con numerador entero >= 0 y denominador entero >= 1.
 */

export interface Fraction {
  readonly n: number;
  readonly d: number;
}

export class FractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FractionError';
  }
}

/** Crea una fracción validada. Lanza FractionError si los datos no son válidos. */
export function fraction(n: number, d: number): Fraction {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) {
    throw new FractionError('El numerador y el denominador deben ser enteros.');
  }
  if (n < 0) {
    throw new FractionError('El numerador no puede ser negativo en este OVA.');
  }
  if (d <= 0) {
    throw new FractionError('El denominador debe ser mayor que cero.');
  }
  return { n, d };
}

/** Máximo común divisor (algoritmo de Euclides). gcd(0, d) = d. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}

/** Mínimo común múltiplo de dos enteros positivos. */
export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

/** Forma irreducible de la fracción. 0/d se representa como 0/1. */
export function simplify(f: Fraction): Fraction {
  const g = gcd(f.n, f.d);
  return fraction(f.n / g, f.d / g);
}

/** True si numerador y denominador son primos entre sí (forma más simple). */
export function isSimplest(f: Fraction): boolean {
  return gcd(f.n, f.d) === 1;
}

/** Igualdad de valor: a/b = c/d  ⇔  a·d = c·b. */
export function isEquivalent(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}

/** Igualdad de forma: mismo numerador y mismo denominador. */
export function isExactly(a: Fraction, b: Fraction): boolean {
  return a.n === b.n && a.d === b.d;
}

/** Comparación exacta por multiplicación cruzada: -1 si a<b, 0 si iguales, 1 si a>b. */
export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const left = a.n * b.d;
  const right = b.n * a.d;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/** Suma exacta usando el mínimo común denominador; el resultado se simplifica. */
export function add(a: Fraction, b: Fraction): Fraction {
  const l = lcm(a.d, b.d);
  return simplify(fraction(a.n * (l / a.d) + b.n * (l / b.d), l));
}

/**
 * Resta exacta. En quinto grado solo se admiten resultados no negativos;
 * si a < b se lanza FractionError.
 */
export function subtract(a: Fraction, b: Fraction): Fraction {
  const l = lcm(a.d, b.d);
  const numerator = a.n * (l / a.d) - b.n * (l / b.d);
  if (numerator < 0) {
    throw new FractionError('La resta produciría un resultado negativo.');
  }
  return simplify(fraction(numerator, l));
}

/** Amplifica una fracción: multiplica numerador y denominador por k (k entero >= 1). */
export function scale(f: Fraction, k: number): Fraction {
  if (!Number.isSafeInteger(k) || k < 1) {
    throw new FractionError('El factor debe ser un entero mayor o igual que 1.');
  }
  return fraction(f.n * k, f.d * k);
}

/** Devuelve la fracción equivalente con el denominador indicado, o null si no existe. */
export function withDenominator(f: Fraction, d: number): Fraction | null {
  if (d <= 0 || (d * f.n) % f.d !== 0) return null;
  return fraction((d * f.n) / f.d, d);
}

/** Texto en forma "3/4". */
export function toText(f: Fraction): string {
  return `${f.n}/${f.d}`;
}

/**
 * Lee una fracción escrita como "a/b" (dígitos, espacios permitidos).
 * Devuelve null si el texto no tiene ese formato o el denominador es cero.
 */
export function parseFraction(text: string): Fraction | null {
  const match = /^\s*(\d{1,6})\s*\/\s*(\d{1,6})\s*$/.exec(text);
  if (!match) return null;
  const n = Number(match[1]);
  const d = Number(match[2]);
  if (d === 0) return null;
  return fraction(n, d);
}

/** Índices de la lista ordenados de menor a mayor (orden estable). */
export function sortedIndexes(list: readonly Fraction[]): number[] {
  return list
    .map((_, i) => i)
    .sort((i, j) => compare(list[i]!, list[j]!) || i - j);
}

/** True si todos los valores de la lista son distintos entre sí. */
export function allDistinct(list: readonly Fraction[]): boolean {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (isEquivalent(list[i]!, list[j]!)) return false;
    }
  }
  return true;
}

const UNITS = [
  '', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis',
  'siete', 'ocho', 'nueve', 'diez', 'once', 'doce',
];

const PART_NAMES: Readonly<Record<number, string>> = {
  2: 'medio',
  3: 'tercio',
  4: 'cuarto',
  5: 'quinto',
  6: 'sexto',
  7: 'séptimo',
  8: 'octavo',
  9: 'noveno',
  10: 'décimo',
  11: 'onceavo',
  12: 'doceavo',
};

/**
 * Nombre en palabras para fracciones con denominador entre 2 y 12 y numerador entre 1 y 12.
 * Ejemplos: 1/2 → "un medio"; 3/4 → "tres cuartos". Devuelve null si no aplica.
 */
export function verbalName(f: Fraction): string | null {
  const part = PART_NAMES[f.d];
  const count = UNITS[f.n];
  if (!part || f.n < 1 || f.n > 12 || count === undefined) return null;
  return f.n === 1 ? `${count} ${part}` : `${count} ${part}s`;
}
