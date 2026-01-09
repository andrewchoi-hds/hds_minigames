import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Games",
  description: "가볍게 즐기는 미니게임 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
