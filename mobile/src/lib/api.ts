const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://gym-tracker-chi-tawny.vercel.app";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", token, body } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong. Try again.");
  }
  return data as T;
}

export type AuthResponse = {
  token: string;
  user: { id: string; name: string | null; email: string };
};

export function signup(name: string, email: string, password: string, role: "athlete" | "coach") {
  return request<AuthResponse>("/api/mobile/auth/signup", {
    method: "POST",
    body: { name, email, password, role },
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/api/mobile/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export type MeResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    restTimerSeconds: number;
  };
};

export function me(token: string) {
  return request<MeResponse>("/api/mobile/me", { token });
}

export type TodayItem = {
  id: string;
  exercise: { id: string; name: string; muscleGroup: string; imageUrl: string | null };
  targetWeight: number | null;
  targetSets: number | null;
  targetReps: number | null;
  loggedCount: number;
  workingSetsLoggedToday: number;
};

export type TodayResponse = {
  today: string;
  todayLabel: string;
  streak: number;
  thisWeekVolume: number;
  program: { id: string; name: string } | null;
  programDay: { label: string | null; notes: string | null } | null;
  items: TodayItem[];
};

export function getToday(token: string) {
  return request<TodayResponse>("/api/mobile/today", { token });
}

export type LogSetInput = {
  exerciseId: string;
  weight: number;
  sets: number;
  reps: number;
  rir?: number | null;
  notes?: string | null;
  isWarmup?: boolean;
};

export type LogSetResponse = { isNewPR: boolean; previousBest: number | null };

export function logSet(token: string, input: LogSetInput) {
  return request<LogSetResponse>("/api/mobile/log-set", { method: "POST", token, body: input });
}

export type ProgramSummary = {
  id: string;
  name: string;
  isActive: boolean;
  dayCount: number;
  exerciseCount: number;
};

export function getPrograms(token: string) {
  return request<{ programs: ProgramSummary[] }>("/api/mobile/programs", { token });
}

export function createProgram(token: string, name: string) {
  return request<{ id: string }>("/api/mobile/programs", {
    method: "POST",
    token,
    body: { name },
  });
}

export function activateProgram(token: string, programId: string) {
  return request<{ ok: true }>(`/api/mobile/programs/${programId}/activate`, {
    method: "POST",
    token,
  });
}

export function deleteProgram(token: string, programId: string) {
  return request<{ ok: true }>(`/api/mobile/programs/${programId}`, {
    method: "DELETE",
    token,
  });
}

export type ProgramExerciseEntry = {
  id: string;
  exercise: { id: string; name: string; muscleGroup: string };
  targetWeight: number | null;
  targetSets: number | null;
  targetReps: number | null;
};

export type ProgramDay = {
  dayOfWeek: string;
  label: string | null;
  notes: string | null;
  exercises: ProgramExerciseEntry[];
};

export type ExerciseCatalogEntry = { id: string; name: string; muscleGroup: string };

export type ProgramDetailResponse = {
  program: { id: string; name: string; isActive: boolean };
  days: ProgramDay[];
  allExercises: ExerciseCatalogEntry[];
};

export function getProgramDetail(token: string, programId: string) {
  return request<ProgramDetailResponse>(`/api/mobile/programs/${programId}`, { token });
}

export function addProgramExercise(
  token: string,
  programId: string,
  input: { dayOfWeek: string; exerciseId: string; weight?: number | null; sets?: number | null; reps?: number | null }
) {
  return request<{ id: string }>(`/api/mobile/programs/${programId}/exercises`, {
    method: "POST",
    token,
    body: input,
  });
}

export function updateProgramExercise(
  token: string,
  programExerciseId: string,
  input: { weight?: number | null; sets?: number | null; reps?: number | null }
) {
  return request<{ ok: true }>(`/api/mobile/program-exercises/${programExerciseId}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function removeProgramExercise(token: string, programExerciseId: string) {
  return request<{ ok: true }>(`/api/mobile/program-exercises/${programExerciseId}`, {
    method: "DELETE",
    token,
  });
}

export type HistoryLogEntry = {
  id: string;
  weight: number;
  sets: number;
  reps: number;
  isWarmup: boolean;
  exercise: { id: string; name: string; muscleGroup: string };
};

export type HistoryGroup = { label: string; logs: HistoryLogEntry[] };

export function getHistory(token: string) {
  return request<{ groups: HistoryGroup[] }>("/api/mobile/history", { token });
}

export type PRRow = {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  weight: number;
  date: string;
};

export function getAllPRs(token: string) {
  return request<{ prs: PRRow[] }>("/api/mobile/history/prs", { token });
}

export type SessionLog = {
  id: string;
  weight: number;
  sets: number;
  reps: number;
  rir: number | null;
  notes: string | null;
  isWarmup: boolean;
  date: string;
  isPR: boolean;
};

export type ExerciseSession = {
  key: string;
  date: string;
  volume: number;
  trend: "up" | "down" | "flat" | null;
  delta: number | null;
  logs: SessionLog[];
};

export type ExerciseHistoryResponse = {
  exercise: { id: string; name: string; muscleGroup: string };
  prWeight: number | null;
  prDate: string | null;
  sessions: ExerciseSession[];
};

export function getExerciseHistory(token: string, exerciseId: string) {
  return request<ExerciseHistoryResponse>(`/api/mobile/history/${exerciseId}`, { token });
}

export type ExerciseLibraryEntry = {
  id: string;
  name: string;
  muscleGroup: string;
  imageUrl: string | null;
  description: string | null;
  createdByUserId: string | null;
};

export function getExerciseLibrary(token: string) {
  return request<{ exercises: ExerciseLibraryEntry[]; prByExercise: Record<string, number> }>(
    "/api/mobile/exercises",
    { token }
  );
}

export type ProgressExercise = {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sessionCount: number;
  lastDate: string;
};

export function getProgressExercises(token: string) {
  return request<{ exercises: ProgressExercise[] }>("/api/mobile/progress", { token });
}

export type StatsResponse = {
  streak: number;
  thisWeekVolume: number;
  weekDelta: number | null;
  muscleGroupRanking: { muscleGroup: string; volume: number }[];
  heatmap: { date: string; dateKey: string; volume: number; level: 0 | 1 | 2 | 3 | 4 }[][];
};

export function getStats(token: string) {
  return request<StatsResponse>("/api/mobile/stats", { token });
}

export type BodyWeightLog = { id: string; weightKg: number; date: string };

export type ProfileResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    heightCm: number | null;
    weightKg: number | null;
    dateOfBirth: string | null;
    sex: "MALE" | "FEMALE" | null;
    restTimerSeconds: number;
  };
  bmi: number | null;
  bmiCategory: string | null;
  bmr: number | null;
  bodyWeightLogs: BodyWeightLog[];
};

export function getProfile(token: string) {
  return request<ProfileResponse>("/api/mobile/profile", { token });
}

export function updateName(token: string, name: string) {
  return request<{ ok: true }>("/api/mobile/profile/name", { method: "PATCH", token, body: { name } });
}

export function updateBodyStats(
  token: string,
  input: { heightCm: number; weightKg: number; dateOfBirth: string; sex: "MALE" | "FEMALE" }
) {
  return request<{ ok: true }>("/api/mobile/profile/body-stats", {
    method: "PATCH",
    token,
    body: input,
  });
}

export function updateRestTimer(token: string, restTimerSeconds: number) {
  return request<{ ok: true }>("/api/mobile/profile/rest-timer", {
    method: "PATCH",
    token,
    body: { restTimerSeconds },
  });
}

export function logBodyWeight(token: string, weightKg: number) {
  return request<{ ok: true }>("/api/mobile/profile/body-weight", {
    method: "POST",
    token,
    body: { weightKg },
  });
}

export function deleteBodyWeightLog(token: string, logId: string) {
  return request<{ ok: true }>(`/api/mobile/profile/body-weight/${logId}`, {
    method: "DELETE",
    token,
  });
}

export type CoachExperienceEntry = {
  id: string;
  title: string;
  organization: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
};

export type CoachProfile = {
  id: string;
  bio: string | null;
  specialties: string[];
  joinCode: string;
  isPublic: boolean;
  subscriptionStatus: string;
  trialEndsAt: string | null;
};

export function getCoachProfile(token: string) {
  return request<{ profile: CoachProfile | null }>("/api/mobile/coach/profile", { token });
}

export function updateCoachProfile(
  token: string,
  input: { bio: string; specialties: string; isPublic: boolean }
) {
  return request<{ ok: true }>("/api/mobile/coach/profile", { method: "PATCH", token, body: input });
}

export function regenerateJoinCode(token: string) {
  return request<{ joinCode: string }>("/api/mobile/coach/profile/regenerate-code", {
    method: "POST",
    token,
  });
}

export type CoachDashboardResponse = {
  profile: CoachProfile;
  roster: { athleteId: string; name: string | null; email: string; streak: number }[];
  pendingRequests: { athleteId: string; name: string | null }[];
  sentInvites: { id: string; email: string }[];
};

export function getCoachDashboard(token: string) {
  return request<CoachDashboardResponse>("/api/mobile/coach/dashboard", { token });
}

export function sendCoachInvite(token: string, email: string) {
  return request<{ ok: true }>("/api/mobile/coach/invite", { method: "POST", token, body: { email } });
}

export function respondToRequest(token: string, athleteId: string, accept: boolean) {
  return request<{ ok: true }>(`/api/mobile/coach/requests/${athleteId}`, {
    method: "POST",
    token,
    body: { accept },
  });
}

export type CoachListing = {
  userId: string;
  name: string;
  bio: string | null;
  specialties: string[];
};

export function getCoachDirectory(token: string) {
  return request<{ coaches: CoachListing[] }>("/api/mobile/coaches", { token });
}

export type CoachDetail = {
  coach: {
    userId: string;
    name: string;
    bio: string | null;
    specialties: string[];
    experiences: CoachExperienceEntry[];
  };
  linkStatus: "NONE" | "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";
  isSelf: boolean;
};

export function getCoachDetail(token: string, coachUserId: string) {
  return request<CoachDetail>(`/api/mobile/coaches/${coachUserId}`, { token });
}

export function requestCoach(token: string, coachUserId: string) {
  return request<{ ok: true }>(`/api/mobile/coaches/${coachUserId}/request`, {
    method: "POST",
    token,
  });
}

export function joinByCode(token: string, code: string) {
  return request<{ ok: true }>("/api/mobile/coaches/join-code", {
    method: "POST",
    token,
    body: { code },
  });
}

export type MyCoachesResponse = {
  accepted: {
    coachId: string;
    name: string | null;
    email: string;
    programs: { id: string; name: string; isActive: boolean }[];
  }[];
  pending: { coachId: string; name: string | null; email: string }[];
};

export function getMyCoaches(token: string) {
  return request<MyCoachesResponse>("/api/mobile/coaches/mine", { token });
}

export function revokeCoachLink(token: string, counterpartUserId: string) {
  return request<{ ok: true }>(`/api/mobile/coach-links/${counterpartUserId}/revoke`, {
    method: "POST",
    token,
  });
}
