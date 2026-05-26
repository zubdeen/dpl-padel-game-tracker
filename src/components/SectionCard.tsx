import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  action?: string | ReactNode;
  onAction?: () => void;
  children: ReactNode;
}

export function SectionCard({
  title,
  icon,
  action,
  onAction,
  children,
}: SectionCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-0 rounded-2xl overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/[0.05] py-0">
      {/* Gold accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader className="pb-2 px-4 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
              {title}
            </CardTitle>
          </div>
          {action &&
            (typeof action === "string" ? (
              <button
                onClick={onAction}
                className="text-[10px] font-medium text-primary/70 hover:text-primary transition-colors"
              >
                {action}
              </button>
            ) : (
              action
            ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">{children}</CardContent>
    </Card>
  );
}
