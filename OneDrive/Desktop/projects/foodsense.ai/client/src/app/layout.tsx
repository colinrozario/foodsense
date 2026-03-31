import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "foodsense.ai — Know what you eat",
  description: "Instantly analyze ingredients, detect allergens, and get AI-powered safety verdicts for any packaged food product.",
  manifest: "/manifest.json",
  openGraph: {
    title: "foodsense.ai",
    description: "Stop eating blind. AI-powered food intelligence.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} antialiased font-[family-name:var(--font-jakarta)]`}>
        {children}
      </body>
    </html>
  );
}
