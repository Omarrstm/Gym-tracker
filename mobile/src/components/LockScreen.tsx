import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function LockScreen() {
  const { unlock } = useAuth();
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function attempt() {
    setPending(true);
    setFailed(false);
    const success = await unlock();
    if (!success) setFailed(true);
    setPending(false);
  }

  useEffect(() => {
    // Prompt once automatically on mount -- setState happens after the await
    // inside attempt(), not synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    attempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.flex}>
      <Text style={styles.icon}>{"\u{1F512}"}</Text>
      <Text style={styles.title}>Gym Tracker Locked</Text>
      <Text style={styles.subtitle}>
        {failed ? "Couldn't verify — try again." : "Verify your identity to continue."}
      </Text>
      <TouchableOpacity style={styles.button} onPress={attempt} disabled={pending}>
        <Text style={styles.buttonText}>{pending ? "Verifying..." : "Unlock"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 13, textAlign: "center", marginBottom: 16 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  buttonText: { color: colors.bg, fontWeight: "800", fontSize: 13, textTransform: "uppercase" },
});
