import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useStore } from "./store/useStore";
import { loadLibraryData } from "./utils/loadLibraryData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import GlobalTextTranslator from "./components/GlobalTextTranslator";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";

import BiographiesPage from "./pages/BiographiesPage";
import BiographyDetailPage from "./pages/BiographyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";
import AdminImportPage from "./pages/admin/AdminImportPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import GoalsPage from "./pages/GoalsPage";
import ReadingPlansPage from "./pages/ReadingPlansPage";
import AboutPage from "./pages/AboutPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import BookLanguagesPage from "./pages/BookLanguagesPage";
import ArticlesPage from "./pages/ArticlesPage";
import HadithPage from "./pages/HadithPage";
import AzkarPage from "./pages/AzkarPage";
import AdminBookEditorPage from "./pages/AdminBookEditorPage";

const BookReaderPage = lazy(() => import("./pages/BookReaderPage"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#d4af37",
        fontWeight: 700,
      }}
    >
      Загрузка страницы...
    </div>
  );
}

export default function App() {
  const {
    setBooks,
    setBiographies,
    setAudioLessons,
    setFawaid,
    setCategories,
    setLoading,
  } = useStore();

  useEffect(() => {
    let mounted = true;

    loadLibraryData()
      .then((data) => {
        if (!mounted) return;
        setBooks(data.books);
        setBiographies(data.biographies);
        setAudioLessons(data.audioLessons);
        setFawaid(data.fawaid);
        setCategories(data.categories);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [
    setAudioLessons,
    setBiographies,
    setBooks,
    setCategories,
    setFawaid,
    setLoading,
  ]);

  return (
    <HashRouter>
      <GlobalTextTranslator />
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/read/:id" element={<BookReaderPage />} />
                <Route path="/biographies" element={<BiographiesPage />} />
                <Route
                  path="/biographies/:id"
                  element={<BiographyDetailPage />}
                />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/import" element={<AdminImportPage />} />
                <Route path="/admin/stats" element={<AdminStatsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reading-plans" element={<ReadingPlansPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/report" element={<ReportIssuePage />} />
                <Route path="/book-languages" element={<BookLanguagesPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/hadith" element={<HadithPage />} />
                <Route path="/azkar" element={<AzkarPage />} />
                <Route
                  path="/admin/books-editor"
                  element={<AdminBookEditorPage />}
                />
              </Routes>
            </Suspense>
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#112a1a",
              color: "#f0f4f1",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg-primary);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
        }

        .page-content {
          flex: 1;
          padding: 24px;
          padding-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
          }

          .page-content {
            padding: 16px;
          }
        }
      `}</style>
    </HashRouter>
  );
}
