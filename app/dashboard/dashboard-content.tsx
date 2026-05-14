"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { CodePreview } from "@/components/dashboard/code-preview";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { toast } from "sonner";

export default function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuthStore();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Welcome to Pro! 🎉", {
        description: "Your subscription is now active",
      });
      router.replace("/dashboard");
    }

    if (canceled === "true") {
      toast.info("Upgrade canceled", {
        description: "You can upgrade anytime",
      });
      setIsUpgrading(false);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleConvert() {
    if (!uploadedImage || !user) return;

    setIsConverting(true);
    setGeneratedCode(null);

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Conversion failed");
      }

      setGeneratedCode(data.code);

      toast.success("Code generated successfully! 🎉", {
        description:
          userData?.plan === "free"
            ? `${data.creditsRemaining} credits remaining`
            : "Unlimited conversions",
      });
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error("Conversion failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsConverting(false);
    }
  }

  async function handleUpgradeToPro() {
    if (!user) return;

    setIsUpgrading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error("Upgrade failed", {
        description: error.message || "Please try again",
      });
      setIsUpgrading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">SnapComponent</h1>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Plan: </span>
              <span className="font-medium capitalize">
                {userData?.plan || "free"}
              </span>

              {userData?.plan === "free" ? (
                <>
                  <span className="text-muted-foreground"> | Credits: </span>
                  <span className="font-medium">
                    {userData?.freeCredits || 0}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground"> | </span>
                  <span className="font-medium text-primary">Unlimited ✨</span>
                </>
              )}
            </div>

            {userData?.plan === "free" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* ── Before You Start Guide ── */}
          <section className="rounded-xl border bg-muted/40 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0" />
              <h2 className="text-lg font-semibold">
                Before You Start — Please Read
              </h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              SnapComponent converts UI screenshots into React components using{" "}
              <span className="font-medium text-foreground">shadcn/ui</span> and{" "}
              <span className="font-medium text-foreground">Tailwind CSS</span>.
              For the best results, follow the guidelines below before
              uploading.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Works well */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Works best with
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground list-none pl-0">
                  {[
                    "A single UI component — button, card, form, nav bar, pricing block, etc.",
                    "Clean screenshots with a plain or solid-color background",
                    "Standard web layouts (login forms, signup pages, dashboards, modals)",
                    "Screenshots cropped tightly around one section or component",
                    "Images with clear text, readable labels, and visible structure",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Does not work well */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-red-500 dark:text-red-400">
                  <XCircle className="h-4 w-4 shrink-0" />
                  Avoid uploading
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground list-none pl-0">
                  {[
                    "Full-page or multi-screen designs (e.g. an entire app's UI on one canvas)",
                    "Multiple unrelated components combined into one image",
                    "Highly complex layouts with 10+ nested sections or overlapping elements",
                    "Low-resolution, blurry, or heavily compressed screenshots",
                    "Mobile app mockups with device frames — crop to just the UI content",
                    "Figma / design tool canvases showing multiple screens at once",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-red-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro tip */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">💡 Pro tip:</span> If your design
              has multiple sections, split it into individual components and
              convert them one at a time. Smaller, focused screenshots
              consistently produce more accurate and cleaner code.
            </div>
          </section>

          {/* Upload Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Upload Screenshot</h2>
            <ImageUploader onImageUploaded={setUploadedImage} />
          </section>

          {/* Convert Button */}
          {uploadedImage && !generatedCode && (
            <section className="flex justify-center">
              <Button size="lg" onClick={handleConvert} disabled={isConverting}>
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "✨ Convert to Code"
                )}
              </Button>
            </section>
          )}

          {/* Code Preview */}
          {generatedCode && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generated Code</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedCode(null);
                    setUploadedImage(null);
                  }}
                >
                  Convert Another
                </Button>
              </div>
              <CodePreview code={generatedCode} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
