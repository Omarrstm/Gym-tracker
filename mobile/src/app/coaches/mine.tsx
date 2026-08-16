import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { displayFont } from "@/constants/fonts";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import SubTabs from "@/components/SubTabs";
import ShineCard from "@/components/ShineCard";
import FadeIn from "@/components/FadeIn";

const coachingTabs = [
  { href: "/coaches" as const, label: "Find a Coach" },
  { href: "/coaches/mine" as const, label: "My Coach" },
  { href: "/coach/profile" as const, label: "Become a Coach" },
];

export default function MyCoachesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<api.MyCoachesResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getMyCoaches(token);
    setData(result);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!token) return <Redirect href="/" />;

  async function handleRevoke(coachId: string) {
    if (!token) return;
    setBusyId(coachId);
    try {
      await api.revokeCoachLink(token, coachId);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{"←"} Home</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Coaching</Text>
        <Text style={styles.title}>My Coaches</Text>
      </View>

      <SubTabs tabs={coachingTabs} active="/coaches/mine" />

      {data === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      ) : (
        <>
          {data.pending.length > 0 && (
            <FadeIn>
              <ShineCard contentStyle={styles.section}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                {data.pending.map((p) => (
                  <Text key={p.coachId} style={styles.pendingText}>
                    {p.name ?? p.email} — awaiting response
                  </Text>
                ))}
              </ShineCard>
            </FadeIn>
          )}

          <FadeIn delay={60}>
            <ShineCard contentStyle={styles.section}>
              <Text style={styles.sectionTitle}>Your Coaches</Text>
              {data.accepted.length === 0 ? (
                <Text style={styles.emptyText}>
                  No coaches yet.{" "}
                  <Text style={styles.link} onPress={() => router.push("/coaches")}>
                    Find one
                  </Text>{" "}
                  or enter a join code.
                </Text>
              ) : (
                data.accepted.map((c) => (
                  <View key={c.coachId} style={styles.coachCard}>
                    <View style={styles.coachCardTop}>
                      <Text style={styles.coachName}>{c.name ?? c.email}</Text>
                      <TouchableOpacity onPress={() => handleRevoke(c.coachId)} disabled={busyId === c.coachId}>
                        <Text style={styles.unlink}>Unlink</Text>
                      </TouchableOpacity>
                    </View>
                    {c.programs.length > 0 && (
                      <View style={styles.programsList}>
                        {c.programs.map((p) => (
                          <TouchableOpacity
                            key={p.id}
                            style={styles.programRow}
                            onPress={() => router.push(`/programs/${p.id}`)}
                          >
                            <Text style={styles.programName}>{p.name}</Text>
                            {p.isActive && <Text style={styles.activeLabel}>Active</Text>}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </ShineCard>
          </FadeIn>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
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
  title: { color: colors.text, fontFamily: displayFont, fontSize: 36, letterSpacing: 0.5 },
  section: { padding: 16, gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  pendingText: { color: colors.muted, fontSize: 13.5 },
  emptyText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.accent, fontWeight: "700" },
  coachCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 12,
  },
  coachCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  coachName: { color: colors.text, fontSize: 14.5, fontWeight: "700" },
  unlink: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  programsList: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8, gap: 4 },
  programRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  programName: { color: colors.text, fontSize: 12.5 },
  activeLabel: { color: colors.accent, fontSize: 10, fontWeight: "700" },
});
