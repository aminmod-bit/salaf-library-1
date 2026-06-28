import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: ReactNode;
  title?: string;
  ariaLabel?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  icon,
  title,
  ariaLabel,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all " +
    "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-emerald-900 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md",
    secondary: "bg-paper-2 hover:bg-paper-3 text-ink border border-line",
    ghost: "hover:bg-paper-2 text-ink",
    outline: "border border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white",
    gold: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm hover:shadow-md",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {icon}
      {children}
    </button>
  );
}