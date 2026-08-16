import { StyleSheet, View } from "react-native";

const LAYERS = [
  { size: 420, opacity: 0.05 },
  { size: 320, opacity: 0.07 },
  { size: 220, opacity: 0.09 },
  { size: 130, opacity: 0.1 },
];

export default function Glow({ color, top = -80, right = -100 }: { color: string; top?: number; right?: number }) {
  return (
    <View style={styles.wrapper} pointerEvents="none">
      {LAYERS.map((layer) => (
        <View
          key={layer.size}
          style={{
            position: "absolute",
            top: top + (420 - layer.size) / 2,
            right: right + (420 - layer.size) / 2,
            width: layer.size,
            height: layer.size,
            borderRadius: layer.size / 2,
            backgroundColor: color,
            opacity: layer.opacity,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
});
