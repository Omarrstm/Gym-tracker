import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { displayFont } from "@/constants/fonts";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import SubTabs from "@/components/SubTabs";
import ShineCard from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

const progressTabs = [
  { href: "/stats" as const, label: "Overview" },
  { href: "/history" as const, label: "History" },
  { href: "/progress" as const, label: "Exercises" },
];

export default function HistoryScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<api.HistoryGroup[] | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const { groups: result } = await api.getHistory(token);
    setGroups(result);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>History</Text>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={() => router.push("/history/prs")}>
            <Text style={styles.headerLink}>All PRs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SubTabs tabs={progressTabs} active="/history" />

      {groups === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : groups.length === 0 ? (
        <Text style={styles.emptyText}>Nothing logged yet.</Text>
      ) : (
        groups.map((group, groupIndex) => (
          <FadeIn key={group.label} delay={groupIndex * 40}>
            <View style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.logs.map((log) => (
                <TouchableOpacity
                  key={log.id}
                  onPress={() => router.push(`/history/${log.exercise.id}`)}
                >
                  <ShineCard contentStyle={styles.logRowInner}>
                    <View style={styles.rowIcon}>
                      <Text style={styles.rowIconText}>{"\u{1F4AA}"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName} numberOfLines={1}>
                        {log.exercise.name}
                      </Text>
                      <Text style={styles.muscleGroup}>
                        {muscleGroupLabels[log.exercise.muscleGroup] ?? log.exercise.muscleGroup}
                      </Text>
                    </View>
                    <View style={styles.logMeta}>
                      {log.isWarmup && (
                        <View style={styles.warmupBadge}>
                          <Text style={styles.warmupBadgeText}>Warm-up</Text>
                        </View>
                      )}
                      <Text style={styles.logStats}>
                        {log.weight} kg × {log.sets} × {log.reps}
                      </Text>
                    </View>
                  </ShineCard>
                </TouchableOpacity>
              ))}
            </View>
          </FadeIn>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 16 },
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
  title: { color: colors.text, fontFamily: displayFont, fontSize: 36, letterSpacing: 0.5 },
  headerLinks: { flexDirection: "row", gap: 16, marginTop: 10 },
  headerLink: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  emptyText: { color: colors.muted, fontSize: 13 },
  group: { gap: 8 },
  groupLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  logRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    gap: 10,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconText: { fontSize: 15 },
  exerciseName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  muscleGroup: { color: colors.muted, fontSize: 11, textTransform: "uppercase", marginTop: 2 },
  logMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  warmupBadge: {
    borderWidth: 1,
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlueSoft,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  warmupBadgeText: { color: colors.accentBlue, fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  logStats: { color: colors.muted, fontSize: 12 },
});
