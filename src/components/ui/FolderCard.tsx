import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";
import type { Folder } from "@/types";

interface FolderCardProps {
  folder: Folder;
  to: string;
  count?: number;
  className?: string;
}

/** Unified folder card — used everywhere (books, azkar, articles, biographies) */
export function FolderCard({ folder, to, count, className }: FolderCardProps) {
  const nav = useNavigate();
  const cover = folder.coverColor || "#0f3d2e";
  const accent = folder.accentColor || "#c9a44a";
  return (
    <button
      onClick={() => nav(to)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line text-left lift",
        "h-32 sm:h-36 w-full",
        className
      )}
      aria-label={folder.label}
    >
      {/* Gradient bg */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${cover} 0%, ${cover}cc 60%, ${cover}99 100%)`,
        }}
      />
      {/* Ornament */}
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30"
        style={{ background: accent }}
      />
      <div
        className="absolute right-6 bottom-6 h-12 w-12 rounded-full opacity-20"
        style={{ background: accent }}
      />
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm"
            style={{ background: `${accent}33`, border: `1px solid ${accent}55` }}
          >
            <Icon name={folder.iconKey} size={20} className="text-white" />
          </div>
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur-sm">
              {count}
            </span>
          )}
        </div>
        <div>
          <div className="text-base font-semibold text-white sm:text-lg">{folder.label}</div>
          {folder.labelAr && (
            <div className="arabic text-sm text-white/75">{folder.labelAr}</div>
          )}
          {folder.description && (
            <div className="mt-0.5 text-[11px] text-white/70 line-clamp-1">{folder.description}</div>
          )}
        </div>
      </div>
    </button>
  );
}