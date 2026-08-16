import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import RestTimer from "@/components/RestTimer";

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)} kg`;
}

function SetDots({ done, target }: { done: number; target: number }) {
  return (
    <View style={styles.setDots}>
      {Array.from({ length: target }).map((_, i) => (
        <View key={i} style={[styles.setDot, i < done && styles.setDotFilled]} />
      ))}
    </View>
  );
}

function LogSetRow({
  item,
  token,
  onLogged,
}: {
  item: api.TodayItem;
  token: string;
  onLogged: (isNewPR: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(item.targetWeight != null ? String(item.targetWeight) : "");
  const [reps, setReps] = useState(item.targetReps != null ? String(item.targetReps) : "");
  const [isWarmup, setIsWarmup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const target = item.targetSets;
  const doneSets = item.workingSetsLoggedToday;
  const isComplete = target != null && doneSets >= target;
  const nextSetNumber = doneSets + 1;

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      const result = await api.logSet(token, {
        exerciseId: item.exercise.id,
        weight: Number(weight),
        sets: 1,
        reps: Number(reps),
        isWarmup,
      });
      setOpen(false);
      setIsWarmup(false);
      onLogged(result.isNewPR);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't log this set.");
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setOpen((v) => !v)}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.exerciseName}>{item.exercise.name}</Text>
          {target != null ? (
            <View style={styles.targetRow}>
              <Text style={styles.exerciseTarget}>
                {doneSets}/{target} sets
              </Text>
              <SetDots done={doneSets} target={target} />
            </View>
          ) : (
            <Text style={styles.exerciseTarget}>
              {doneSets > 0 ? `${doneSets} logged` : "No target set"}
            </Text>
          )}
        </View>
        {(isComplete || (target == null && doneSets > 0)) && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.logForm}>
          <Text style={styles.loggingLabel}>
            {isComplete
              ? "Target complete — logging an extra set"
              : target != null
                ? `Logging set ${nextSetNumber} of ${target}`
                : `Logging set ${nextSetNumber}`}
          </Text>
          <View style={styles.logInputsRow}>
            <View style={styles.logInputField}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.smallInput}
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={styles.logInputField}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                style={styles.smallInput}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.warmupToggle, isWarmup && styles.warmupToggleActive]}
            onPress={() => setIsWarmup((v) => !v)}
          >
            <Text style={[styles.warmupToggleText, isWarmup && styles.warmupToggleTextActive]}>
              {isWarmup ? "Warm-up set" : "Mark as warm-up"}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={[styles.logButton, (!weight || !reps || pending) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!weight || !reps || pending}
          >
            {pending ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.logButtonText}>
                {isComplete
                  ? "Log Extra Set"
                  : target != null
                    ? `Log Set ${nextSetNumber} of ${target}`
                    : `Log Set ${nextSetNumber}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { token, user, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<api.TodayResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [prBanner, setPrBanner] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getToday(token);
    setData(result);
  }, [token]);

  useEffect(() => {
    // Initial data fetch on mount -- setData happens after the await inside
    // load(), not synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function handleLogged(isNewPR: boolean) {
    load();
    setRestStartedAt(Date.now());
    if (isNewPR) {
      setPrBanner(true);
      setTimeout(() => setPrBanner(false), 2500);
    }
  }

  if (!data) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <View>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{data.todayLabel}</Text>
          </View>
          <Text style={styles.title}>
            Welcome back,{"\n"}
            <Text style={styles.titleAccent}>{(user?.name ?? "there").split(" ")[0]}</Text>
          </Text>
        </View>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={() => router.push("/programs")}>
            <Text style={styles.headerLink}>Programs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/stats")}>
            <Text style={styles.headerLink}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/coaches")}>
            <Text style={styles.headerLink}>Coaching</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.headerLink}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.headerLink}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {prBanner && (
        <View style={styles.prBanner}>
          <Text style={styles.prBannerText}>New PR!</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{data.streak}</Text>
          <Text style={styles.statSub}>{data.streak === 1 ? "day" : "days"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>{formatVolume(data.thisWeekVolume)}</Text>
          <Text style={styles.statSub}>volume lifted</Text>
        </View>
      </View>

      {data.program && (
        <TouchableOpacity
          style={styles.programCard}
          onPress={() => router.push(`/programs/${data.program!.id}`)}
        >
          <View>
            <Text style={styles.programCardLabel}>Active Program</Text>
            <Text style={styles.programCardName}>{data.program.name}</Text>
          </View>
          <Text style={styles.programCardArrow}>{"→"}</Text>
        </TouchableOpacity>
      )}

      {!data.program && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            You don&rsquo;t have an active program yet. Build one to see your daily workout here.
          </Text>
          <TouchableOpacity onPress={() => router.push("/programs")}>
            <Text style={styles.emptyCardLink}>Create a Program {"→"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {data.program && data.items.length === 0 && (
        <View style={styles.emptyCard}>
          {data.programDay?.notes && <Text style={styles.dayNote}>{data.programDay.notes}</Text>}
          <Text style={styles.emptyText}>Rest day — nothing scheduled for today.</Text>
        </View>
      )}

      {data.items.map((item) => (
        <LogSetRow key={item.id} item={item} token={token!} onLogged={handleLogged} />
      ))}
    </ScrollView>
    {restStartedAt !== null && (
      <RestTimer
        key={restStartedAt}
        duration={user?.restTimerSeconds ?? 90}
        onDismiss={() => setRestStartedAt(null)}
      />
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accent + "66",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 10, lineHeight: 32 },
  titleAccent: { color: colors.accent },
  headerLinks: { alignItems: "flex-end", gap: 10, marginTop: 6 },
  headerLink: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  prBanner: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  prBannerText: { color: colors.bg, fontWeight: "800", textTransform: "uppercase", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 4 },
  statSub: { color: colors.accent, fontSize: 12, marginTop: 2 },
  programCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 14,
  },
  programCardLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  programCardName: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 2 },
  programCardArrow: { color: colors.accent, fontSize: 16, fontWeight: "700" },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  emptyCardLink: { color: colors.accent, fontSize: 13, fontWeight: "700", marginTop: 8 },
  dayNote: {
    color: colors.accent,
    fontSize: 13,
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeaderText: { flex: 1 },
  exerciseName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  exerciseTarget: { color: colors.muted, fontSize: 12, marginTop: 2 },
  targetRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  setDots: { flexDirection: "row", gap: 4 },
  setDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setDotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkBadge: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  checkBadgeText: { color: colors.bg, fontSize: 11, fontWeight: "800" },
  logForm: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 10,
  },
  loggingLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  logInputsRow: { flexDirection: "row", gap: 8 },
  logInputField: { flex: 1 },
  warmupToggle: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  warmupToggleActive: { borderColor: colors.accentBlue, backgroundColor: colors.accentBlueSoft },
  warmupToggleText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  warmupToggleTextActive: { color: colors.accentBlue },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 12 },
  logButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.5 },
  logButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
});
