"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { stashCreateAgentWizardState } from "@/lib/create-agent-wizard-state";
import { AGENT_TYPE_CONFIGS } from "@/constants/agentTypeConfigs";

const ONBOARDING_STEPS = [
  {
    title: "Create your account",
    description: "Email and password, nothing else. Takes about ten seconds.",
  },
  {
    title: "Build your Product Information Agent",
    description:
      "We pre-configure a product information agent. You pick the name, voice, and language.",
  },
  {
    title: "Talk to it",
    description:
      "Finish on a live preview where you can call your agent and hear it answer.",
  },
];

export default function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== passwordConfirmation) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    setIsLoading(true);
    try {
      const redirectPath = await signUp(email, password, passwordConfirmation);
      if (redirectPath) {
        // Send the new user into the agent wizard pre-configured as a Support
        // Agent instead of the default post-signup destination.
        const config = AGENT_TYPE_CONFIGS.product_information;
        stashCreateAgentWizardState({
          agentType: "product_information",
          agentTypeConfig: config,
          preSelectedGoals: config.primaryGoals,
          autoGenerateBehavior: true,
          skipNameStep: false,
        });
        router.push("/assistants/create");
      }
    } catch {
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background">
        <div className="absolute top-8 left-8">
          <Link href="/" className="text-2xl font-bold text-foreground">
            Upriser
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Launch your first Product Information Agent
            </h1>
            <p className="text-muted-foreground text-sm">
              Create an account and we&apos;ll walk you straight through building a
              product information agent you can talk to.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="bg-secondary/50"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account & build my agent"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              rel="nofollow"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 text-xs text-muted-foreground">
          By using Upriser you agree to our Terms of Service,
          <br />
          Privacy, and Security policies and practices.
        </div>
      </div>

      {/* Right Side - What happens next */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        <div className="relative z-10 max-w-md mx-8 space-y-6">
          <h2 className="text-xl font-semibold text-white">
            Three steps to a working agent
          </h2>

          <ol className="space-y-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-white text-sm">{step.title}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
