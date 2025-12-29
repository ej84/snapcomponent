import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner"; // ← 변경!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://snapcomponent.vercel.app"),
  title: {
    default:
      "SnapComponent - Convert UI Screenshots to React Components with AI",
    template: "%s | SnapComponent",
  },
  description:
    "Transform any UI screenshot into production-ready shadcn/ui React components instantly. Built for developers who ship fast. Powered by GPT-4 Vision API.",
  keywords: [
    "screenshot to code",
    "UI to React",
    "shadcn components",
    "GPT-4 Vision",
    "React code generator",
    "UI screenshot converter",
    "frontend automation",
    "AI code generation",
    "figma to react",
    "image to code",
  ],
  authors: [{ name: "Richard" }],
  creator: "Richard Jeong",
  publisher: "SnapComponent",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snapcomponent.vercel.app",
    siteName: "SnapComponent",
    title:
      "SnapComponent - Convert UI Screenshots to React shadcn/ui Components",
    description:
      "Transform UI screenshots into production-ready React code with AI",
    images: [
      {
        url: "/og-image.png", // 1200x630px 이미지 필요
        width: 1200,
        height: 630,
        alt: "SnapComponent - Screenshot to React Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapComponent - UI Screenshots to React Code",
    description:
      "Convert any UI screenshot to production-ready React components instantly",
    creator: "@DreamyDesignerX",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
