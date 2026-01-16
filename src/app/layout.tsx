import type { Metadata, Viewport } from "next";
import "./globals.css";
import KonamiCodeProvider from "@/components/KonamiCodeProvider";

export const metadata: Metadata = {
  title: "미니게임",
  description: "가볍게 즐기는 미니게임 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "미니게임",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <KonamiCodeProvider />
        {children}
      </body>
    </html>
  );
}
