import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import AuthScreen from "@/components/AuthScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import HomeScreen from "@/components/HomeScreen";
import CoachHomeScreen from "@/components/CoachHomeScreen";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!user) {
    if (authMode === null) {
      return <WelcomeScreen onLogIn={() => setAuthMode("login")} onSignUp={() => setAuthMode("signup")} />;
    }
    return <AuthScreen initialMode={authMode} onBack={() => setAuthMode(null)} />;
  }
  return user.isCoach ? <CoachHomeScreen /> : <HomeScreen />;
}
