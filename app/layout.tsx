import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const interDisplay = localFont({
  src: [{ path: "./fonts/InterDisplay-Bold.woff2", weight: "700" }],
  variable: "--font-inter-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AstraSpin — Casino Lobby Demo",
  description:
    "A portfolio demo of a casino game lobby, wallet and deposit flow built with Next.js, React Query and Tailwind CSS. No real money.",
};

export const viewport: Viewport = { themeColor: "#070b16" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${interDisplay.variable} antialiased`}>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
