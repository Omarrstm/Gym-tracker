import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import SubTabs from "@/components/SubTabs";

const progressTabs = [
  { href: "/stats" as const, label: "Overview" },
  { href: "/history" as const, label: "History" },
  { href: "/progress" as const, label: "Exercises" },
];

export default function ProgressIndexScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<api.ProgressExercise[] | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const { exercises: result } = await api.getProgressExercises(token);
    setExercises(result);
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
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.subtitle}>
          Pick an exercise to see how the weight you&rsquo;re lifting has moved between workouts.
        </Text>
      </View>

      <SubTabs tabs={progressTabs} active="/progress" />

      {exercises === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : exercises.length === 0 ? (
        <Text style={styles.emptyText}>
          No exercises logged yet — log a few sets to start tracking progress.
        </Text>
      ) : (
        <View style={styles.list}>
          {exercises.map((ex) => (
            <TouchableOpacity
              key={ex.exerciseId}
              style={styles.row}
              onPress={() => router.push(`/progress/${ex.exerciseId}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={styles.muscleGroup}>
                  {muscleGroupLabels[ex.muscleGroup] ?? ex.muscleGroup}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.sessionCount}>
                  {ex.sessionCount} {ex.sessionCount === 1 ? "workout" : "workouts"}
                </Text>
                <Text style={styles.lastDate}>
                  Last{" "}
                  {new Date(ex.lastDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  emptyText: { color: colors.muted, fontSize: 13 },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  exerciseName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  muscleGroup: { color: colors.muted, fontSize: 11, textTransform: "uppercase", marginTop: 2 },
  sessionCount: { color: colors.text, fontSize: 13, fontWeight: "700" },
  lastDate: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
