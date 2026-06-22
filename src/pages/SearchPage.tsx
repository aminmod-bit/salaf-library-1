import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, BookOpen, Users } from "lucide-react";
import { useStore } from "../store/useStore";
import BookCard from "../components/BookCard";

type TabType = "all" | "books" | "bios";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { books, biographies } = useStore();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [tab, setTab] = useState<TabType>("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const results = useMemo(() => {
    if (!query.trim()) return { books: [], bios: [] };
    const q = query.toLowerCase();

    return {
      books: books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)),
      ),
      bios: biographies.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.nameAr || "").includes(q) ||
          b.description.toLowerCase().includes(q),
      ),
    };
  }, [query, books, biographies]);

  const total = results.books.length + results.bios.length;

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    { id: "all", label: "Все", icon: <Search size={14} />, count: total },
    {
      id: "books",
      label: "Книги",
      icon: <BookOpen size={14} />,
      count: results.books.length,
    },
    {
      id: "bios",
      label: "Биографии",
      icon: <Users size={14} />,
      count: results.bios.length,
    },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#f0f4f1",
            marginBottom: "16px",
          }}
        >
          🔍 Поиск
        </h1>

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--color-bg-card)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <Search size={20} color="#d4af37" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по всей библиотеке..."
            autoFocus
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "#f0f4f1",
              fontSize: "17px",
              fontFamily: "inherit",
              flex: 1,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "#5a7a63",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {!query.trim() ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#5a7a63" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#9db8a3",
              marginBottom: "8px",
            }}
          >
            Начните поиск
          </div>
          <div style={{ fontSize: "14px" }}>
            Ищите книги, авторов и биографии
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div style={{ marginBottom: "20px" }}>
            <span style={{ color: "#9db8a3", fontSize: "14px" }}>
              Найдено{" "}
              <span style={{ color: "#d4af37", fontWeight: 700 }}>{total}</span>{" "}
              результатов по запросу «{query}»
            </span>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  background:
                    tab === t.id
                      ? "rgba(212,175,55,0.15)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tab === t.id ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: tab === t.id ? "#d4af37" : "#9db8a3",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {t.icon}
                {t.label}
                {t.count > 0 && (
                  <span
                    style={{
                      background:
                        tab === t.id
                          ? "rgba(212,175,55,0.3)"
                          : "rgba(255,255,255,0.1)",
                      borderRadius: "100px",
                      padding: "1px 6px",
                      fontSize: "11px",
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {total === 0 ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#5a7a63" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>😔</div>
              <div
                style={{ fontSize: "18px", fontWeight: 600, color: "#9db8a3" }}
              >
                Ничего не найдено
              </div>
              <div style={{ fontSize: "14px", marginTop: "8px" }}>
                Попробуйте другие ключевые слова
              </div>
            </div>
          ) : (
            <div>
              {/* Books */}
              {(tab === "all" || tab === "books") &&
                results.books.length > 0 && (
                  <Section title={`📚 Книги (${results.books.length})`}>
                    <div className="books-grid">
                      {results.books
                        .slice(0, tab === "all" ? 6 : 100)
                        .map((b) => (
                          <BookCard key={b.id} book={b} />
                        ))}
                    </div>
                    {tab === "all" && results.books.length > 6 && (
                      <button
                        onClick={() => setTab("books")}
                        className="btn-ghost"
                        style={{ marginTop: "12px" }}
                      >
                        Показать все книги ({results.books.length})
                      </button>
                    )}
                  </Section>
                )}

              {/* Biographies */}
              {(tab === "all" || tab === "bios") && results.bios.length > 0 && (
                <Section title={`👤 Биографии (${results.bios.length})`}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {results.bios
                      .slice(0, tab === "all" ? 4 : 100)
                      .map((bio) => (
                        <div
                          key={bio.id}
                          onClick={() => navigate(`/biographies/${bio.id}`)}
                          style={{
                            display: "flex",
                            gap: "14px",
                            padding: "14px",
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor =
                              "rgba(212,175,55,0.4)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor =
                              "var(--color-border)")
                          }
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: bio.coverColor || "#1a3a2a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            {bio.coverEmoji || "👤"}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#f0f4f1",
                              }}
                            >
                              {bio.name}
                            </div>
                            {bio.nameAr && (
                              <div
                                style={{
                                  fontFamily: "Amiri, serif",
                                  fontSize: "13px",
                                  color: "#d4af37",
                                  direction: "rtl",
                                }}
                              >
                                {bio.nameAr}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#9db8a3",
                                marginTop: "3px",
                              }}
                            >
                              {bio.description.slice(0, 100)}...
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: "#f0f4f1",
          marginBottom: "14px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
