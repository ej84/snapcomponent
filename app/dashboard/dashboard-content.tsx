"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { CodePreview } from "@/components/dashboard/code-preview";
import { Button } from "@/components/ui/button";
import { Loader2, Crown } from "lucide-react";
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

  // ✅ URL 파라미터 체크
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Welcome to Pro! 🎉", {
        description: "Your subscription is now active",
      });
      // URL 파라미터 제거
      router.replace("/dashboard");
    }

    if (canceled === "true") {
      toast.info("Upgrade canceled", {
        description: "You can upgrade anytime",
      });
      // ✅ isUpgrading 상태 초기화
      setIsUpgrading(false);
      // URL 파라미터 제거
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // 변환 핸들러
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

  // Upgrade to Pro 핸들러
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

      // Redirect to Stripe Checkout
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

  // Sign out 핸들러
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
