import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SectionCard } from "@/components/SectionCard";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. You can sign in now.");
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[420px] relative">
        <div className="px-5 pb-10 pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-3 w-3" /> Back to standings
          </Link>

          <div className="py-5 text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/30 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
              Admin Access
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1">
              Only the tournament admin can record matches
            </p>
          </div>

          <SectionCard
            title="Sign In"
            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          >
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/[0.03] border border-white/[0.05]">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-3">
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-3">
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Password (min 6 chars)"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Creating…" : "Create account"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The first signed-in user can claim the single admin seat
                    from the admin page. After that, claiming is permanently
                    locked.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </SectionCard>

          <GlobalFooter />
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="bg-white/[0.03] border-white/[0.06]"
      />
    </div>
  );
}
