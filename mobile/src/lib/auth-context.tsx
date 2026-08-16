import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import * as api from "@/lib/api";
import { authenticateWithBiometrics } from "@/lib/biometrics";

const TOKEN_KEY = "gym-tracker-token";
const BIOMETRIC_LOCK_KEY = "gym-tracker-biometric-lock";

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
  isLocked: boolean;
  biometricLockEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: "athlete" | "coach") => Promise<void>;
  signOut: () => Promise<void>;
  refreshCoachStatus: () => Promise<void>;
  setBiometricLockEnabled: (enabled: boolean) => Promise<void>;
  unlock: () => Promise<boolean>;
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
  const [isLocked, setIsLocked] = useState(false);
  const [biometricLockEnabled, setBiometricLockEnabledState] = useState(false);

  useEffect(() => {
    (async () => {
      const [stored, lockPref] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(BIOMETRIC_LOCK_KEY),
      ]);
      const lockEnabled = lockPref === "true";
      setBiometricLockEnabledState(lockEnabled);

      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedUser = await loadUser(stored);
        setToken(stored);
        setUser(fetchedUser);
        if (lockEnabled) setIsLocked(true);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || !biometricLockEnabled) return;
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (previousState === "background" && nextState === "active") {
        setIsLocked(true);
      }
      previousState = nextState;
    });
    return () => subscription.remove();
  }, [user, biometricLockEnabled]);

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
    setIsLocked(false);
  }

  async function refreshCoachStatus() {
    if (!token) return;
    const { profile } = await api.getCoachProfile(token);
    setUser((u) => (u ? { ...u, isCoach: profile !== null } : u));
  }

  async function setBiometricLockEnabled(enabled: boolean) {
    await SecureStore.setItemAsync(BIOMETRIC_LOCK_KEY, enabled ? "true" : "false");
    setBiometricLockEnabledState(enabled);
  }

  async function unlock() {
    const success = await authenticateWithBiometrics();
    if (success) setIsLocked(false);
    return success;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isLocked,
        biometricLockEnabled,
        signIn,
        signUp,
        signOut,
        refreshCoachStatus,
        setBiometricLockEnabled,
        unlock,
      }}
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
