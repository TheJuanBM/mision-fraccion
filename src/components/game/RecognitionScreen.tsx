import { MISSIONS } from '../../data/missions';
import { FRACTI } from '../../data/messages';
import { url } from '../../lib/paths';
import { MAX_STARS, allMissionsCompleted, activitiesOf } from '../../lib/catalog';
import { missionCompleted, totalStars } from '../../lib/progress';
import Fracti from './Fracti';
import { useProgress } from './ProgressProvider';
import { ResetButton, Stars } from './ui';

/** Reconocimiento final: insignias, cristales y celebración al completar las cuatro misiones. */
export function RecognitionScreen() {
  const { progress, resetProgress } = useProgress();
  const complete = allMissionsCompleted(progress);

  if (!complete) {
    return (
      <section className="panel panel--center">
        <Fracti mood="thinking" />
        <h1>Aún faltan cristales</h1>
        <p>Completa las cuatro misiones para recuperar el Universo Fracción.</p>
        <a className="btn btn--primary" href={url('/mapa')}>Ir al mapa</a>
      </section>
    );
  }

  return (
    <div className="recognition">
      <section className="panel panel--celebrate panel--hero">
        <Fracti mood="happy" size={120} />
        <p className="eyebrow">Misión cumplida</p>
        <h1>¡El Universo Fracción está a salvo!</h1>
        <p className="fracti-says">{FRACTI.recognition}</p>
        <p>
          Estrellas obtenidas: <strong>{totalStars(progress)}</strong> de {MAX_STARS}.
        </p>
      </section>

      <h2>Tus insignias</h2>
      <ul className="badge-grid">
        {MISSIONS.map((m) => {
          const ids = activitiesOf(m.id).map((a) => a.id);
          const earned = missionCompleted(progress, ids);
          const stars = ids.reduce((sum, id) => sum + (progress.completed[id]?.stars ?? 0), 0);
          return (
            <li key={m.id} className={`badge${earned ? ' badge--earned' : ''}`}>
              <span className="badge__emblem" aria-hidden="true">{earned ? '✦' : '◇'}</span>
              <strong>{m.badge}</strong>
              <span className="muted">{m.crystal}</span>
              <Stars count={Math.round(stars / Math.max(1, ids.length))} />
            </li>
          );
        })}
      </ul>

      <nav className="actions" aria-label="Siguientes pasos">
        <a className="btn btn--primary" href={url('/repaso')}>Repasar desafíos</a>
        <a className="btn btn--ghost" href={url('/mapa')}>Volver al mapa</a>
      </nav>

      <section className="panel panel--quiet">
        <p>{FRACTI.notice}</p>
        <ResetButton onConfirm={resetProgress} />
      </section>
    </div>
  );
}
