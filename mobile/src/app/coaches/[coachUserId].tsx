import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";

function yearRange(startYear: number | null, endYear: number | null) {
  if (!startYear && !endYear) return null;
  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (startYear) return `${startYear}–Present`;
  return `${endYear}`;
}

export default function CoachDetailScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { coachUserId } = useLocalSearchParams<{ coachUserId: string }>();
  const [data, setData] = useState<api.CoachDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!token || !coachUserId) return;
    const result = await api.getCoachDetail(token, coachUserId);
    setData(result);
  }, [token, coachUserId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function handleRequest() {
    if (!token || !coachUserId) return;
    setError(null);
    setPending(true);
    try {
      await api.requestCoach(token, coachUserId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send request.");
    } finally {
      setPending(false);
    }
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
          <Text style={styles.back}>{"←"} Back</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Coach</Text>
        <Text style={styles.title}>{data.coach.name}</Text>
      </View>

      <View style={styles.section}>
        {data.coach.bio && <Text style={styles.bio}>{data.coach.bio}</Text>}
        {data.coach.specialties.length > 0 && (
          <View style={styles.tagRow}>
            {data.coach.specialties.map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {data.coach.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.coach.experiences.map((exp) => {
            const range = yearRange(exp.startYear, exp.endYear);
            return (
              <View key={exp.id} style={styles.expEntry}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                {exp.organization && <Text style={styles.expOrg}>{exp.organization}</Text>}
                {range && <Text style={styles.expRange}>{range}</Text>}
                {exp.description && <Text style={styles.expDesc}>{exp.description}</Text>}
              </View>
            );
          })}
        </View>
      )}

      {!data.isSelf && (
        <>
          {error && <Text style={styles.error}>{error}</Text>}
          {data.linkStatus === "NONE" || data.linkStatus === "DECLINED" || data.linkStatus === "REVOKED" ? (
            <TouchableOpacity
              style={[styles.requestButton, pending && styles.disabled]}
              onPress={handleRequest}
              disabled={pending}
            >
              {pending ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.requestButtonText}>Request to Join</Text>
              )}
            </TouchableOpacity>
          ) : data.linkStatus === "PENDING" ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerText}>Request pending</Text>
            </View>
          ) : (
            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerText}>You&rsquo;re linked with this coach</Text>
            </View>
          )}
        </>
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
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 10,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  bio: { color: colors.text, fontSize: 14, lineHeight: 20 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: colors.muted, fontSize: 10.5, fontWeight: "700", textTransform: "uppercase" },
  expEntry: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 },
  expTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  expOrg: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  expRange: { color: colors.accent, fontSize: 11, marginTop: 2 },
  expDesc: { color: colors.muted, fontSize: 12.5, marginTop: 6, lineHeight: 17 },
  error: { color: colors.danger, fontSize: 12 },
  requestButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  requestButtonText: { color: colors.bg, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
  statusBanner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statusBannerText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
});
