import { LucideIcon, icons } from "lucide-react";
import { cn } from "@/utils/cn";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Renders a Lucide icon by name; falls back to Library icon if unknown. */
export function Icon({ name, size = 20, className, strokeWidth = 1.8 }: IconProps) {
  // Try exact match, then capitalized (PascalCase)
  const key = (icons as Record<string, LucideIcon | undefined>)[name]
    || (icons as Record<string, LucideIcon | undefined>)[name.charAt(0).toUpperCase() + name.slice(1)]
    || icons.Library;
  const Cmp = key as LucideIcon;
  return <Cmp size={size} strokeWidth={strokeWidth} className={cn(className)} aria-hidden />;
}