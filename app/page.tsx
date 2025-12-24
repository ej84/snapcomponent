"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Code2, Check } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 로그인 상태면 Dashboard로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SnapComponent</h1>
          </div>

          <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Convert screenshots to code in seconds
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Screenshot to{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              shadcn/ui
            </span>{" "}
            Code
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-muted-foreground">
            Transform any UI screenshot into production-ready React components
            with shadcn/ui and Tailwind CSS. Built for developers who move fast.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setShowAuthModal(true)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Code2 className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            ⚡ 5 free conversions • 💳 No credit card required
          </p>
        </div>

        {/* Features */}
        <div id="features" className="mx-auto mt-32 max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Lightning Fast"
              description="Convert screenshots to code in seconds with GPT-4 Vision"
            />
            <FeatureCard
              icon={<Code2 className="h-8 w-8 text-primary" />}
              title="shadcn/ui Ready"
              description="Get production-ready components with Tailwind CSS styling"
            />
            <FeatureCard
              icon={<Check className="h-8 w-8 text-primary" />}
              title="No Vendor Lock-in"
              description="Export clean code you own. No proprietary frameworks."
            />
          </div>
        </div>

        {/* Pricing Teaser */}
        <div className="mx-auto mt-32 max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Start free, upgrade when you need more
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              features={[
                "5 conversions per month",
                "Basic components",
                "Code watermark",
                "Community support",
              ]}
              cta="Get Started"
              onClick={() => setShowAuthModal(true)}
            />
            <PricingCard
              name="Pro"
              price="$12"
              period="/month"
              features={[
                "Unlimited conversions",
                "Advanced components",
                "No watermark",
                "Priority support",
              ]}
              cta="Start Free Trial"
              onClick={() => setShowAuthModal(true)}
              highlighted
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 SnapComponent. Built with Next.js and shadcn/ui.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-lg bg-primary/10 p-3">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  onClick,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-8 ${
        highlighted ? "border-primary bg-primary/5" : ""
      }`}
    >
      <h3 className="mb-2 text-2xl font-bold">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={highlighted ? "default" : "outline"}
        onClick={onClick}
      >
        {cta}
      </Button>
    </div>
  );
}
