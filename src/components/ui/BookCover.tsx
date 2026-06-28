import { cn } from "@/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { colorFromString } from "@/utils/helpers";

interface BookCoverProps {
  coverImage?: string;
  color?: string;
  emoji?: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Renders a real cover if exists, otherwise a paper-style colored cover */
export function BookCover({ coverImage, color, emoji = "📖", title, size = "md", className }: BookCoverProps) {
  const baseColor = color || colorFromString(title);
  const sizes = {
    sm: "h-28 text-3xl",
    md: "h-44 text-5xl",
    lg: "h-64 text-6xl",
  };
  const w = size === "sm" ? "w-20" : size === "md" ? "w-32" : "w-48";

  if (coverImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl border border-line shadow-sm", w, sizes[size], className)}>
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line shadow-sm",
        w, sizes[size], className
      )}
      style={{
        background: `linear-gradient(160deg, ${baseColor} 0%, ${baseColor}cc 60%, ${baseColor}88 100%)`,
      }}
      aria-label={title}
    >
      {/* Subtle paper texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.18), transparent 50%)",
        }}
      />
      {/* Spine */}
      <div className="absolute left-0 top-0 h-full w-[6px] bg-black/25" />
      <div className="absolute left-[6px] top-0 h-full w-[1px] bg-white/10" />
      {/* Title */}
      <div className="absolute inset-x-3 bottom-3 line-clamp-3 text-[10px] font-medium uppercase tracking-wider text-white/85">
        {title}
      </div>
      {/* Emoji mark */}
      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
        <Icon name="BookOpen" size={14} className="text-white" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pt-2">
        <span className="drop-shadow-md">{emoji}</span>
      </div>
    </div>
  );
}