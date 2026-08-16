import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { colors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { OfflineQueueProvider } from "@/lib/offlineQueue";

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
