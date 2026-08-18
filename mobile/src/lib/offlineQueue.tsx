import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import * as api from "@/lib/api";

const QUEUE_KEY = "gym-tracker-offline-queue";

export type QueuedLog = {
  localId: string;
  userId: string;
  input: api.LogSetInput;
  queuedAt: number;
};

type OfflineQueueContextValue = {
  isOnline: boolean;
  pending: QueuedLog[];
  enqueue: (input: api.LogSetInput) => Promise<void>;
};

const OfflineQueueContext = createContext<OfflineQueueContextValue | null>(null);

export function OfflineQueueProvider({
  token,
  userId,
  children,
}: {
  token: string | null;
  userId: string | null;
  children: ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState<QueuedLog[]>([]);
  const pendingRef = useRef<QueuedLog[]>([]);
  const tokenRef = useRef(token);
  const userIdRef = useRef(userId);
  const flushingRef = useRef(false);
  tokenRef.current = token;
  userIdRef.current = userId;

  function updatePending(next: QueuedLog[]) {
    pendingRef.current = next;
    setPending(next);
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next)).catch(() => {});
  }

  useEffect(() => {
    AsyncStorage.getItem(QUEUE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as QueuedLog[];
        pendingRef.current = parsed;
        setPending(parsed);
      } catch {
        // Corrupt cache -- drop it rather than getting stuck retrying garbage.
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline((prev) => {
        if (!prev && online) flush();
        return online;
      });
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    // Safety net: the reconnect/mount triggers above only fire flush() once.
    // If that attempt fails for a transient reason (e.g. DNS/routing not yet
    // back up right after leaving airplane mode), nothing else retries it, so
    // the queue -- and the "Syncing..." banner -- would get stuck forever.
    if (!isOnline || pending.length === 0) return;
    const id = setTimeout(() => flush(), 4000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pending]);

  async function flush() {
    if (flushingRef.current || !tokenRef.current) return;
    flushingRef.current = true;
    try {
      while (pendingRef.current.length > 0) {
        const [next, ...rest] = pendingRef.current;
        // Only sync items queued under the account that's currently signed in --
        // otherwise a second user on the same device could sync the first
        // user's queued sets onto their own account.
        if (next.userId !== userIdRef.current) break;
        try {
          await api.logSet(tokenRef.current, next.input);
          updatePending(rest);
        } catch (e) {
          if (e instanceof api.ApiError) {
            // The server explicitly rejected this -- drop it, retrying won't help.
            updatePending(rest);
            continue;
          }
          break; // Network failure -- stop and retry on the next reconnect.
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }

  async function enqueue(input: api.LogSetInput) {
    if (!userId) return;
    const item: QueuedLog = {
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      input,
      queuedAt: Date.now(),
    };
    updatePending([...pendingRef.current, item]);
    flush();
  }

  return (
    <OfflineQueueContext.Provider value={{ isOnline, pending, enqueue }}>
      {children}
    </OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue() {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error("useOfflineQueue must be used within OfflineQueueProvider");
  return ctx;
}
