import "server-only";

export const COACH_TRIAL_DAYS = 14;

export function computeTrialEndsAt(): Date {
  return new Date(Date.now() + COACH_TRIAL_DAYS * 24 * 60 * 60 * 1000);
}
