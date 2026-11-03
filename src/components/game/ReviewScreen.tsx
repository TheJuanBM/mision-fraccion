import { ACTIVITIES } from '../../data/activities';
import { MISSIONS } from '../../data/missions';
import { FRACTI } from '../../data/messages';
import { url } from '../../lib/paths';
import { activityAccessible, activitiesOf, missionUnlocked } from '../../lib/catalog';
import { isCompleted } from '../../lib/progress';
import { useProgress } from './ProgressProvider';
import { Stars } from './ui';

/** Repaso: lista todas las actividades y permite volver a practicar las ya resueltas. */
export function ReviewScreen() {
  const { progress } = useProgress();
  return (
    <div className="review">
      <header className="map__header">
        <div>
          <p className="eyebrow">Repaso</p>
          <h1>Repasa tus desafíos</h1>
          <p className="fracti-says">{FRACTI.reviewHint}</p>
        </div>
      </header>

      {MISSIONS.map((m) => {
        const list = activitiesOf(m.id);
        const unlocked = missionUnlocked(progress, m.id);
        return (
          <section key={m.id} className="panel" aria-labelledby={`review-m${m.id}`}>
            <h2 id={`review-m${m.id}`}>Misión {m.id}: {m.name}</h2>
            {!unlocked && <p className="muted">Bloqueada. Se abre al completar la misión anterior.</p>}
            <ul className="review__list">
              {list.map((a) => {
                const index = list.findIndex((x) => x.id === a.id);
                const accessible = activityAccessible(progress, m.id, index);
                const record = progress.completed[a.id];
                return (
                  <li key={a.id}>
                    <span>
                      <strong>{a.title}</strong>
                      <span className="muted"> · {isCompleted(progress, a.id) ? 'Completada' : accessible ? 'Pendiente' : 'Bloqueada'}</span>
                    </span>
                    <span className="review__right">
                      {record && <Stars count={record.stars} />}
                      {accessible ? (
                        <a className="btn btn--small" href={url(`/mision/${m.id}?actividad=${a.id}`)}>
                          {record ? 'Repasar' : 'Abrir'}
                        </a>
                      ) : (
                        <span className="btn btn--small btn--disabled" aria-disabled="true">No disponible</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="muted">Actividades en total: {ACTIVITIES.length}.</p>
      <nav className="actions">
        <a className="btn btn--ghost" href={url('/mapa')}>Volver al mapa</a>
      </nav>
    </div>
  );
}
