// Mirrors the web app's dark theme (src/app/globals.css) so the mobile app
// reads as the same product. The web app is always dark, so this app is too
// -- no light-mode branch to keep in sync.
export const colors = {
  bg: "#0a0e17",
  surface: "#10141f",
  surface2: "#161c2c",
  border: "#232a3d",
  accent: "#34d399",
  accentSoft: "#34d39926",
  accentBlue: "#5b9cff",
  accentBlueSoft: "#5b9cff26",
  text: "#eaf1f5",
  muted: "#8a93a8",
  danger: "#f87171",
} as const;
