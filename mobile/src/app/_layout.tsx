import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </AuthProvider>
  );
}
