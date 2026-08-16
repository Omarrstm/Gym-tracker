import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
import { displayFont } from "@/constants/fonts";
import { dayLabels, dayOrder } from "@/constants/days";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import ShineCard, { shineCardStyles } from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

function ExercisePickerModal({
  visible,
  dayOfWeek,
  allExercises,
  onClose,
  onAdd,
}: {
  visible: boolean;
  dayOfWeek: string | null;
  allExercises: api.ExerciseCatalogEntry[];
  onClose: () => void;
  onAdd: (exerciseId: string, weight: string, sets: string, reps: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<api.ExerciseCatalogEntry | null>(null);
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = allExercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  function reset() {
    setQuery("");
    setSelected(null);
    setWeight("");
    setSets("");
    setReps("");
    setError(null);
  }

  async function handleAdd() {
    if (!selected) return;
    setPending(true);
    setError(null);
    try {
      await onAdd(selected.id, weight, sets, reps);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't add exercise.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.sheetHeader}>
            <Text style={modalStyles.sheetTitle}>
              Add to {dayOfWeek ? dayLabels[dayOfWeek] : ""}
            </Text>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Text style={modalStyles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          {!selected ? (
            <>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search exercises"
                placeholderTextColor={colors.muted}
                style={modalStyles.search}
              />
              <ScrollView style={{ maxHeight: 320 }}>
                {filtered.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    style={modalStyles.exerciseRow}
                    onPress={() => setSelected(ex)}
                  >
                    <Text style={modalStyles.exerciseRowName}>{ex.name}</Text>
                    <Text style={modalStyles.exerciseRowMuscle}>{ex.muscleGroup}</Text>
                  </TouchableOpacity>
                ))}
                {filtered.length === 0 && (
                  <Text style={modalStyles.noResults}>No exercises match.</Text>
                )}
              </ScrollView>
            </>
          ) : (
            <>
              <Text style={modalStyles.selectedName}>{selected.name}</Text>
              <View style={modalStyles.targetRow}>
                <View style={modalStyles.targetField}>
                  <Text style={modalStyles.label}>Weight</Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    style={modalStyles.smallInput}
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={modalStyles.targetField}>
                  <Text style={modalStyles.label}>Sets</Text>
                  <TextInput
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="number-pad"
                    style={modalStyles.smallInput}
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={modalStyles.targetField}>
                  <Text style={modalStyles.label}>Reps</Text>
                  <TextInput
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    style={modalStyles.smallInput}
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>
              {error && <Text style={modalStyles.error}>{error}</Text>}
              <View style={modalStyles.confirmActions}>
                <TouchableOpacity
                  style={[modalStyles.addButton, pending && { opacity: 0.6 }]}
                  onPress={handleAdd}
                  disabled={pending}
                >
                  {pending ? (
                    <ActivityIndicator color={colors.bg} />
                  ) : (
                    <Text style={modalStyles.addButtonText}>Add Exercise</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={modalStyles.backLink}>Choose a different exercise</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ProgramDetailScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<api.ProgramDetailResponse | null>(null);
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !id) return;
    const result = await api.getProgramDetail(token, id);
    setDetail(result);
  }, [token, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function handleAddExercise(
    exerciseId: string,
    weight: string,
    sets: string,
    reps: string
  ) {
    if (!token || !id || !pickerDay) return;
    await api.addProgramExercise(token, id, {
      dayOfWeek: pickerDay,
      exerciseId,
      weight: weight ? Number(weight) : null,
      sets: sets ? Number(sets) : null,
      reps: reps ? Number(reps) : null,
    });
    await load();
  }

  async function handleRemove(programExerciseId: string) {
    if (!token) return;
    setBusyId(programExerciseId);
    try {
      await api.removeProgramExercise(token, programExerciseId);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (!detail) {
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
          <Text style={styles.back}>{"←"} Programs</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{detail.program.name}</Text>
          {detail.program.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
      </View>

      {dayOrder.map((day, dayIndex) => {
        const dayData = detail.days.find((d) => d.dayOfWeek === day);
        const exercises = dayData?.exercises ?? [];
        return (
          <FadeIn key={day} delay={dayIndex * 30}>
            <ShineCard contentStyle={shineCardStyles.padded}>
              <Text style={styles.dayLabel}>{dayLabels[day]}</Text>
              {exercises.length === 0 ? (
                <Text style={styles.noExercises}>Rest day</Text>
              ) : (
                exercises.map((ex) => (
                  <View key={ex.id} style={styles.exerciseRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                      <Text style={styles.exerciseTarget}>
                        {ex.targetWeight != null && ex.targetSets != null && ex.targetReps != null
                          ? `${ex.targetWeight} kg × ${ex.targetSets} × ${ex.targetReps}`
                          : "No target set"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemove(ex.id)} disabled={busyId === ex.id}>
                      <Text style={styles.removeLink}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setPickerDay(day)}>
                <Text style={styles.addExerciseText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </ShineCard>
          </FadeIn>
        );
      })}

      <ExercisePickerModal
        visible={pickerDay !== null}
        dayOfWeek={pickerDay}
        allExercises={detail.allExercises}
        onClose={() => setPickerDay(null)}
        onAdd={handleAddExercise}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
  header: { marginBottom: 8 },
  back: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  title: { color: colors.text, fontFamily: displayFont, fontSize: 32, letterSpacing: 0.5 },
  activeBadge: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { color: colors.accent, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  dayLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  noExercises: { color: colors.muted, fontSize: 13, fontStyle: "italic" },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    gap: 8,
  },
  exerciseName: { color: colors.text, fontSize: 14, fontWeight: "600" },
  exerciseTarget: { color: colors.muted, fontSize: 12, marginTop: 2 },
  removeLink: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  addExerciseButton: { marginTop: 10, alignSelf: "flex-start" },
  addExerciseText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#00000099", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  close: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseRowName: { color: colors.text, fontSize: 14, fontWeight: "600" },
  exerciseRowMuscle: { color: colors.muted, fontSize: 11, textTransform: "uppercase" },
  noResults: { color: colors.muted, fontSize: 13, textAlign: "center", paddingVertical: 20 },
  selectedName: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 12 },
  targetRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  targetField: { flex: 1 },
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
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 12, marginBottom: 8 },
  confirmActions: { gap: 10, alignItems: "center" },
  addButton: {
    alignSelf: "stretch",
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: { color: colors.bg, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
  backLink: { color: colors.muted, fontSize: 12, fontWeight: "600" },
});
