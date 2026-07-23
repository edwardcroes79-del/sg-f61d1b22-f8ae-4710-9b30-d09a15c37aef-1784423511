import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import { signIn, resetPassword, verifyMfaChallenge } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const defaultBrand = {
  name: "Torque Log",
  logo_url: "",
  primary_color: "#D97706",
  secondary_color: "#64748B",
};

export const getServerSideProps: GetServerSideProps<{ brand: typeof defaultBrand }> = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseAnonKey) {
    return { props: { brand: defaultBrand } };
  }

  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data } = await serverClient
    .from("workshops")
    .select("name, logo_url, primary_color, secondary_color")
    .limit(1)
    .maybeSingle();

  return {
    props: {
      brand: data || defaultBrand,
    },
  };
};

export default function LoginPage({ brand: serverBrand }: { brand: typeof defaultBrand }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "reset" | "mfa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<typeof defaultBrand>(serverBrand);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await signIn(email, password);

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      const factors = data.user?.factors;
      if (factors && factors.length > 0) {
        const factor = factors[0];
        const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
        if (challenge.error) throw challenge.error;
        setMfaFactorId(factor.id);
        setMfaChallengeId(challenge.data.id);
        setMode("mfa");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setLoading(true);
    setError("");
    try {
      const { getSession } = await import("@/services/authService");
      await verifyMfaChallenge(mfaFactorId, mfaChallengeId, totpCode);
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        throw new Error("Could not establish session. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await resetPassword(email);
      setMessage("Check your email for a password reset link.");
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  const primaryStyle = brand.primary_color
    ? ({
        ["--primary" as string]: hexToHsl(brand.primary_color),
        ["--accent" as string]: hexToHsl(brand.primary_color),
        ["--ring" as string]: hexToHsl(brand.primary_color),
        ["--secondary" as string]: hexToHsl(brand.secondary_color || brand.primary_color),
      } as React.CSSProperties)
    : {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6" style={primaryStyle}>
      <div className="w-full max-w-md">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3 mb-6 sm:mb-8">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="h-12 sm:h-10 w-auto object-contain" />
          ) : (
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              {brand.name ? (
                <span className="text-primary-foreground font-heading font-bold text-xl sm:text-lg">{brand.name.charAt(0)}</span>
              ) : (
                <Wrench className="w-6 h-6 sm:w-5 sm:h-5 text-primary-foreground" />
              )}
            </div>
          )}
          <span className="font-heading font-semibold text-2xl sm:text-2xl tracking-tight text-center sm:text-left">{brand.name}</span>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 p-5 sm:p-6">
            <CardTitle className="font-heading text-xl sm:text-xl">
              {mode === "login" ? "Welcome back" : "Reset password"}
            </CardTitle>
            <CardDescription className="text-sm">
              {mode === "login"
                ? "Sign in to your workshop dashboard"
                : "Enter your email to receive a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@workshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                {(error || message) && (
                  <div className={`p-3 sm:p-4 rounded-lg text-sm ${error ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                    {error || message}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError("");
                      setMessage("");
                    }}
                    className="text-sm text-primary hover:underline min-h-[44px] inline-flex items-center justify-center px-3"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="admin@workshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                {(error || message) && (
                  <div className={`p-3 sm:p-4 rounded-lg text-sm ${error ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                    {error || message}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Reset Link
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setMessage("");
                    }}
                    className="text-sm text-primary hover:underline inline-flex items-center min-h-[44px] px-3"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication required</p>
                    <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totp">Authentication Code</Label>
                  <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>

                {(error || message) && (
                  <div className={`p-3 sm:p-4 rounded-lg text-sm ${error ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                    {error || message}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || totpCode.length !== 6}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify Code
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-sm text-primary hover:underline inline-flex items-center min-h-[44px] px-3"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          QR-based Vehicle Service Record Management
        </p>
      </div>
    </div>
  );
}