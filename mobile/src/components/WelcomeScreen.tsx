import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";

const features = [
  { title: "Weekly Programs", description: "Plan your training days and assign exercises with target sets, reps, and weight." },
  { title: "Progress Tracking", description: "Automatic PR detection and an estimated 1RM trend for every exercise." },
  { title: "Smart Set Logging", description: "Log weight, sets, reps, and RIR in seconds, with warm-up sets flagged out of your stats." },
  { title: "Coaching", description: "Connect with a coach, or run your own athletes from a dedicated dashboard." },
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
        <Text style={styles.eyebrow}>Free &amp; self-hosted</Text>
        <Text style={styles.title}>
          The workout tracker built for <Text style={styles.titleAccent}>consistent progress</Text>
        </Text>
        <Text style={styles.subtitle}>
          Plan weekly programs, log every set as you lift, and watch your PRs and estimated 1RM
          trend up over time &mdash; with coaching built in.
        </Text>

        <View style={styles.featureList}>
          {features.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDescription}>{f.description}</Text>
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
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", lineHeight: 38, marginTop: 10 },
  titleAccent: { color: colors.accent },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 14 },
  featureList: { marginTop: 28, gap: 10 },
  featureCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
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
