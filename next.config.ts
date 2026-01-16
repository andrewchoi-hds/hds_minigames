import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  // Turbopack 설정 (PWA webpack 플러그인과 공존)
  turbopack: {},
};

export default withPWA(nextConfig);
