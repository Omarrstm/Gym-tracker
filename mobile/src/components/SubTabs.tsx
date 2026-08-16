import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";

export default function SubTabs({
  tabs,
  active,
}: {
  tabs: { href: "/stats" | "/history" | "/progress" | "/coaches" | "/coaches/mine" | "/coach/profile"; label: string }[];
  active: string;
}) {
  const router = useRouter();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {tabs.map((tab) => {
        const isActive = tab.href === active;
        return (
          <TouchableOpacity
            key={tab.href}
            onPress={() => router.push(tab.href)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tabActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  tabText: { color: colors.muted, fontSize: 12.5, fontWeight: "700" },
  tabTextActive: { color: colors.accent },
});
