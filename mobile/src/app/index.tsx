import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import AuthScreen from "@/components/AuthScreen";
import HomeScreen from "@/components/HomeScreen";
import CoachHomeScreen from "@/components/CoachHomeScreen";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;
  return user.isCoach ? <CoachHomeScreen /> : <HomeScreen />;
}
