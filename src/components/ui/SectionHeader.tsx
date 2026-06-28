import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({ title, subtitle, action, className, align = "left" }: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-4 flex items-end justify-between gap-3",
      align === "center" && "justify-center text-center flex-col",
      className
    )}>
      <div className="min-w-0">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}