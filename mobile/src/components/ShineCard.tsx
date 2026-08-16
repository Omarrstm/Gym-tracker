import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

export default function ShineCard({
  children,
  style,
  contentStyle,
  radius = 14,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.16)"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[{ borderRadius: radius, padding: 1 }, style]}
    >
      <View
        style={[
          { borderRadius: radius - 1, backgroundColor: colors.surface, overflow: "hidden" },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

export const shineCardStyles = StyleSheet.create({
  padded: { padding: 14 },
});
