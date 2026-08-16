import { useCallback, useMemo, useState } from "react";
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { displayFont } from "@/constants/fonts";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import ShineCard, { shineCardStyles } from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const BAR_HEIGHT = 120;
const BAR_WIDTH = 28;

export default function ExerciseProgressScreen() {
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

  const points = useMemo(() => {
    if (!data) return [];
    return [...data.sessions]
      .reverse() // API returns most-recent-first; chart wants chronological
      .map((session) => {
        const working = session.logs.filter((l) => !l.isWarmup);
        if (working.length === 0) return null;
        const top = working.reduce((max, l) => (l.weight > max.weight ? l : max), working[0]);
        return { date: session.date, weight: top.weight, reps: top.reps };
      })
      .filter((p): p is { date: string; weight: number; reps: number } => p !== null);
  }, [data]);

  if (!token) return <Redirect href="/" />;

  if (!data) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const peak = points.length > 0 ? Math.max(...points.map((p) => p.weight)) : 0;
  const latest = points[points.length - 1]?.weight ?? 0;
  const previous = points.length >= 2 ? points[points.length - 2].weight : null;
  const change = previous !== null ? latest - previous : null;
  const maxWeight = Math.max(1, ...points.map((p) => p.weight));

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Progress</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>
          {muscleGroupLabels[data.exercise.muscleGroup] ?? data.exercise.muscleGroup}
        </Text>
        <Text style={styles.title}>{data.exercise.name}</Text>
      </View>

      {points.length === 0 ? (
        <Text style={styles.emptyText}>No sets logged for this exercise yet.</Text>
      ) : (
        <>
          <FadeIn>
            <View style={styles.statsRow}>
              <ShineCard style={styles.statCardOuter} contentStyle={styles.statCardInner}>
                <Text style={styles.statLabel}>Peak</Text>
                <Text style={styles.statValue}>{peak} kg</Text>
              </ShineCard>
              <ShineCard style={styles.statCardOuter} contentStyle={styles.statCardInner}>
                <Text style={styles.statLabel}>Latest</Text>
                <Text style={styles.statValue}>{latest} kg</Text>
              </ShineCard>
              <ShineCard style={styles.statCardOuter} contentStyle={styles.statCardInner}>
                <Text style={styles.statLabel}>Vs Last</Text>
                <Text
                  style={[
                    styles.statValue,
                    change === null ? null : change >= 0 ? styles.statPositive : styles.statNegative,
                  ]}
                >
                  {change === null ? "—" : `${change >= 0 ? "+" : ""}${change} kg`}
                </Text>
              </ShineCard>
            </View>
          </FadeIn>

          <FadeIn delay={60}>
            <ShineCard contentStyle={shineCardStyles.padded}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chart}>
                  {points.map((p, i) => (
                    <View key={i} style={styles.barColumn}>
                      <Text style={styles.barValue}>{p.weight}</Text>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(4, (p.weight / maxWeight) * BAR_HEIGHT) },
                        ]}
                      />
                      <Text style={styles.barDate}>{formatDate(p.date)}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ShineCard>
          </FadeIn>

          <Text style={styles.sectionLabel}>Every Workout</Text>
          {[...points].reverse().map((p, i) => {
            const prevPoint = points[points.length - 1 - i - 1];
            const delta = prevPoint ? p.weight - prevPoint.weight : null;
            return (
              <FadeIn key={p.date} delay={100 + i * 30}>
                <View style={styles.workoutRow}>
                  <Text style={styles.workoutDate}>
                    {new Date(p.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <View style={styles.workoutRight}>
                    <Text style={styles.workoutWeight}>
                      {p.weight} kg × {p.reps}
                    </Text>
                    {delta !== null && (
                      <View
                        style={[
                          styles.deltaBadge,
                          delta > 0 ? styles.deltaUp : delta < 0 ? styles.deltaDown : styles.deltaSame,
                        ]}
                      >
                        <Text
                          style={[
                            styles.deltaBadgeText,
                            delta > 0
                              ? styles.deltaUpText
                              : delta < 0
                                ? styles.deltaDownText
                                : styles.deltaSameText,
                          ]}
                        >
                          {delta > 0 ? `+${delta} kg` : delta < 0 ? `${delta} kg` : "Same"}
                        </Text>
                      </View>
                    )}
                  </View>
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
  statsRow: { flexDirection: "row", gap: 8 },
  statCardOuter: { flex: 1 },
  statCardInner: { padding: 12 },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: { color: colors.text, fontFamily: displayFont, fontSize: 22, marginTop: 4 },
  statPositive: { color: colors.accent },
  statNegative: { color: colors.danger },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 12, height: BAR_HEIGHT + 40 },
  barColumn: { alignItems: "center", justifyContent: "flex-end", width: BAR_WIDTH },
  barValue: { color: colors.muted, fontSize: 10, marginBottom: 4 },
  bar: { width: BAR_WIDTH, borderRadius: 6, backgroundColor: colors.accent },
  barDate: { color: colors.muted, fontSize: 9, marginTop: 6 },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 8,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  workoutDate: { color: colors.muted, fontSize: 12 },
  workoutRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  workoutWeight: { color: colors.text, fontSize: 13, fontWeight: "700" },
  deltaBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  deltaUp: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  deltaDown: { borderColor: colors.danger, backgroundColor: colors.danger + "1a" },
  deltaSame: { borderColor: colors.border, backgroundColor: colors.surface },
  deltaBadgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  deltaUpText: { color: colors.accent },
  deltaDownText: { color: colors.danger },
  deltaSameText: { color: colors.muted },
});
