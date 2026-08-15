import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "@/lib/api";

const TOKEN_KEY = "gym-tracker-token";

type User = {
  id: string;
  name: string | null;
  email: string;
  restTimerSeconds: number;
  isCoach: boolean;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: "athlete" | "coach") => Promise<void>;
  signOut: () => Promise<void>;
  refreshCoachStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUser(token: string): Promise<User> {
  const [{ user: fetchedUser }, { profile }] = await Promise.all([
    api.me(token),
    api.getCoachProfile(token),
  ]);
  return { ...fetchedUser, isCoach: profile !== null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedUser = await loadUser(stored);
        setToken(stored);
        setUser(fetchedUser);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const { token: newToken } = await api.login(email, password);
    const fetchedUser = await loadUser(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(fetchedUser);
  }

  async function signUp(name: string, email: string, password: string, role: "athlete" | "coach") {
    const { token: newToken } = await api.signup(name, email, password, role);
    const fetchedUser = await loadUser(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(fetchedUser);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function refreshCoachStatus() {
    if (!token) return;
    const { profile } = await api.getCoachProfile(token);
    setUser((u) => (u ? { ...u, isCoach: profile !== null } : u));
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, signIn, signUp, signOut, refreshCoachStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
