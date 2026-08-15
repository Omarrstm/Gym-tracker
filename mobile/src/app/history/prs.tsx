import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

export default function AllPRsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [prs, setPrs] = useState<api.PRRow[] | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const { prs: result } = await api.getAllPRs(token);
    setPrs(result);
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
          <Text style={styles.back}>{"←"} History</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>All PRs</Text>
      </View>

      {prs === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : prs.length === 0 ? (
        <Text style={styles.emptyText}>No personal records yet.</Text>
      ) : (
        prs.map((pr) => (
          <TouchableOpacity
            key={pr.exerciseId}
            style={styles.row}
            onPress={() => router.push(`/history/${pr.exerciseId}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {pr.name}
              </Text>
              <Text style={styles.muscleGroup}>
                {muscleGroupLabels[pr.muscleGroup] ?? pr.muscleGroup}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.weight}>{pr.weight} kg</Text>
              <Text style={styles.date}>
                {new Date(pr.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 8 },
  header: { marginBottom: 8 },
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
  emptyText: { color: colors.muted, fontSize: 13 },
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
  name: { color: colors.text, fontSize: 14, fontWeight: "700" },
  muscleGroup: { color: colors.muted, fontSize: 11, textTransform: "uppercase", marginTop: 2 },
  weight: { color: colors.text, fontSize: 18, fontWeight: "800" },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
