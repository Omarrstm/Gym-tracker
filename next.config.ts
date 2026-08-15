import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      new URL("https://raw.githubusercontent.com/yuhonas/free-exercise-db/**"),
    ],
  },
};

export default nextConfig;
