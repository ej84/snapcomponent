import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner"; // ← 변경!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapComponent - Screenshot to shadcn/ui Code",
  description:
    "Convert UI screenshots to production-ready shadcn/ui components in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster /> {/* Sonner Toaster */}
        </AuthProvider>
      </body>
    </html>
  );
}
