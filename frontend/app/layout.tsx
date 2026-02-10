import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastRenderer } from "@/components/ui/ToastRenderer";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Check Mate - Manage Your Tasks",
  description: "Simple and powerful todo application with user authentication",
};

// Load ChatKit web component
const ChatkitScript = () => (
  <script
    src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
    async
  />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ChatkitScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ToastRenderer />
            <FloatingChatButton />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
