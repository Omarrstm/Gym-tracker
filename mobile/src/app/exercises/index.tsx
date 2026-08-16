import { useCallback, useMemo, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";
import { muscleGroupLabels } from "@/constants/muscleGroups";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

const muscleGroupOrder = Object.keys(muscleGroupLabels);

function BarbellIcon() {
  return <Text style={styles.barbellIcon}>{"\u{1F4AA}"}</Text>;
}

export default function ExerciseLibraryScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<api.ExerciseLibraryEntry[] | null>(null);
  const [prByExercise, setPrByExercise] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | "ALL">("ALL");
  const [selected, setSelected] = useState<api.ExerciseLibraryEntry | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getExerciseLibrary(token);
    setExercises(result.exercises);
    setPrByExercise(result.prByExercise);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    if (!exercises) return [];
    const q = query.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesGroup = activeGroup === "ALL" || ex.muscleGroup === activeGroup;
      const matchesQuery = q === "" || ex.name.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [exercises, query, activeGroup]);

  const sections = useMemo(() => {
    return muscleGroupOrder
      .map((group) => ({ group, exercises: filtered.filter((ex) => ex.muscleGroup === group) }))
      .filter((s) => s.exercises.length > 0);
  }, [filtered]);

  if (!token) return <Redirect href="/" />;

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>{"←"} Home</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>Exercise Library</Text>
          <Text style={styles.title}>Pick Exercise</Text>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setActiveGroup("ALL")}
            style={[styles.filterPill, activeGroup === "ALL" && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, activeGroup === "ALL" && styles.filterPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {muscleGroupOrder.map((group) => (
            <TouchableOpacity
              key={group}
              onPress={() => setActiveGroup(group)}
              style={[styles.filterPill, activeGroup === group && styles.filterPillActive]}
            >
              <Text
                style={[styles.filterPillText, activeGroup === group && styles.filterPillTextActive]}
              >
                {muscleGroupLabels[group]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {exercises === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No exercises match &ldquo;{query}&rdquo;.</Text>
        ) : (
          sections.map((section) => (
            <View key={section.group} style={styles.section}>
              <Text style={styles.sectionLabel}>{muscleGroupLabels[section.group]}</Text>
              {section.exercises.map((ex) => (
                <TouchableOpacity key={ex.id} style={styles.row} onPress={() => setSelected(ex)}>
                  <View style={styles.rowIcon}>
                    <BarbellIcon />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                      {ex.name}
                    </Text>
                    {ex.createdByUserId && <Text style={styles.customLabel}>Custom</Text>}
                  </View>
                  {prByExercise[ex.id] !== undefined && (
                    <Text style={styles.prText}>PR {prByExercise[ex.id]} kg</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            {selected && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalEyebrow}>{muscleGroupLabels[selected.muscleGroup]}</Text>
                  {prByExercise[selected.id] !== undefined && (
                    <Text style={styles.modalPr}>
                      PR <Text style={styles.modalPrValue}>{prByExercise[selected.id]} kg</Text>
                    </Text>
                  )}
                </View>
                <Text style={styles.modalTitle}>{selected.name}</Text>
                {selected.description && <Text style={styles.modalDescription}>{selected.description}</Text>}

                {prByExercise[selected.id] !== undefined ? (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      const id = selected.id;
                      setSelected(null);
                      router.push(`/progress/${id}`);
                    }}
                  >
                    <Text style={styles.modalButtonText}>View Progress</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.modalNoData}>Not logged yet — log a set to start tracking it.</Text>
                )}

                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 4 },
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
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  filterRow: { flexDirection: "row", gap: 8, paddingVertical: 12 },
  filterPill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterPillActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  filterPillText: { color: colors.muted, fontSize: 12.5, fontWeight: "700" },
  filterPillTextActive: { color: colors.accent },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: "center", paddingVertical: 24 },
  section: { marginTop: 12, gap: 8 },
  sectionLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  barbellIcon: { fontSize: 15 },
  exerciseName: { color: colors.text, fontSize: 14.5, fontWeight: "700" },
  customLabel: { color: colors.muted, fontSize: 11, textTransform: "uppercase", marginTop: 2 },
  prText: { color: colors.muted, fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: "#000000b3", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalEyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  modalPr: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  modalPrValue: { color: colors.text, fontWeight: "800" },
  modalTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 4 },
  modalDescription: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 8 },
  modalNoData: { color: colors.muted, fontSize: 13, marginTop: 14 },
  modalButton: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: { color: colors.bg, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
  modalClose: { marginTop: 12, alignItems: "center" },
  modalCloseText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
});
