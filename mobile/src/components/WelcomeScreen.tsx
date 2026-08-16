import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";

const stats = ["Free core, forever", "No ads, ever", "Web & mobile"];

const features = [
  { title: "Weekly Programs", icon: "\u{1F4C5}", description: "Plan your training days and assign exercises with target sets, reps, and weight." },
  { title: "Progress Tracking", icon: "\u{1F4C8}", description: "Automatic PR detection and an estimated 1RM trend for every exercise." },
  { title: "Smart Set Logging", icon: "✏️", description: "Log weight, sets, reps, and RIR in seconds, with warm-up sets flagged out of your stats." },
  { title: "Coaching", icon: "\u{1F465}", description: "Connect with a coach, or run your own athletes from a dedicated dashboard." },
];

export default function WelcomeScreen({
  onLogIn,
  onSignUp,
}: {
  onLogIn: () => void;
  onSignUp: () => void;
}) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Free &amp; self-hosted</Text>
        </View>

        <Text style={styles.title}>
          The workout tracker built for <Text style={styles.titleAccent}>consistent progress</Text>
        </Text>
        <Text style={styles.subtitle}>
          Plan weekly programs, log every set as you lift, and watch your PRs and estimated 1RM
          trend up over time &mdash; with coaching built in.
        </Text>

        <View style={styles.statRow}>
          {stats.map((s) => (
            <View key={s} style={styles.statItem}>
              <Text style={styles.statDot}>&#9679;</Text>
              <Text style={styles.statText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.featureList}>
          {features.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{f.icon}</Text>
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDescription}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={onSignUp}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onLogIn}>
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingTop: 72, paddingBottom: 16, gap: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", lineHeight: 38, marginTop: 14 },
  titleAccent: { color: colors.accent },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 14 },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 18 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statDot: { color: colors.accent, fontSize: 8 },
  statText: { color: colors.muted, fontSize: 12.5, fontWeight: "600" },
  featureList: { marginTop: 24, gap: 10 },
  featureCard: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: { fontSize: 16 },
  featureBody: { flex: 1 },
  featureTitle: { color: colors.text, fontSize: 14, fontWeight: "800", textTransform: "uppercase" },
  featureDescription: { color: colors.muted, fontSize: 12.5, lineHeight: 17, marginTop: 4 },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.bg, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.text, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
});
