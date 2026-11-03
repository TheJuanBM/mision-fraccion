/**
 * Progreso del estudiante. Es anónimo y se guarda solo en el navegador (localStorage).
 * Las estrellas son recursos de gamificación, no una calificación ni una medida de motivación.
 */

export const STORAGE_KEY = 'mision-fraccion:progreso:v1';

export interface ActivityProgress {
  /** 1 a 3 estrellas. Nunca es 0: completar una actividad siempre vale al menos una estrella. */
  stars: 1 | 2 | 3;
  /** Número de intentos hasta la respuesta correcta (incluido el correcto). */
  attempts: number;
}

export interface Progress {
  completed: Readonly<Record<string, ActivityProgress>>;
}

export function emptyProgress(): Progress {
  return { completed: {} };
}

/** 1 intento → 3 estrellas; 2 intentos → 2 estrellas; más intentos → 1 estrella. */
export function starsFor(attempts: number): 1 | 2 | 3 {
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
}

const MAX_ATTEMPTS_STORED = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valida el contenido leído de localStorage. Cualquier dato inesperado se descarta.
 * Solo se aceptan identificadores de actividades conocidas (lista blanca).
 */
export function parseProgress(raw: unknown, knownIds: ReadonlySet<string>): Progress {
  if (!isRecord(raw) || !isRecord(raw.completed)) return emptyProgress();

  const completed: Record<string, ActivityProgress> = {};
  for (const [id, value] of Object.entries(raw.completed)) {
    if (!knownIds.has(id) || !isRecord(value)) continue;
    const { stars, attempts } = value;
    const validStars = typeof stars === 'number' && Number.isInteger(stars) && stars >= 1 && stars <= 3;
    const validAttempts =
      typeof attempts === 'number' && Number.isInteger(attempts) && attempts >= 1 && attempts <= MAX_ATTEMPTS_STORED;
    if (validStars && validAttempts) {
      completed[id] = { stars: stars as 1 | 2 | 3, attempts: attempts as number };
    }
  }
  return { completed };
}

/** Registra una actividad resuelta. Si ya estaba completa, conserva el resultado original. */
export function recordCorrect(progress: Progress, activityId: string, attempts: number): Progress {
  if (progress.completed[activityId]) return progress;
  const safeAttempts = Math.max(1, Math.min(Math.trunc(attempts), MAX_ATTEMPTS_STORED));
  return {
    completed: {
      ...progress.completed,
      [activityId]: { stars: starsFor(safeAttempts), attempts: safeAttempts },
    },
  };
}

export function isCompleted(progress: Progress, activityId: string): boolean {
  return Object.hasOwn(progress.completed, activityId);
}

export function missionCompleted(progress: Progress, activityIds: readonly string[]): boolean {
  return activityIds.every((id) => isCompleted(progress, id));
}

/**
 * Una misión se desbloquea cuando la anterior está completa.
 * `missionActivityIds[0]` es la misión 1 (siempre disponible).
 */
export function isMissionUnlocked(progress: Progress, missionIndex: number, missionActivityIds: readonly (readonly string[])[]): boolean {
  if (missionIndex <= 0) return true;
  const previous = missionActivityIds[missionIndex - 1];
  return previous !== undefined && missionCompleted(progress, previous);
}

export function totalStars(progress: Progress): number {
  return Object.values(progress.completed).reduce((sum, p) => sum + p.stars, 0);
}

/** Lee el progreso guardado. Nunca lanza excepciones: si algo falla devuelve progreso vacío. */
export function loadProgress(knownIds: ReadonlySet<string>): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyProgress();
    return parseProgress(JSON.parse(raw), knownIds);
  } catch {
    return emptyProgress();
  }
}

/** Guarda el progreso. Si el almacenamiento no está disponible, el juego sigue funcionando en memoria. */
export function saveProgress(progress: Progress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Almacenamiento bloqueado o lleno: se omite sin exponer detalles al estudiante.
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ver saveProgress.
  }
}
