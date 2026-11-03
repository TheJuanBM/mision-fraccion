import { useState } from 'react';
import type { MissionId } from '../../data/types';
import { MISSIONS } from '../../data/missions';
import { MapScreen } from './MapScreen';
import { MissionScreen } from './MissionScreen';
import { RecognitionScreen } from './RecognitionScreen';
import { ReviewScreen } from './ReviewScreen';
import { ProgressProvider, useProgress } from './ProgressProvider';

export type GameScreenName = 'map' | 'mission' | 'review' | 'recognition';

interface Props {
  screen: GameScreenName;
  missionId?: MissionId;
}

/**
 * Componente principal del juego. Envuelve todas las pantallas interactivas en el
 * proveedor de progreso, de modo que el avance es el mismo en mapa, misiones,
 * repaso y reconocimiento. Se monta solo en el cliente (client:only).
 */
export default function GameApp({ screen, missionId }: Props) {
  return (
    <ProgressProvider>
      <ScreenSwitch screen={screen} missionId={missionId} />
    </ProgressProvider>
  );
}

function ScreenSwitch({ screen, missionId }: Props) {
  const { ready } = useProgress();
  // Lee el parámetro ?actividad=ID del enlace de repaso (solo en el cliente).
  const [requestedActivityId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('actividad'),
  );

  if (!ready) {
    return <p className="loading" role="status">Cargando tu aventura…</p>;
  }

  switch (screen) {
    case 'map':
      return <MapScreen />;
    case 'review':
      return <ReviewScreen />;
    case 'recognition':
      return <RecognitionScreen />;
    case 'mission': {
      const valid = MISSIONS.some((m) => m.id === missionId);
      if (!valid || missionId === undefined) {
        return <p className="panel">Esta misión no existe. <a href="/mapa">Volver al mapa</a>.</p>;
      }
      return <MissionScreen missionId={missionId} requestedActivityId={requestedActivityId} />;
    }
  }
}
