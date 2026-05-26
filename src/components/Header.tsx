import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, ShieldCheck } from "lucide-react";

export function Header() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          <span>Padel Tournament</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Leaderboards
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary hover:text-primary/80 px-3 py-2 flex items-center gap-1"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Admin sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
