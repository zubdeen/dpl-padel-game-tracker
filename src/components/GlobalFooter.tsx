import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function GlobalFooter() {
  const { user } = useAuth();
  return (
    <footer className="mt-8 pt-6 pb-8 border-t border-border/30">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 text-[11px]">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin sign in
            </Link>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground/60 tracking-wider uppercase">
          Padel Tournament Tracker
        </p>
      </div>
    </footer>
  );
}
