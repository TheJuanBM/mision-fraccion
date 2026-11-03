import { useState } from 'react';
import { MISSIONS, missionById } from '../../data/missions';
import type { MissionId } from '../../data/types';
import { FRACTI } from '../../data/messages';
import { url } from '../../lib/paths';
import { activitiesOf, activityAccessible, missionUnlocked } from '../../lib/catalog';
import { isCompleted, missionCompleted } from '../../lib/progress';
import { ActivityRunner } from './ActivityRunner';
import { VisualBlock } from './FractionVisual';
import Fracti from './Fracti';
import { Stars } from './ui';
import { useProgress } from './ProgressProvider';

interface Props {
  missionId: MissionId;
  /** Actividad a abrir desde el enlace de repaso (?actividad=ID). */
  requestedActivityId?: string | null;
}

export function MissionScreen({ missionId, requestedActivityId }: Props) {
  const { progress, recordCorrect } = useProgress();
  const meta = missionById(missionId);
  const activities = activitiesOf(missionId);
  const unlocked = missionUnlocked(progress, missionId);
  const done = missionCompleted(progress, activities.map((a) => a.id));
  const missionStars = activities.reduce((sum, a) => sum + (progress.completed[a.id]?.stars ?? 0), 0);

  const firstPending = Math.max(0, activities.findIndex((a) => !isCompleted(progress, a.id)));
  const requestedIndex = requestedActivityId ? activities.findIndex((a) => a.id === requestedActivityId) : -1;
  const initialIndex =
    requestedIndex >= 0 && activityAccessible(progress, missionId, requestedIndex)
      ? requestedIndex
      : done ? 0 : firstPending;

  const [index, setIndex] = useState(initialIndex);
  const [showIntro, setShowIntro] = useState(!activities.some((a) => isCompleted(progress, a.id)));

  if (!unlocked) {
    const prev = MISSIONS[missionId - 2];
    return (
      <section className="panel panel--center">
        <Fracti mood="thinking" />
        <h1>Misión bloqueada</h1>
        <p>
          Esta misión se abre al completar «{prev?.name ?? 'la misión anterior'}». Completa esa misión para continuar.
        </p>
        <a className="btn btn--primary" href={url('/mapa')}>Volver al mapa</a>
      </section>
    );
  }

  const active = activities[index] ?? activities[0]!;
  const activeIsDone = isCompleted(progress, active.id);
  const nextMission = MISSIONS.find((m) => m.id === missionId + 1);

  return (
    <div className="mission">
      <nav className="breadcrumb" aria-label="Ubicación">
        <a href={url('/mapa')}>Mapa</a> <span aria-hidden="true">/</span> <span>Misión {missionId} de {MISSIONS.length}</span>
      </nav>

      <header className="mission__header">
        <p className="eyebrow">{meta.scenario}</p>
        <h1>{meta.name}</h1>
        <p className="mission__meta">
          Insignia: <strong>{meta.badge}</strong> · Cristal: <strong>{meta.crystal}</strong> ·{' '}
          <span>Estrellas en esta misión: {missionStars} de {activities.length * 3}</span>
        </p>
      </header>

      <button type="button" className="btn btn--ghost" aria-expanded={showIntro} onClick={() => setShowIntro((v) => !v)}>
        {showIntro ? 'Ocultar explicación' : 'Ver explicación de la misión'}
      </button>

      {showIntro && (
        <section className="intro panel" aria-label="Explicación de la misión">
          <div className="intro__guide">
            <Fracti mood="happy" size={80} />
            <p className="fracti-says">{FRACTI.missionIntro}</p>
          </div>
          <ul className="intro__points">
            {meta.introParagraphs.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="intro__visual">
            <VisualBlock visual={meta.introVisual} />
          </div>
        </section>
      )}

      <div className="mission__grid">
        <nav className="activity-list" aria-label="Actividades de la misión">
          <ol>
            {activities.map((a, i) => {
              const accessible = activityAccessible(progress, missionId, i);
              const record = progress.completed[a.id];
              const state = record ? 'Completada' : accessible ? 'Disponible' : 'Bloqueada';
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className={`activity-list__btn${i === index ? ' is-current' : ''}`}
                    disabled={!accessible}
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => setIndex(i)}
                  >
                    <span className="activity-list__num">{i + 1}</span>
                    <span className="activity-list__text">
                      <span>{a.title}</span>
                      <span className="activity-list__state">{state}</span>
                    </span>
                    {record ? <Stars count={record.stars} /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mission__main">
          <ActivityRunner
            key={active.id}
            activity={active}
            alreadyDone={activeIsDone}
            onCorrect={(attempts) => recordCorrect(active.id, attempts)}
            onNext={index < activities.length - 1 ? () => setIndex(index + 1) : undefined}
          />

          {done && (
            <section className="panel panel--celebrate" aria-live="polite">
              <Fracti mood="happy" size={72} />
              <h2>{FRACTI.missionDone}</h2>
              <p>{meta.closing}</p>
              <p>
                Obtuviste la insignia <strong>{meta.badge}</strong>. Estrellas en esta misión: {missionStars} de {activities.length * 3}.
              </p>
              <div className="actions">
                {nextMission && missionUnlocked(progress, nextMission.id) && (
                  <a className="btn btn--primary" href={url(`/mision/${nextMission.id}`)}>
                    Ir a la misión {nextMission.id}
                  </a>
                )}
                <a className="btn btn--ghost" href={url('/mapa')}>Volver al mapa</a>
              </div>
            </section>
          )}

          {!activeIsDone && (
            <p className="muted">Actividad {index + 1} de {activities.length}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
