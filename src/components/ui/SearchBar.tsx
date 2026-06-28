import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder, className, autoFocus }: SearchBarProps) {
  const { t } = useTranslation();
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm",
      className
    )}>
      <Icon name="Search" size={18} className="text-ink-mute" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t("common.search_placeholder")}
        className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
        autoFocus={autoFocus}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="rounded-full p-1 text-ink-mute hover:bg-paper-2 hover:text-ink"
          aria-label="Clear"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
}