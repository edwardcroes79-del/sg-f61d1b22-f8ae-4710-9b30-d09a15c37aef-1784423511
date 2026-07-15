import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, signUp } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Loader2, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<{
    name: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
  } | null>(null);

  useEffect(() => {
    async function loadBrand() {
      const { data } = await supabase.from("workshops").select("name, logo_url, primary_color, secondary_color").limit(1).maybeSingle();
      setBrand(data || { name: "Torque Log", primary_color: "#D97706", secondary_color: "#64748B" });
    }
    loadBrand();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const primaryStyle = brand?.primary_color
    ? ({
        ["--primary" as string]: hexToHsl(brand.primary_color),
        ["--accent" as string]: hexToHsl(brand.primary_color),
        ["--ring" as string]: hexToHsl(brand.primary_color),
        ["--secondary" as string]: hexToHsl(brand.secondary_color || brand.primary_color),
      } as React.CSSProperties)
    : {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={primaryStyle}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          {brand?.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              {brand?.name ? <span className="text-primary-foreground font-heading font-bold text-lg">{brand.name.charAt(0)}</span> : <Wrench className="w-5 h-5 text-primary-foreground" />}
            </div>
          )}
          <span className="font-heading font-semibold text-2xl tracking-tight">{brand?.name || "Torque Log"}</span>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-xl">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to your workshop dashboard"
                : "Set up your workshop account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@workshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          QR-based Vehicle Service Record Management
        </p>
      </div>
    </div>
  );
}