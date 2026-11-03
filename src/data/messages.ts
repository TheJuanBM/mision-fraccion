/**
 * Textos de retroalimentación y de la interfaz. Edite aquí el tono de los mensajes.
 * Principios: no revelar la respuesta correcta tras un error, no penalizar, y
 * ofrecer la pista del concepto cuando el estudiante la pida.
 */
import type { Activity } from './types';

/** Mensaje tras una respuesta incorrecta, según el tipo de actividad. */
export const RETRY_MESSAGE: Readonly<Record<Activity['type'], string>> = {
  choice:
    'Observa nuevamente las partes de la figura. Recuerda que el denominador indica en cuántas partes iguales se divide la unidad. ¡Inténtalo otra vez!',
  shade:
    'Revisa en cuántas partes iguales está dividida la barra y cuántas necesitas colorear. ¡Inténtalo otra vez!',
  numberline:
    'Recuerda que el denominador indica en cuántas partes iguales se divide la unidad. Cuenta los tramos. ¡Inténtalo otra vez!',
  match:
    'Mira el denominador de cada figura para saber el nombre de sus partes, y luego el numerador. ¡Inténtalo otra vez!',
  order:
    'Compara las fracciones con el mismo denominador, o escríbelas como fracciones equivalentes. ¡Inténtalo otra vez!',
  fill:
    'Revisa el procedimiento: ¿los denominadores son iguales? Si no lo son, busca un denominador común. ¡Inténtalo otra vez!',
};

export const INCOMPLETE_MESSAGE = 'Completa tu respuesta antes de comprobarla.';

export const FILL_INCOMPLETE_MESSAGE = 'Escribe un número entero en el numerador y otro en el denominador (el denominador no puede ser 0).';

export const FRACTI = {
  welcome: '¡Hola, explorador! Elige una misión en el mapa y resuelve sus retos. ¡Si te atascas, pide una pista!',
  mapHint: '¡Recupera un cristal completando cada misión! Se abren una a una, como los niveles de un juego.',
  missionIntro: '¡Antes de jugar, mira esta explicación! Después será tu turno.',
  missionDone: '¡Lo lograste! ¡Este cristal ya brilla otra vez!',
  reviewHint: '¿Quieres practicar otra vez? ¡Puedes repetir cualquier reto! Repasar no cambia tus estrellas.',
  recognition: '¡Con tus cuatro cristales, el Universo Fracción vuelve a brillar gracias a ti!',
  notice: 'Las estrellas y las insignias son premios del juego. No son una nota y no miden lo motivado que estás.',
} as const;
