import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
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
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";

function daysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function RequestRow({
  athleteId,
  name,
  onRespond,
}: {
  athleteId: string;
  name: string | null;
  onRespond: (athleteId: string, accept: boolean) => void;
}) {
  return (
    <View style={styles.requestRow}>
      <Text style={styles.requestName}>{name ?? "Athlete"}</Text>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => onRespond(athleteId, true)}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton} onPress={() => onRespond(athleteId, false)}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CoachHomeScreen() {
  const { token, user, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<api.CoachDashboardResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await api.getCoachDashboard(token);
    setData(result);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleRespond(athleteId: string, accept: boolean) {
    if (!token) return;
    await api.respondToRequest(token, athleteId, accept);
    await load();
  }

  async function handleInvite() {
    if (!token || !inviteEmail) return;
    setInviteError(null);
    setInviteStatus(null);
    setInvitePending(true);
    try {
      await api.sendCoachInvite(token, inviteEmail);
      setInviteStatus(`Invite sent to ${inviteEmail}.`);
      setInviteEmail("");
    } catch (e) {
      setInviteError(e instanceof ApiError ? e.message : "Couldn't send the invite.");
    } finally {
      setInvitePending(false);
    }
  }

  if (!data) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.accentBlue} size="large" />
      </View>
    );
  }

  const trialDays = daysLeft(data.profile.trialEndsAt);
  const activeToday = data.roster.filter((r) => r.streak > 0).length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentBlue} />
      }
    >
      <View style={styles.header}>
        <View>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Coach</Text>
          </View>
          <Text style={styles.title}>
            Coach Dashboard,{"\n"}
            <Text style={styles.titleAccent}>{(user?.name ?? "there").split(" ")[0]}</Text>
          </Text>
          {data.profile.subscriptionStatus === "TRIALING" && trialDays !== null && (
            <Text style={styles.trialText}>
              Free trial &middot; {trialDays} {trialDays === 1 ? "day" : "days"} left
            </Text>
          )}
        </View>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={() => router.push("/exercises")}>
            <Text style={styles.headerLink}>Exercise Library</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/programs")}>
            <Text style={styles.headerLink}>My Programs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/stats")}>
            <Text style={styles.headerLink}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/coach/profile")}>
            <Text style={styles.headerLink}>Coach Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.headerLink}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Athletes</Text>
          <Text style={styles.statValue}>{data.roster.length}</Text>
          <Text style={styles.statSub}>{activeToday} active this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Requests</Text>
          <Text style={styles.statValue}>{data.pendingRequests.length}</Text>
          <Text style={styles.statSub}>pending</Text>
        </View>
      </View>

      {data.pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requests</Text>
          {data.pendingRequests.map((r) => (
            <RequestRow
              key={r.athleteId}
              athleteId={r.athleteId}
              name={r.name}
              onRespond={handleRespond}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Athletes</Text>
        {data.roster.length === 0 ? (
          <Text style={styles.emptyText}>
            No athletes yet — invite one by email or share your join code from your coach profile.
          </Text>
        ) : (
          data.roster.map((r) => (
            <View key={r.athleteId} style={styles.athleteRow}>
              <Text style={styles.athleteName}>{r.name ?? r.email}</Text>
              <Text style={styles.athleteStreak}>
                {r.streak > 0 ? `${r.streak} day streak` : "No recent activity"}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite an Athlete</Text>
        <View style={styles.inviteRow}>
          <TextInput
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="athlete@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            style={[styles.inviteButton, (!inviteEmail || invitePending) && styles.disabled]}
            onPress={handleInvite}
            disabled={!inviteEmail || invitePending}
          >
            {invitePending ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.inviteButtonText}>Invite</Text>
            )}
          </TouchableOpacity>
        </View>
        {inviteError && <Text style={styles.error}>{inviteError}</Text>}
        {inviteStatus && <Text style={styles.success}>{inviteStatus}</Text>}
        {data.sentInvites.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.pendingLabel}>Pending Invites</Text>
            {data.sentInvites.map((invite) => (
              <Text key={invite.id} style={styles.pendingEmail}>
                {invite.email}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accentBlue + "66",
    backgroundColor: colors.accentBlueSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentBlue },
  badgeText: {
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: 10, lineHeight: 28 },
  titleAccent: { color: colors.accentBlue },
  trialText: { color: colors.muted, fontSize: 12, marginTop: 6 },
  headerLinks: { alignItems: "flex-end", gap: 10, marginTop: 6 },
  headerLink: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 4 },
  statSub: { color: colors.accentBlue, fontSize: 12, marginTop: 2 },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    padding: 12,
  },
  requestName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  requestActions: { flexDirection: "row", gap: 8 },
  acceptButton: { backgroundColor: colors.accentBlue, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  acceptButtonText: { color: colors.bg, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  declineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  declineButtonText: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  athleteRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  athleteName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  athleteStreak: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  inviteRow: { flexDirection: "row", gap: 8 },
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
  inviteButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButtonText: { color: colors.bg, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  disabled: { opacity: 0.5 },
  error: { color: colors.danger, fontSize: 12 },
  success: { color: colors.accentBlue, fontSize: 12 },
  pendingLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pendingEmail: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
