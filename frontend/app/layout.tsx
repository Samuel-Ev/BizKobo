import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

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

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('bizkobo_theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-body bg-ink text-paper antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
