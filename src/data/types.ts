import type { Fraction } from '../lib/fraction';

export type MissionId = 1 | 2 | 3 | 4;

/** Representaciones visuales estáticas (SVG). */
export type Visual =
  | { kind: 'bar'; fraction: Fraction; caption?: string }
  | { kind: 'bars'; fractions: readonly Fraction[]; caption?: string }
  | { kind: 'numberline'; max: 1 | 2; denominator: number; marked?: Fraction; caption?: string };

interface ActivityBase {
  /** Identificador estable, p. ej. "M1-A3". Se usa en el progreso guardado. */
  id: string;
  mission: MissionId;
  title: string;
  /** Objetivo de aprendizaje visible para el estudiante. */
  objective: string;
  /** Enunciado. */
  prompt: string;
  visual?: Visual;
  /** Pista conceptual, disponible bajo demanda y sin penalización. */
  hint: string;
  /** Explicación mostrada al resolver correctamente. */
  explanation: string;
}

export interface ChoiceActivity extends ActivityBase {
  type: 'choice';
  options: readonly string[];
  correctIndex: number;
}

/** Empareja cada elemento de `left` con un elemento de `right`. */
export interface MatchActivity extends ActivityBase {
  type: 'match';
  left: readonly { label: string; fraction?: Fraction }[];
  right: readonly string[];
  /** Para cada índice de `left`, el índice correcto en `right`. */
  correctPairs: readonly number[];
}

/** El estudiante reordena `items`; la respuesta es una permutación de índices. */
export interface OrderActivity extends ActivityBase {
  type: 'order';
  items: readonly Fraction[];
  direction: 'ascending';
}

/** El estudiante colorea partes de una barra de `parts` partes iguales. */
export interface ShadeActivity extends ActivityBase {
  type: 'shade';
  parts: number;
  target: Fraction;
}

/** El estudiante elige un punto de la recta numérica dividida en `denominator` partes. */
export interface NumberLineActivity extends ActivityBase {
  type: 'numberline';
  max: 1 | 2;
  denominator: number;
  target: Fraction;
}

/**
 * El estudiante escribe numerador y denominador.
 * - exact: debe coincidir numerador y denominador.
 * - equivalent: basta con que tenga el mismo valor.
 * - simplest: mismo valor y en forma irreducible.
 */
export interface FillActivity extends ActivityBase {
  type: 'fill';
  expected: Fraction;
  mode: 'exact' | 'equivalent' | 'simplest';
}

export type Activity =
  | ChoiceActivity
  | MatchActivity
  | OrderActivity
  | ShadeActivity
  | NumberLineActivity
  | FillActivity;

export interface MissionMeta {
  id: MissionId;
  name: string;
  scenario: string;
  badge: string;
  crystal: string;
  /** Explicación visual breve previa a los retos. */
  introParagraphs: readonly string[];
  introVisual: Visual;
  closing: string;
}
