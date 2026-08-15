import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"athlete" | "coach">("athlete");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      if (mode === "login") {
        await signIn(email.trim().toLowerCase(), password);
      } else {
        await signUp(name.trim(), email.trim().toLowerCase(), password, role);
      }
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Gym Tracker</Text>
        <Text style={styles.title}>{mode === "login" ? "Log In" : "Create Account"}</Text>

        {mode === "signup" && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleButton, role === "athlete" && styles.roleButtonActive]}
                  onPress={() => setRole("athlete")}
                >
                  <Text
                    style={[styles.roleButtonText, role === "athlete" && styles.roleButtonTextActive]}
                  >
                    Athlete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "coach" && styles.roleButtonActiveBlue,
                  ]}
                  onPress={() => setRole("coach")}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "coach" && styles.roleButtonTextActiveBlue,
                    ]}
                  >
                    Coach
                  </Text>
                </TouchableOpacity>
              </View>
              {role === "coach" && (
                <Text style={styles.roleHint}>Coach accounts include a 14-day free trial.</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor={colors.muted}
              />
            </View>
          </>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submit, pending && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.submitText}>
              {mode === "login" ? "Log In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setError(null);
            setMode((m) => (m === "login" ? "signup" : "login"));
          }}
        >
          <Text style={styles.switchText}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchTextAccent}>
              {mode === "login" ? "Sign up" : "Log in"}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 4 },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 8 },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  roleButtonActiveBlue: { borderColor: colors.accentBlue, backgroundColor: colors.accentBlueSoft },
  roleButtonText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  roleButtonTextActive: { color: colors.accent },
  roleButtonTextActiveBlue: { color: colors.accentBlue },
  roleHint: { color: colors.muted, fontSize: 11.5, marginTop: 6 },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.bg, fontWeight: "800", fontSize: 14, textTransform: "uppercase" },
  switchText: { color: colors.muted, fontSize: 13, textAlign: "center", marginTop: 18 },
  switchTextAccent: { color: colors.accent, fontWeight: "700" },
});
