import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
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

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "decimal-pad" | "number-pad" | "default";
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { token, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<api.ProfileResponse | null>(null);

  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [namePending, setNamePending] = useState(false);

  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<"MALE" | "FEMALE" | null>(null);
  const [bodyStatsError, setBodyStatsError] = useState<string | null>(null);
  const [bodyStatsStatus, setBodyStatsStatus] = useState<string | null>(null);
  const [bodyStatsPending, setBodyStatsPending] = useState(false);

  const [restTimer, setRestTimer] = useState("");
  const [restTimerError, setRestTimerError] = useState<string | null>(null);
  const [restTimerStatus, setRestTimerStatus] = useState<string | null>(null);
  const [restTimerPending, setRestTimerPending] = useState(false);

  const [newWeight, setNewWeight] = useState("");
  const [weightLogError, setWeightLogError] = useState<string | null>(null);
  const [weightLogPending, setWeightLogPending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getProfile(token);
    setData(result);
    setName(result.user.name ?? "");
    setHeightCm(result.user.heightCm != null ? String(result.user.heightCm) : "");
    setWeightKg(result.user.weightKg != null ? String(result.user.weightKg) : "");
    setDateOfBirth(result.user.dateOfBirth ? result.user.dateOfBirth.slice(0, 10) : "");
    setSex(result.user.sex);
    setRestTimer(String(result.user.restTimerSeconds));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function handleSaveName() {
    if (!token) return;
    setNameError(null);
    setNameStatus(null);
    setNamePending(true);
    try {
      await api.updateName(token, name);
      setNameStatus("Name updated.");
    } catch (e) {
      setNameError(e instanceof ApiError ? e.message : "Couldn't save name.");
    } finally {
      setNamePending(false);
    }
  }

  async function handleSaveBodyStats() {
    if (!token || !sex) return;
    setBodyStatsError(null);
    setBodyStatsStatus(null);
    setBodyStatsPending(true);
    try {
      await api.updateBodyStats(token, {
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        dateOfBirth,
        sex,
      });
      setBodyStatsStatus("Body stats updated.");
      await load();
    } catch (e) {
      setBodyStatsError(e instanceof ApiError ? e.message : "Couldn't save body stats.");
    } finally {
      setBodyStatsPending(false);
    }
  }

  async function handleSaveRestTimer() {
    if (!token) return;
    setRestTimerError(null);
    setRestTimerStatus(null);
    setRestTimerPending(true);
    try {
      await api.updateRestTimer(token, Number(restTimer));
      setRestTimerStatus("Rest timer updated.");
    } catch (e) {
      setRestTimerError(e instanceof ApiError ? e.message : "Couldn't save rest timer.");
    } finally {
      setRestTimerPending(false);
    }
  }

  async function handleLogWeight() {
    if (!token || !newWeight) return;
    setWeightLogError(null);
    setWeightLogPending(true);
    try {
      await api.logBodyWeight(token, Number(newWeight));
      setNewWeight("");
      await load();
    } catch (e) {
      setWeightLogError(e instanceof ApiError ? e.message : "Couldn't log weight.");
    } finally {
      setWeightLogPending(false);
    }
  }

  async function handleDeleteLog(logId: string) {
    if (!token) return;
    await api.deleteBodyWeightLog(token, logId);
    await load();
  }

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
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>{data.user.email}</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Section title="Account">
        <Field label="Name" value={name} onChangeText={setName} />
        {nameError && <Text style={styles.error}>{nameError}</Text>}
        {nameStatus && <Text style={styles.success}>{nameStatus}</Text>}
        <TouchableOpacity
          style={[styles.saveButton, namePending && styles.saveButtonDisabled]}
          onPress={handleSaveName}
          disabled={namePending}
        >
          {namePending ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </Section>

      <Section title="Body Stats">
        {data.bmi != null && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>{data.bmi.toFixed(1)}</Text>
              <Text style={styles.statSub}>{data.bmiCategory}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>BMR</Text>
              <Text style={styles.statValue}>{Math.round(data.bmr!)}</Text>
              <Text style={styles.statSub}>kcal / day at rest</Text>
            </View>
          </View>
        )}

        <Field label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" />
        <Field label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
        <Field
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
        />
        <View style={styles.field}>
          <Text style={styles.label}>Sex</Text>
          <View style={styles.sexRow}>
            <TouchableOpacity
              style={[styles.sexButton, sex === "MALE" && styles.sexButtonActive]}
              onPress={() => setSex("MALE")}
            >
              <Text style={[styles.sexButtonText, sex === "MALE" && styles.sexButtonTextActive]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexButton, sex === "FEMALE" && styles.sexButtonActive]}
              onPress={() => setSex("FEMALE")}
            >
              <Text style={[styles.sexButtonText, sex === "FEMALE" && styles.sexButtonTextActive]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {bodyStatsError && <Text style={styles.error}>{bodyStatsError}</Text>}
        {bodyStatsStatus && <Text style={styles.success}>{bodyStatsStatus}</Text>}
        <TouchableOpacity
          style={[styles.saveButton, bodyStatsPending && styles.saveButtonDisabled]}
          onPress={handleSaveBodyStats}
          disabled={bodyStatsPending}
        >
          {bodyStatsPending ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </Section>

      <Section title="Rest Timer">
        <Field
          label="Default Rest (seconds)"
          value={restTimer}
          onChangeText={setRestTimer}
          keyboardType="number-pad"
        />
        {restTimerError && <Text style={styles.error}>{restTimerError}</Text>}
        {restTimerStatus && <Text style={styles.success}>{restTimerStatus}</Text>}
        <TouchableOpacity
          style={[styles.saveButton, restTimerPending && styles.saveButtonDisabled]}
          onPress={handleSaveRestTimer}
          disabled={restTimerPending}
        >
          {restTimerPending ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </Section>

      <Section title="Weight History">
        {data.bodyWeightLogs.length === 0 ? (
          <Text style={styles.emptyText}>No weight logged yet.</Text>
        ) : (
          [...data.bodyWeightLogs].reverse().map((log) => (
            <View key={log.id} style={styles.weightRow}>
              <Text style={styles.weightDate}>
                {new Date(log.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <View style={styles.weightRowRight}>
                <Text style={styles.weightValue}>{log.weightKg} kg</Text>
                <TouchableOpacity onPress={() => handleDeleteLog(log.id)}>
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.quickLogRow}>
          <TextInput
            value={newWeight}
            onChangeText={setNewWeight}
            keyboardType="decimal-pad"
            placeholder="Log weight (kg)"
            placeholderTextColor={colors.muted}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            style={[styles.logButton, (!newWeight || weightLogPending) && styles.saveButtonDisabled]}
            onPress={handleLogWeight}
            disabled={!newWeight || weightLogPending}
          >
            <Text style={styles.saveButtonText}>Log</Text>
          </TouchableOpacity>
        </View>
        {weightLogError && <Text style={styles.error}>{weightLogError}</Text>}
      </Section>

      <TouchableOpacity onPress={signOut} style={styles.logOutRow}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>
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
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  field: { gap: 4 },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 12 },
  success: { color: colors.accent, fontSize: 12 },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 2 },
  statSub: { color: colors.accent, fontSize: 11, marginTop: 2 },
  sexRow: { flexDirection: "row", gap: 8 },
  sexButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  sexButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  sexButtonText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  sexButtonTextActive: { color: colors.accent },
  emptyText: { color: colors.muted, fontSize: 13 },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  weightDate: { color: colors.muted, fontSize: 13 },
  weightRowRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightValue: { color: colors.text, fontSize: 14, fontWeight: "700" },
  deleteLink: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  quickLogRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  logButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  logOutRow: { alignItems: "center", paddingVertical: 12 },
  logOutText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
});
