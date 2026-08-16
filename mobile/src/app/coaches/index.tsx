import { useCallback, useMemo, useState } from "react";
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
import { displayFont } from "@/constants/fonts";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import SubTabs from "@/components/SubTabs";
import ShineCard from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

const coachingTabs = [
  { href: "/coaches" as const, label: "Find a Coach" },
  { href: "/coaches/mine" as const, label: "My Coach" },
  { href: "/coach/profile" as const, label: "Become a Coach" },
];

export default function CoachesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [coaches, setCoaches] = useState<api.CoachListing[] | null>(null);
  const [query, setQuery] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeStatus, setCodeStatus] = useState<string | null>(null);
  const [codePending, setCodePending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const { coaches: list } = await api.getCoachDirectory(token);
    setCoaches(list);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    if (!coaches) return [];
    const q = query.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.bio?.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [coaches, query]);

  if (!token) return <Redirect href="/" />;

  async function handleJoinByCode() {
    if (!token || !code.trim()) return;
    setCodeError(null);
    setCodeStatus(null);
    setCodePending(true);
    try {
      await api.joinByCode(token, code.trim());
      setCodeStatus("Linked with your coach!");
      setCode("");
    } catch (e) {
      setCodeError(e instanceof ApiError ? e.message : "Couldn't join with that code.");
    } finally {
      setCodePending(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Coaching</Text>
        <Text style={styles.title}>Find a Coach</Text>
      </View>

      <SubTabs tabs={coachingTabs} active="/coaches" />

      <FadeIn>
        <ShineCard contentStyle={styles.codeSection}>
          <Text style={styles.label}>Have a Join Code?</Text>
          <View style={styles.codeRow}>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="ABC123XY"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              style={[styles.joinButton, (!code.trim() || codePending) && styles.disabled]}
              onPress={handleJoinByCode}
              disabled={!code.trim() || codePending}
            >
              {codePending ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>
          {codeError && <Text style={styles.error}>{codeError}</Text>}
          {codeStatus && <Text style={styles.success}>{codeStatus}</Text>}
        </ShineCard>
      </FadeIn>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search coaches or specialties"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      {coaches === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No coaches match your search.</Text>
      ) : (
        filtered.map((coach, index) => (
          <FadeIn key={coach.userId} delay={index * 30}>
            <TouchableOpacity onPress={() => router.push(`/coaches/${coach.userId}`)}>
              <ShineCard contentStyle={styles.coachCardInner}>
                <Text style={styles.coachName}>{coach.name}</Text>
                {coach.bio && (
                  <Text style={styles.coachBio} numberOfLines={2}>
                    {coach.bio}
                  </Text>
                )}
                {coach.specialties.length > 0 && (
                  <View style={styles.tagRow}>
                    {coach.specialties.map((s) => (
                      <View key={s} style={styles.tag}>
                        <Text style={styles.tagText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ShineCard>
            </TouchableOpacity>
          </FadeIn>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
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
  title: { color: colors.text, fontFamily: displayFont, fontSize: 36, letterSpacing: 0.5 },
  codeSection: { padding: 16, gap: 8 },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  codeRow: { flexDirection: "row", gap: 8 },
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
  joinButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  disabled: { opacity: 0.5 },
  error: { color: colors.danger, fontSize: 12 },
  success: { color: colors.accent, fontSize: 12 },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: "center", paddingVertical: 20 },
  coachCardInner: { padding: 14, gap: 6 },
  coachName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  coachBio: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: colors.muted, fontSize: 10.5, fontWeight: "700", textTransform: "uppercase" },
});
