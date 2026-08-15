const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://gym-tracker-chi-tawny.vercel.app";

export class ApiError extends Error {}

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
