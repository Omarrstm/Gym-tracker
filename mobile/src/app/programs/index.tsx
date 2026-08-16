import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
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
import { displayFont } from "@/constants/fonts";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import ShineCard from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

export default function ProgramsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<api.ProgramSummary[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const { programs: list } = await api.getPrograms(token);
    setPrograms(list);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleCreate() {
    if (!token || newName.trim().length < 2) return;
    setError(null);
    try {
      const { id } = await api.createProgram(token, newName.trim());
      setNewName("");
      setCreating(false);
      await load();
      router.push(`/programs/${id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't create program.");
    }
  }

  async function handleActivate(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await api.activateProgram(token, id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await api.deleteProgram(token, id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Training</Text>
        <Text style={styles.title}>Programs</Text>
      </View>

      {programs === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : (
        <>
          {programs.length === 0 && (
            <Text style={styles.emptyText}>
              You don&rsquo;t have any programs yet. Create one to start planning your week.
            </Text>
          )}

          {programs.map((p, index) => (
            <FadeIn key={p.id} delay={index * 40}>
              <TouchableOpacity
                onPress={() => router.push(`/programs/${p.id}`)}
                disabled={busyId === p.id}
              >
                <ShineCard contentStyle={styles.cardInner}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.programName}>{p.name}</Text>
                    {p.isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.programMeta}>
                    {p.dayCount} {p.dayCount === 1 ? "day" : "days"} &middot; {p.exerciseCount}{" "}
                    {p.exerciseCount === 1 ? "exercise" : "exercises"}
                  </Text>
                  <View style={styles.cardActions}>
                    {!p.isActive && (
                      <TouchableOpacity onPress={() => handleActivate(p.id)} disabled={busyId === p.id}>
                        <Text style={styles.actionLink}>Set Active</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(p.id)} disabled={busyId === p.id}>
                      <Text style={styles.actionLinkDanger}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </ShineCard>
              </TouchableOpacity>
            </FadeIn>
          ))}
        </>
      )}

      {creating ? (
        <View style={styles.createForm}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Program name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.createActions}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCreating(false);
                setError(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.newProgramButton} onPress={() => setCreating(true)}>
          <Text style={styles.newProgramButtonText}>+ New Program</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
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
  title: { color: colors.text, fontFamily: displayFont, fontSize: 36, letterSpacing: 0.5 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  cardInner: { padding: 14 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  programName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  activeBadge: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { color: colors.accent, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  programMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 16, marginTop: 10 },
  actionLink: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  actionLinkDanger: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  createForm: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 10,
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
  createActions: { flexDirection: "row", gap: 8 },
  createButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  createButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.muted, fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  newProgramButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  newProgramButtonText: { color: colors.accent, fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
});
