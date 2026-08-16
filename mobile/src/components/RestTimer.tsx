import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import {
  cancelNotification,
  ensureNotificationPermissions,
  scheduleRestCompleteNotification,
} from "@/lib/notifications";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function RestTimer({
  duration,
  onDismiss,
}: {
  duration: number;
  onDismiss: () => void;
}) {
  const [remaining, setRemaining] = useState(duration);
  const isDone = remaining <= 0;
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureNotificationPermissions();
      const id = await scheduleRestCompleteNotification(duration);
      if (!cancelled) notificationIdRef.current = id;
    })();
    return () => {
      cancelled = true;
      cancelNotification(notificationIdRef.current);
    };
    // Only schedule once per mount -- the countdown below is purely visual and
    // shouldn't reschedule the notification on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDone) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isDone]);

  useEffect(() => {
    if (!isDone) return;
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [isDone, onDismiss]);

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta));
    cancelNotification(notificationIdRef.current);
    const newRemaining = Math.max(0, remaining + delta);
    scheduleRestCompleteNotification(newRemaining).then((id) => {
      notificationIdRef.current = id;
    });
  }

  function handleDismiss() {
    cancelNotification(notificationIdRef.current);
    onDismiss();
  }

  const progress = Math.min(1, remaining / duration);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.time}>{formatTime(remaining)}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }, isDone && styles.fillDone]} />
          </View>
        </View>

        <View style={styles.middle}>
          <Text style={styles.label}>{isDone ? "Rest complete" : "Resting"}</Text>
          <View style={styles.adjustRow}>
            <TouchableOpacity style={styles.adjustButton} onPress={() => adjust(-15)}>
              <Text style={styles.adjustButtonText}>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustButton} onPress={() => adjust(15)}>
              <Text style={styles.adjustButtonText}>+15s</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  left: { width: 64 },
  time: { color: colors.text, fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
  track: {
    marginTop: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 2, backgroundColor: colors.accent },
  fillDone: { backgroundColor: colors.muted },
  middle: { flex: 1 },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  adjustRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  adjustButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adjustButtonText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  skip: { color: colors.muted, fontSize: 12, fontWeight: "700" },
});
