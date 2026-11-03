import { useState, type ReactNode } from 'react';
import type { Activity } from '../../data/types';
import { FILL_INCOMPLETE_MESSAGE, INCOMPLETE_MESSAGE, RETRY_MESSAGE } from '../../data/messages';
import { evaluateAnswer, type ActivityAnswer } from '../../lib/validate';
import { VisualBlock } from './FractionVisual';
import {
  ChoiceInput,
  FillInput,
  MatchInput,
  NumberLineInput,
  OrderInput,
  ShadeInput,
} from './ActivityInputs';

interface Props {
  activity: Activity;
  /** True si la actividad ya estaba completa antes de abrirla (repaso: no cambia el progreso). */
  alreadyDone: boolean;
  onCorrect: (attempts: number) => void;
  onNext?: () => void;
}

interface Feedback {
  tone: 'ok' | 'retry' | 'info';
  text: string;
}

/**
 * Ejecuta una actividad: enunciado, entrada, validación, pista y retroalimentación.
 * Los reintentos son ilimitados y los errores no penalizan.
 */
export function ActivityRunner({ activity, alreadyDone, onCorrect, onNext }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(alreadyDone);
  const [feedback, setFeedback] = useState<Feedback | null>(
    alreadyDone ? { tone: 'ok', text: `Ya resolviste esta actividad. ${activity.explanation}` } : null,
  );
  const [showHint, setShowHint] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  function handleSubmit(answer: ActivityAnswer) {
    if (solved) return;
    const verdict = evaluateAnswer(activity, answer);

    if (verdict === 'incomplete') {
      setFeedback({
        tone: 'info',
        text: activity.type === 'fill' ? FILL_INCOMPLETE_MESSAGE : INCOMPLETE_MESSAGE,
      });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (verdict === 'correct') {
      setSolved(true);
      setFeedback({ tone: 'ok', text: `¡Excelente! ${activity.explanation}` });
      if (!alreadyDone) onCorrect(nextAttempts);
    } else {
      setFeedback({ tone: 'retry', text: RETRY_MESSAGE[activity.type] });
    }
  }

  function practiceAgain() {
    setSolved(false);
    setAttempts(0);
    setFeedback(null);
    setShowHint(false);
    setInputKey((k) => k + 1);
  }

  const input: ReactNode = (() => {
    const common = { locked: solved, onSubmit: handleSubmit };
    switch (activity.type) {
      case 'choice':
        return <ChoiceInput key={inputKey} activity={activity} {...common} />;
      case 'match':
        return <MatchInput key={inputKey} activity={activity} {...common} />;
      case 'order':
        return <OrderInput key={inputKey} activity={activity} {...common} />;
      case 'shade':
        return <ShadeInput key={inputKey} activity={activity} {...common} />;
      case 'numberline':
        return <NumberLineInput key={inputKey} activity={activity} {...common} />;
      case 'fill':
        return <FillInput key={inputKey} activity={activity} {...common} />;
    }
  })();

  return (
    <article className="runner" aria-labelledby={`runner-title-${activity.id}`}>
      <header className="runner__header">
        <p className="eyebrow">Actividad {activity.id}</p>
        <h2 id={`runner-title-${activity.id}`}>{activity.title}</h2>
        <p className="objective"><strong>Objetivo:</strong> {activity.objective}</p>
      </header>

      {activity.visual && (
        <div className="runner__visual">
          <VisualBlock visual={activity.visual} />
        </div>
      )}

      <p className="prompt">{activity.prompt}</p>

      {input}

      <div className="runner__tools">
        <button type="button" className="btn btn--ghost" aria-expanded={showHint} onClick={() => setShowHint((v) => !v)}>
          {showHint ? 'Ocultar pista' : 'Ver pista'}
        </button>
      </div>
      {showHint && <p className="hint" role="note">Pista: {activity.hint}</p>}

      <div className={`feedback${feedback ? ` feedback--${feedback.tone}` : ''}`} role="status" aria-live="polite">
        {feedback && <p>{feedback.text}</p>}
      </div>

      <div className="runner__footer">
        {solved && onNext && (
          <button type="button" className="btn btn--primary" onClick={onNext}>
            Siguiente desafío
          </button>
        )}
        {solved && (
          <button type="button" className="btn btn--ghost" onClick={practiceAgain}>
            Practicar de nuevo
          </button>
        )}
      </div>
    </article>
  );
}
