import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { displayFont } from "@/constants/fonts";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import ShineCard from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const trendStyleMap = {
  up: { border: colors.accent, bg: colors.accentSoft, text: colors.accent },
  down: { border: colors.danger, bg: colors.danger + "1a", text: colors.danger },
  flat: { border: colors.border, bg: colors.surface2, text: colors.muted },
};

function SessionLogRow({ log }: { log: api.SessionLog }) {
  return (
    <ShineCard contentStyle={styles.logRowInner}>
      <View style={styles.logRowTop}>
        <Text style={styles.logDate}>{formatDate(log.date)}</Text>
        <View style={styles.logRowRight}>
          {log.isPR && (
            <View style={styles.prBadge}>
              <Text style={styles.prBadgeText}>PR</Text>
            </View>
          )}
          {log.isWarmup && (
            <View style={styles.warmupBadge}>
              <Text style={styles.warmupBadgeText}>Warm-up</Text>
            </View>
          )}
          <Text style={styles.logStats}>
            {log.weight} kg × {log.sets} × {log.reps}
          </Text>
          {log.rir != null && <Text style={styles.rir}>RIR {log.rir}</Text>}
        </View>
      </View>
      {log.notes && <Text style={styles.notes}>{log.notes}</Text>}
    </ShineCard>
  );
}

export default function ExerciseHistoryScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const [data, setData] = useState<api.ExerciseHistoryResponse | null>(null);

  const load = useCallback(async () => {
    if (!token || !exerciseId) return;
    const result = await api.getExerciseHistory(token, exerciseId);
    setData(result);
  }, [token, exerciseId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  if (!data) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} History</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>
          {muscleGroupLabels[data.exercise.muscleGroup] ?? data.exercise.muscleGroup}
        </Text>
        <Text style={styles.title}>{data.exercise.name}</Text>
      </View>

      {data.sessions.length === 0 ? (
        <Text style={styles.emptyText}>No sets logged for this exercise yet.</Text>
      ) : (
        <>
          <FadeIn>
            <ShineCard contentStyle={styles.prCardInner}>
              <View>
                <Text style={styles.prLabel}>Personal Record</Text>
                <Text style={styles.prValue}>{data.prWeight != null ? `${data.prWeight} kg` : "—"}</Text>
              </View>
              {data.prDate && <Text style={styles.prDate}>{formatDate(data.prDate)}</Text>}
            </ShineCard>
          </FadeIn>

          <Text style={styles.sectionLabel}>All Sessions</Text>
          {data.sessions.map((session, index) => {
            const trendStyle = session.trend ? trendStyleMap[session.trend] : null;
            return (
              <FadeIn key={session.key} delay={60 + index * 30}>
                <View style={styles.session}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                    <View style={styles.sessionHeaderRight}>
                      <Text style={styles.sessionVolume}>
                        Vol {Math.round(session.volume).toLocaleString("en-US")} kg
                      </Text>
                      {trendStyle && session.delta != null && (
                        <View
                          style={[
                            styles.trendBadge,
                            { borderColor: trendStyle.border, backgroundColor: trendStyle.bg },
                          ]}
                        >
                          <Text style={[styles.trendBadgeText, { color: trendStyle.text }]}>
                            {session.trend === "up"
                              ? `Progressed +${session.delta.toFixed(0)}%`
                              : session.trend === "down"
                                ? `Regressed ${session.delta.toFixed(0)}%`
                                : "Same"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {session.logs.map((log) => (
                    <SessionLogRow key={log.id} log={log} />
                  ))}
                </View>
              </FadeIn>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 12 },
  header: {},
  back: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 10,
  },
  title: { color: colors.text, fontFamily: displayFont, fontSize: 34, letterSpacing: 0.5 },
  emptyText: { color: colors.muted, fontSize: 13, marginTop: 16 },
  prCardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  prLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  prValue: { color: colors.text, fontFamily: displayFont, fontSize: 28, marginTop: 2 },
  prDate: { color: colors.muted, fontSize: 12 },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 8,
  },
  session: { gap: 6 },
  sessionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sessionDate: { color: colors.muted, fontSize: 12 },
  sessionHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  sessionVolume: { color: colors.muted, fontSize: 11 },
  trendBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  trendBadgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  logRowInner: { padding: 12 },
  logRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  logDate: { color: colors.muted, fontSize: 12 },
  logRowRight: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  prBadge: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prBadgeText: { color: colors.accent, fontSize: 9, fontWeight: "800" },
  warmupBadge: {
    borderWidth: 1,
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlueSoft,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  warmupBadgeText: { color: colors.accentBlue, fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  logStats: { color: colors.text, fontSize: 13, fontWeight: "600" },
  rir: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  notes: { color: colors.muted, fontSize: 12, marginTop: 6, lineHeight: 16 },
});
