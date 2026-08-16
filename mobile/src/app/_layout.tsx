import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { colors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { OfflineQueueProvider } from "@/lib/offlineQueue";

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function OfflineQueueGate({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  return (
    <OfflineQueueProvider token={token} userId={user?.id ?? null}>
      {children}
    </OfflineQueueProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <OfflineQueueGate>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </OfflineQueueGate>
    </AuthProvider>
  );
}
