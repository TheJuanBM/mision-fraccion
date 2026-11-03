import { MISSIONS } from '../../data/missions';
import { FRACTI } from '../../data/messages';
import { url } from '../../lib/paths';
import { MAX_STARS, TOTAL_ACTIVITIES, activitiesOf, allMissionsCompleted, completedCount, missionUnlocked } from '../../lib/catalog';
import { isCompleted, totalStars, missionCompleted } from '../../lib/progress';
import Fracti from './Fracti';
import { useProgress } from './ProgressProvider';
import { ProgressBar, ResetButton, Stars } from './ui';

/** Mapa interactivo: cuatro misiones con estado real (bloqueada, disponible o completada). */
export function MapScreen() {
  const { progress, resetProgress } = useProgress();
  const completed = completedCount(progress);
  const everythingDone = allMissionsCompleted(progress);

  return (
    <div className="map">
      <header className="map__header">
        <div>
          <p className="eyebrow">Mapa del Universo Fracción</p>
          <h1>Cuatro misiones, un universo de fracciones por descubrir</h1>
          <p className="fracti-says">{FRACTI.mapHint}</p>
        </div>
        <Fracti mood="idle" size={88} />
      </header>

      <section className="panel map__summary" aria-label="Resumen de avance">
        <ProgressBar value={completed} max={TOTAL_ACTIVITIES} label="Desafíos completados" />
        <p>
          Estrellas: <Stars count={Math.round(totalStars(progress) / Math.max(1, TOTAL_ACTIVITIES))} />{' '}
          <span className="muted">{totalStars(progress)} de {MAX_STARS}</span>
        </p>
      </section>

      <ol className="map__grid">
        {MISSIONS.map((m) => {
          const ids = activitiesOf(m.id).map((a) => a.id);
          const unlocked = missionUnlocked(progress, m.id);
          const done = missionCompleted(progress, ids);
          const stars = ids.reduce((sum, id) => sum + (progress.completed[id]?.stars ?? 0), 0);
          const started = ids.some((id) => isCompleted(progress, id));
          const status = done ? 'Completada' : unlocked ? (started ? 'En curso' : 'Disponible') : 'Bloqueada';
          return (
            <li key={m.id} className={`mission-card mission-card--${done ? 'done' : unlocked ? 'open' : 'locked'}`}>
              <p className="eyebrow">Misión {m.id} · {status}</p>
              <h2>{m.name}</h2>
              <p className="muted">{m.scenario}</p>
              <p className="mission-card__crystal">
                {done ? `✦ ${m.crystal} recuperado` : `◇ ${m.crystal} perdido`}
              </p>
              <p className="mission-card__stars">
                <Stars count={Math.round(stars / Math.max(1, ids.length))} />{' '}
                <span className="muted">{stars} de {ids.length * 3}</span>
              </p>
              {unlocked ? (
                <a className="btn btn--primary" href={url(`/mision/${m.id}`)}>
                  {done ? 'Repasar misión' : started ? 'Continuar misión' : 'Entrar a la misión'}
                </a>
              ) : (
                <span className="btn btn--disabled" aria-disabled="true">
                  Completa la misión {m.id - 1} para abrir
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <nav className="actions" aria-label="Accesos rápidos">
        <a className="btn btn--ghost" href={url('/repaso')}>Repasar desafíos</a>
        {everythingDone && (
          <a className="btn btn--gold" href={url('/reconocimiento')}>Ver reconocimiento final</a>
        )}
        <a className="btn btn--ghost" href={url('/instrucciones')}>Instrucciones</a>
      </nav>

      <section className="panel panel--quiet" aria-label="Reiniciar">
        <p>{FRACTI.notice}</p>
        <ResetButton onConfirm={resetProgress} />
      </section>
    </div>
  );
}
