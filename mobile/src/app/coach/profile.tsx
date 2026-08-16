import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function CoachProfileScreen() {
  const { token, refreshCoachStatus } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<api.CoachProfile | null | undefined>(undefined);
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [regenPending, setRegenPending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const { profile: p } = await api.getCoachProfile(token);
    setProfile(p);
    setBio(p?.bio ?? "");
    setSpecialties(p?.specialties.join(", ") ?? "");
    setIsPublic(p?.isPublic ?? true);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function handleSave() {
    if (!token) return;
    setError(null);
    setStatus(null);
    setPending(true);
    try {
      await api.updateCoachProfile(token, { bio, specialties, isPublic });
      setStatus("Coach profile saved.");
      await load();
      await refreshCoachStatus();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save coach profile.");
    } finally {
      setPending(false);
    }
  }

  async function handleRegenerate() {
    if (!token) return;
    setRegenPending(true);
    try {
      await api.regenerateJoinCode(token);
      await load();
    } finally {
      setRegenPending(false);
    }
  }

  if (profile === undefined) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.accentBlue} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Back</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Coaching</Text>
        <Text style={styles.title}>Coach Profile</Text>
      </View>

      <SubTabs tabs={coachingTabs} active="/coach/profile" />

      {profile && (
        <FadeIn>
          <ShineCard contentStyle={styles.section}>
            <Text style={styles.sectionTitle}>Join Code</Text>
            <Text style={styles.joinCode}>{profile.joinCode}</Text>
            <Text style={styles.hint}>
              Share this code with an athlete — they can enter it on the Coaches page to link with
              you instantly.
            </Text>
            <TouchableOpacity onPress={handleRegenerate} disabled={regenPending}>
              <Text style={styles.regenLink}>
                {regenPending ? "Generating..." : "Generate a new code"}
              </Text>
            </TouchableOpacity>
          </ShineCard>
        </FadeIn>
      )}

      <FadeIn delay={60}>
        <ShineCard contentStyle={styles.section}>
          <Text style={styles.sectionTitle}>{profile ? "Edit Profile" : "Become a Coach"}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder="Tell athletes about your coaching style and experience."
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textArea]}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Specialties (comma-separated)</Text>
            <TextInput
              value={specialties}
              onChangeText={setSpecialties}
              placeholder="Powerlifting, Nutrition, Injury Recovery"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show my profile in the coach directory</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.border, true: colors.accentBlue }}
              thumbColor={colors.text}
            />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          {status && <Text style={styles.success}>{status}</Text>}
          <TouchableOpacity
            style={[styles.saveButton, pending && styles.disabled]}
            onPress={handleSave}
            disabled={pending}
          >
            {pending ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.saveButtonText}>Save Coach Profile</Text>
            )}
          </TouchableOpacity>
        </ShineCard>
      </FadeIn>

      {profile && (
        <TouchableOpacity style={styles.dashboardLink} onPress={() => router.push("/")}>
          <Text style={styles.dashboardLinkText}>Go to Coach Dashboard {"→"}</Text>
        </TouchableOpacity>
      )}
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
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 10,
  },
  title: { color: colors.text, fontFamily: displayFont, fontSize: 36, letterSpacing: 0.5 },
  section: { padding: 16, gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  joinCode: { color: colors.text, fontFamily: displayFont, fontSize: 26, letterSpacing: 2 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  regenLink: { color: colors.accentBlue, fontSize: 12, fontWeight: "700" },
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
  textArea: { height: 90, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { color: colors.text, fontSize: 13, flex: 1, marginRight: 8 },
  error: { color: colors.danger, fontSize: 12 },
  success: { color: colors.accentBlue, fontSize: 12 },
  saveButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  saveButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  dashboardLink: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  dashboardLinkText: { color: colors.accentBlue, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
});
