import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizKobo — Every kobo counts.",
  description: "AI-powered bookkeeping, savings, and micro-credit for Nigerian students, traders, and small businesses.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

export const viewport = {
  themeColor: "#214E35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body bg-ink text-paper antialiased">
        {children}
      </body>
    </html>
  );
}
