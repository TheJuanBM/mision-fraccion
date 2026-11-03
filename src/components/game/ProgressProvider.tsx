import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { ACTIVITIES } from '../../data/activities';
import {
  clearProgress,
  emptyProgress,
  loadProgress,
  recordCorrect,
  saveProgress,
  type Progress,
} from '../../lib/progress';

const KNOWN_IDS: ReadonlySet<string> = new Set(ACTIVITIES.map((a) => a.id));

/** Estado compartido del juego: progreso y si ya se leyó desde localStorage. */
interface State {
  ready: boolean;
  progress: Progress;
}

type Action =
  | { type: 'hydrate'; progress: Progress }
  | { type: 'correct'; activityId: string; attempts: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ready: true, progress: action.progress };
    case 'correct': {
      const progress = recordCorrect(state.progress, action.activityId, action.attempts);
      return progress === state.progress ? state : { ...state, progress };
    }
    case 'reset':
      return { ready: true, progress: emptyProgress() };
  }
}

export interface ProgressContextValue {
  ready: boolean;
  progress: Progress;
  recordCorrect: (activityId: string, attempts: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Coordina el progreso de todas las pantallas. Solo se usa en el cliente. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ready: false, progress: emptyProgress() });

  useEffect(() => {
    dispatch({ type: 'hydrate', progress: loadProgress(KNOWN_IDS) });
  }, []);

  useEffect(() => {
    // No se guarda antes de leer, para no sobrescribir el progreso existente.
    if (state.ready) saveProgress(state.progress);
  }, [state]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready: state.ready,
      progress: state.progress,
      recordCorrect: (activityId, attempts) => dispatch({ type: 'correct', activityId, attempts }),
      resetProgress: () => {
        clearProgress();
        dispatch({ type: 'reset' });
      },
    }),
    [state],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress debe usarse dentro de ProgressProvider.');
  return ctx;
}
