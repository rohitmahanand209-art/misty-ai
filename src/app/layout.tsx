import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Misty AI — Create Amazing Videos with AI",
    template: "%s · Misty AI",
  },
  description:
    "Misty AI turns your words and images into beautiful videos, with Hindi and English AI voice over. A mobile-first AI video studio.",
  applicationName: "Misty AI",
  keywords: [
    "AI video generator",
    "text to video",
    "image to video",
    "cartoon video maker",
    "Hindi AI voice",
    "Misty AI",
  ],
  openGraph: {
    title: "Misty AI — Create Amazing Videos with AI",
    description:
      "Turn a sentence or a photo into a polished clip with Hindi and English voice over.",
    siteName: "Misty AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0917",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            {children}
          </TooltipProvider>
        </AuthProvider>
        {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
        <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
      </body>
    </html>
  );
}
