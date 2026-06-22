import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import BookCard from "../components/BookCard";
import {
  BookOpen,
  Headphones,
  Play,
  ChevronRight,
  Shuffle,
  BookMarked,
  Star,
  Zap,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    books,
    biographies,
    categories,
    readingProgress,
    history,
    favorites,
    isLoading,
  } = useStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px", animation: "spin 2s linear infinite" }}>
          📚
        </div>
        <div style={{ color: "#9db8a3", fontSize: "16px" }}>
          Загрузка библиотеки...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const featuredBooks = books.filter((b) => b.featured).slice(0, 10);
  const newBooks = books.filter((b) => b.isNew).slice(0, 12);
  const popularBooks = books.filter((b) => b.popular).slice(0, 12);
  const featuredBios = biographies.filter((b) => b.featured).slice(0, 4);
  const favoriteBooks = books.filter((b) => favorites.includes(b.id));
  const randomBook = books[Math.floor(Math.random() * books.length)];

  const continueReading = readingProgress.slice(0, 3);

  return (
    <div className="fade-in" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Hero Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0d2a18 0%, #1a3a22 50%, #0a1f12 100%)",
          borderRadius: "20px",
          padding: "40px 48px",
          marginBottom: "32px",
          border: "1px solid rgba(212,175,55,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "30%",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "200px",
            fontFamily: "Amiri, serif",
            fontSize: "64px",
            color: "rgba(212,175,55,0.08)",
            direction: "rtl",
          }}
        >
          اقرأ
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "Amiri, serif",
              fontSize: "18px",
              color: "#d4af37",
              marginBottom: "12px",
              direction: "rtl",
              textAlign: "left",
            }}
          >
            اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#f0f4f1",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            Salaf Library
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#9db8a3",
              marginBottom: "28px",
              maxWidth: "500px",
            }}
          >
            {t(
              "home.description",
              "Исламская цифровая библиотека — книги, биографии, аудиоуроки и фаваиды учёных Ислама в одном месте.",
            )}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/books")}>
              <BookOpen size={16} />
              {t("home.readBooks", "Читать книги")}
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/audio")}
            >
              <Headphones size={16} />
              {t("home.listenLessons", "Слушать уроки")}
            </button>
            <button className="btn-ghost" onClick={() => navigate("/search")}>
              {t("home.catalog", "Весь каталог")}
            </button>
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: t("home.statsBooks", "Книг"),
                value: books.length + "+",
                icon: "📚",
              },
              {
                label: t("home.statsBiographies", "Биографий"),
                value: biographies.length + "+",
                icon: "👤",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "18px" }}>{icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#d4af37",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#5a7a63",
                      marginTop: "-2px",
                    }}
                  >
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <Section
          title="📖 Продолжить чтение"
          onMore={() => navigate("/history")}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {continueReading.map((p) => {
              const book = books.find((b) => b.id === p.bookId);
              if (!book) return null;
              const pct = Math.round((p.page / p.totalPages) * 100);
              return (
                <div
                  key={p.bookId}
                  onClick={() => navigate(`/books/${p.bookId}`)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "14px",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  <div
                    style={{
                      width: "48px",
                      height: "64px",
                      background: book.coverColor || "#1a3a2a",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    {book.coverEmoji || "📖"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#f0f4f1",
                        marginBottom: "2px",
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9db8a3",
                        marginBottom: "8px",
                      }}
                    >
                      Стр. {p.page} из {p.totalPages}
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background:
                            "linear-gradient(to right, #d4af37, #f0c84a)",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#d4af37",
                        marginTop: "4px",
                      }}
                    >
                      {pct}% прочитано
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Categories */}
      <Section
        title={`📂 ${t("home.categories", "Категории")}`}
        onMore={() => navigate("/categories")}
      >
        <div className="scroll-row">
          {categories
            .filter((cat) => (cat.count || 0) > 0)
            .map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/books?category=${cat.name}`)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 20px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "100px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(212,175,55,0.4)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-border)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                }}
              >
                <span style={{ fontSize: "28px" }}>{cat.icon}</span>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#f0f4f1",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.name}
                </div>
                {cat.count && (
                  <span
                    className="badge badge-gold"
                    style={{ fontSize: "10px" }}
                  >
                    {cat.count}
                  </span>
                )}
              </div>
            ))}
        </div>
      </Section>

      {/* Featured Books */}
      <Section
        title={`⭐ ${t("home.featuredBooks", "Лучшие книги")}`}
        onMore={() => navigate("/books")}
      >
        <div className="scroll-row">
          {featuredBooks.map((book) => (
            <div key={book.id} style={{ flexShrink: 0 }}>
              <BookCard book={book} size="md" />
            </div>
          ))}
        </div>
      </Section>

      {/* New Books */}
      {newBooks.length > 0 && (
        <Section
          title={`🆕 ${t("home.newBooks", "Новинки")}`}
          onMore={() => navigate("/books?filter=new")}
        >
          <div className="scroll-row">
            {newBooks.map((book) => (
              <div key={book.id} style={{ flexShrink: 0 }}>
                <BookCard book={book} size="md" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Popular Books */}
      <Section
        title={`🔥 ${t("home.popularBooks", "Популярные книги")}`}
        onMore={() => navigate("/books?filter=popular")}
      >
        <div className="scroll-row">
          {popularBooks.map((book) => (
            <div key={book.id} style={{ flexShrink: 0 }}>
              <BookCard book={book} size="md" />
            </div>
          ))}
        </div>
      </Section>

      {/* Biographies */}
      <Section
        title={`👤 ${t("home.scholars", "Биографии учёных")}`}
        onMore={() => navigate("/biographies")}
      >
        <div className="scroll-row">
          {featuredBios.map((bio) => (
            <div
              key={bio.id}
              onClick={() => navigate(`/biographies/${bio.id}`)}
              style={{
                flexShrink: 0,
                width: "160px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(212,175,55,0.4)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-border)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              <div
                style={{
                  height: "120px",
                  background: `linear-gradient(135deg, ${bio.coverColor || "#1a3a2a"}, ${bio.coverColor || "#1a3a2a"}cc)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "44px",
                }}
              >
                {bio.coverEmoji || "👤"}
              </div>
              <div style={{ padding: "10px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#f0f4f1",
                    marginBottom: "4px",
                  }}
                >
                  {bio.name}
                </div>
                <div style={{ fontSize: "10px", color: "#5a7a63" }}>
                  {bio.birthYear}
                  {bio.deathYear ? ` — ${bio.deathYear}` : ""}
                </div>
                <span
                  className="badge badge-gold"
                  style={{ marginTop: "6px", fontSize: "9px" }}
                >
                  {bio.type === "prophet"
                    ? "Пророк"
                    : bio.type === "companion"
                      ? "Сподвижник"
                      : bio.type === "tabiin"
                        ? "Табиин"
                        : bio.type === "modern"
                          ? "Современный"
                          : "Учёный"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Favorites */}
      {favoriteBooks.length > 0 && (
        <Section
          title="❤️ Ваше избранное"
          onMore={() => navigate("/favorites")}
        >
          <div className="scroll-row">
            {favoriteBooks.slice(0, 8).map((book) => (
              <div key={book.id} style={{ flexShrink: 0 }}>
                <BookCard book={book} size="sm" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Random Book */}
      {randomBook && (
        <Section title={`🎲 ${t("home.randomBook", "Случайная книга")}`}>
          <div
            style={{
              display: "flex",
              gap: "24px",
              padding: "24px",
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.05) 0%, var(--color-bg-card) 100%)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "140px",
                background: randomBook.coverColor || "#1a3a2a",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
                flexShrink: 0,
                boxShadow: "8px 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {randomBook.coverEmoji || "📖"}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#f0f4f1",
                  marginBottom: "6px",
                }}
              >
                {randomBook.title}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#9db8a3",
                  marginBottom: "8px",
                }}
              >
                {randomBook.author}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#5a7a63",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                {randomBook.description.slice(0, 180)}...
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/books/${randomBook.id}`)}
                >
                  <BookOpen size={14} />
                  Читать
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => window.location.reload()}
                >
                  <Shuffle size={14} />
                  {t("home.anotherBook", "Другая книга")}
                </button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <Section
          title="🕐 Недавно просмотренные"
          onMore={() => navigate("/history")}
        >
          <div className="scroll-row">
            {history.slice(0, 8).map((item) => (
              <div
                key={item.id + item.visitedAt}
                style={{
                  flexShrink: 0,
                  width: "120px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate(
                    `/${item.type === "book" ? "books" : item.type === "bio" ? "biographies" : item.type}/${item.id}`,
                  )
                }
              >
                <div
                  style={{
                    width: "120px",
                    height: "80px",
                    background: item.coverColor || "#1a3a2a",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  {item.coverEmoji ||
                    (item.type === "book"
                      ? "📖"
                      : item.type === "audio"
                        ? "🎧"
                        : "👤")}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#f0f4f1",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  onMore,
  moreLabel = "Смотреть все",
}: {
  title: string;
  children: React.ReactNode;
  onMore?: () => void;
  moreLabel?: string;
}) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f0f4f1" }}>
          {title}
        </h2>
        {onMore && (
          <button
            onClick={onMore}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              color: "#d4af37",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {moreLabel} <ChevronRight size={14} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
