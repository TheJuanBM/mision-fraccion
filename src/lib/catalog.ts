/** Consultas sobre el banco de actividades y el orden de desbloqueo. Sin estado. */
import { ACTIVITIES } from '../data/activities';
import { MISSIONS } from '../data/missions';
import type { Activity, MissionId } from '../data/types';
import { isCompleted, isMissionUnlocked, type Progress } from './progress';

export const TOTAL_ACTIVITIES = ACTIVITIES.length;
export const MAX_STARS = TOTAL_ACTIVITIES * 3;

export function activitiesOf(missionId: MissionId): readonly Activity[] {
  return ACTIVITIES.filter((a) => a.mission === missionId);
}

/** IDs de cada misión, en el orden de MISSIONS. */
export const MISSION_ACTIVITY_IDS: readonly (readonly string[])[] = MISSIONS.map((m) =>
  activitiesOf(m.id).map((a) => a.id),
);

export function findActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function missionUnlocked(progress: Progress, missionId: MissionId): boolean {
  return isMissionUnlocked(progress, missionId - 1, MISSION_ACTIVITY_IDS);
}

/** Una actividad es accesible si ya está completa, o si es la primera pendiente de su misión. */
export function activityAccessible(progress: Progress, missionId: MissionId, index: number): boolean {
  if (!missionUnlocked(progress, missionId)) return false;
  const ids = MISSION_ACTIVITY_IDS[missionId - 1] ?? [];
  const id = ids[index];
  if (id === undefined) return false;
  if (isCompleted(progress, id)) return true;
  return index === 0 || isCompleted(progress, ids[index - 1]!);
}

export function completedCount(progress: Progress): number {
  return ACTIVITIES.filter((a) => isCompleted(progress, a.id)).length;
}

export function allMissionsCompleted(progress: Progress): boolean {
  return ACTIVITIES.every((a) => isCompleted(progress, a.id));
}
