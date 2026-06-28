import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookCover } from "@/components/ui/BookCover";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/store/useApp";
import { cn } from "@/utils/cn";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const nav = useNavigate();
  const { t } = useTranslation();
  const fav = useApp((s) => s.favorites.books.includes(book.id));
  const toggle = useApp((s) => s.toggleFavorite);
  return (
    <div className={cn("group relative flex flex-col gap-3 fade-up", className)}>
      <button
        onClick={() => nav(`/books/reader/${book.id}`)}
        className="relative flex justify-center"
        aria-label={book.title}
      >
        <BookCover
          title={book.title}
          coverImage={book.coverImage}
          color={book.coverColor}
          emoji={book.coverEmoji}
        />
        {book.featured && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-semibold text-amber-950 shadow">
            <Icon name="Star" size={11} /> Top
          </span>
        )}
        {book.isNew && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-600/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            New
          </span>
        )}
      </button>

      <div className="px-1">
        <button
          onClick={() => nav(`/books/reader/${book.id}`)}
          className="line-clamp-2 text-left text-sm font-semibold text-ink hover:text-emerald-800"
        >
          {book.title}
        </button>
        <div className="mt-0.5 line-clamp-1 text-xs text-ink-soft">{book.author}</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-ink-mute">
            <Icon name="BookOpen" size={11} />
            <span>{book.pages ? `${book.pages} ${t("common.pages")}` : book.size || ""}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggle("books", book.id); }}
            className={cn(
              "rounded-full p-1 transition-colors",
              fav ? "text-amber-500" : "text-ink-mute hover:text-amber-500"
            )}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Icon name="Star" size={14} className={fav ? "fill-amber-400" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}