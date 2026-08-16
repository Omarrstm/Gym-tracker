import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { formatVolume, muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import SubTabs from "@/components/SubTabs";

const progressTabs = [
  { href: "/stats" as const, label: "Overview" },
  { href: "/history" as const, label: "History" },
  { href: "/progress" as const, label: "Exercises" },
];

const dayInitials = ["S", "M", "T", "W", "T", "F", "S"];

const levelColor: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: colors.surface2,
  1: colors.accent + "33",
  2: colors.accent + "66",
  3: colors.accent + "b3",
  4: colors.accent,
};

export default function StatsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<api.StatsResponse | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getStats(token);
    setData(result);
  }, [token]);

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

  const maxMuscleGroupVolume = Math.max(1, ...data.muscleGroupRanking.map((r) => r.volume));

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>Overview</Text>
      </View>

      <SubTabs tabs={progressTabs} active="/stats" />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{data.streak}</Text>
          <Text style={styles.statSub}>{data.streak === 1 ? "day" : "days"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>{formatVolume(data.thisWeekVolume)}</Text>
          <Text style={styles.statSub}>
            {data.weekDelta === null
              ? "volume lifted"
              : `${data.weekDelta >= 0 ? "+" : ""}${data.weekDelta.toFixed(0)}% vs last week`}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consistency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.heatmapRow}>
            <View style={styles.heatmapDayLabels}>
              {dayInitials.map((initial, i) => (
                <Text key={i} style={styles.heatmapDayLabel}>
                  {i % 2 === 1 ? initial : ""}
                </Text>
              ))}
            </View>
            {data.heatmap.map((column, colIndex) => (
              <View key={colIndex} style={styles.heatmapColumn}>
                {column.map((day) => (
                  <View
                    key={day.dateKey}
                    style={[styles.heatmapCell, { backgroundColor: levelColor[day.level] }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Less</Text>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <View key={level} style={[styles.heatmapCell, { backgroundColor: levelColor[level] }]} />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume by Muscle Group</Text>
        <Text style={styles.sectionSub}>Last 30 days</Text>
        {data.muscleGroupRanking.length === 0 ? (
          <Text style={styles.emptyText}>Log some sets to see your training breakdown.</Text>
        ) : (
          data.muscleGroupRanking.map(({ muscleGroup, volume }) => (
            <View key={muscleGroup} style={styles.mgRow}>
              <Text style={styles.mgLabel}>{muscleGroupLabels[muscleGroup] ?? muscleGroup}</Text>
              <View style={styles.mgBarTrack}>
                <View
                  style={[
                    styles.mgBarFill,
                    { width: `${Math.max(4, (volume / maxMuscleGroupVolume) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.mgVolume}>{formatVolume(volume)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 12 },
  header: { marginBottom: 4 },
  back: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 10,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
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
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  sectionSub: { color: colors.muted, fontSize: 11, marginTop: 2, marginBottom: 8 },
  heatmapRow: { flexDirection: "row", gap: 3, marginTop: 10 },
  heatmapDayLabels: { gap: 3, paddingRight: 4 },
  heatmapDayLabel: { width: 11, height: 11, fontSize: 9, lineHeight: 11, color: colors.muted },
  heatmapColumn: { gap: 3 },
  heatmapCell: { width: 11, height: 11, borderRadius: 2 },
  heatmapLegend: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  legendText: { color: colors.muted, fontSize: 11 },
  emptyText: { color: colors.muted, fontSize: 13 },
  mgRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  mgLabel: {
    width: 76,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  mgBarTrack: { flex: 1, height: 8, borderRadius: 999, backgroundColor: colors.surface2, overflow: "hidden" },
  mgBarFill: { height: "100%", borderRadius: 999, backgroundColor: colors.accent },
  mgVolume: { width: 60, textAlign: "right", color: colors.text, fontSize: 12 },
});
