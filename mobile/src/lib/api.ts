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

export function signup(name: string, email: string, password: string) {
  return request<AuthResponse>("/api/mobile/auth/signup", {
    method: "POST",
    body: { name, email, password },
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
