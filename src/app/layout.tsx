import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZKAP App Store Screenshots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "Pretendard, -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
