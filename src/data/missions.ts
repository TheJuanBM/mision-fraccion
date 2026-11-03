/**
 * Misiones, escenarios y textos narrativos. Edite aquí los textos de cada bloque.
 */
import { fraction as f } from '../lib/fraction';
import type { MissionId, MissionMeta } from './types';

export const MISSIONS: readonly MissionMeta[] = [
  {
    id: 1,
    name: 'Explora las fracciones',
    scenario: 'El bosque de las fracciones',
    badge: 'Explorador de Fracciones',
    crystal: 'Cristal del Bosque',
    introParagraphs: [
      'Una fracción nombra partes iguales de un entero.',
      'El denominador (abajo) indica en cuántas partes iguales se divide la unidad.',
      'El numerador (arriba) indica cuántas de esas partes tomamos.',
    ],
    introVisual: { kind: 'bar', fraction: f(3, 4), caption: '3/4: tres de cuatro partes iguales' },
    closing: '¡Recuperaste el Cristal del Bosque! Ya sabes leer, representar y ubicar fracciones.',
  },
  {
    id: 2,
    name: 'Conecta y compara',
    scenario: 'El puente de las equivalencias',
    badge: 'Maestro de las Equivalencias',
    crystal: 'Cristal del Puente',
    introParagraphs: [
      'Dos fracciones son equivalentes cuando representan la misma cantidad, aunque se escriban distinto.',
      'Si multiplicas el numerador y el denominador por el mismo número, obtienes una fracción equivalente.',
      'Para comparar, revisa primero si los denominadores son iguales o qué tan grandes son las partes.',
    ],
    introVisual: { kind: 'bars', fractions: [f(1, 2), f(2, 4), f(4, 8)], caption: '1/2 = 2/4 = 4/8' },
    closing: '¡Recuperaste el Cristal del Puente! Ahora reconoces equivalencias y comparas fracciones.',
  },
  {
    id: 3,
    name: 'Opera y avanza',
    scenario: 'El laboratorio de las operaciones',
    badge: 'Experto en Operaciones',
    crystal: 'Cristal del Laboratorio',
    introParagraphs: [
      'Con igual denominador, sumas o restas los numeradores y conservas el denominador.',
      'Con distinto denominador, primero conviertes las fracciones a un denominador común.',
      'Al terminar, verifica el resultado y simplifícalo si es posible.',
    ],
    introVisual: { kind: 'bars', fractions: [f(2, 5), f(1, 5)], caption: '2/5 + 1/5 = 3/5' },
    closing: '¡Recuperaste el Cristal del Laboratorio! Dominas la suma y la resta de fracciones.',
  },
  {
    id: 4,
    name: 'Resuelve el desafío',
    scenario: 'El templo del desafío final',
    badge: 'Guardián del Universo Fracción',
    crystal: 'Cristal del Templo',
    introParagraphs: [
      'Un problema tiene una pregunta, datos y una operación que te ayuda a responderla.',
      'Antes de calcular, identifica el entero y qué parte del entero se menciona.',
      'Puedes usar barras, la recta numérica o denominadores comunes para comprobar tu respuesta.',
    ],
    introVisual: { kind: 'bars', fractions: [f(3, 4), f(1, 4)], caption: '3/4 + 1/4 = 1 entero' },
    closing: '¡Recuperaste el Cristal del Templo y el Universo Fracción está a salvo!',
  },
];

export function missionById(id: MissionId): MissionMeta {
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) throw new RangeError(`Misión desconocida: ${id}`);
  return mission;
}
