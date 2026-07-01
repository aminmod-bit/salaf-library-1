import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useStore } from "./store/useStore";
import { loadLibraryData } from "./utils/loadLibraryData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";

import BiographiesPage from "./pages/BiographiesPage";
import BiographyDetailPage from "./pages/BiographyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";
import AdminImportPage from "./pages/admin/AdminImportPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AboutPage from "./pages/AboutPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import BookLanguagesPage from "./pages/BookLanguagesPage";
import ArticlesPage from "./pages/ArticlesPage";
import HadithCatalogPage from "./pages/HadithCatalogPage";
import HadithBookPage from "./pages/HadithBookPage";
import HadithDetailPage from "./pages/HadithDetailPage";
import { AzkarCategoriesPage, AzkarCategoryPage } from "./pages/AzkarPage";
import AdminBookEditorPage from "./pages/AdminBookEditorPage";
import OfflinePage from "./pages/OfflinePage";
import CategoryTreePage from "./pages/CategoryTreePage";
import ThemesPage from "./pages/ThemesPage";

const BookReaderPage = lazy(() => import("./pages/BookReaderPage"));

function PageLoader() {
  return (
    <div style={{
      minHeight: "50vh", display: "flex", alignItems: "center",
      justifyContent: "center", color: "var(--color-gold)", fontWeight: 700,
    }}>
      Загрузка страницы...
    </div>
  );
}

export default function App() {
  const {
    setBooks, setBiographies, setAudioLessons, setFawaid, setCategories, setLoading,
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
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [setAudioLessons, setBiographies, setBooks, setCategories, setFawaid, setLoading]);

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read/');

  // Reader: full-screen, no site layout, but still needs Route for useParams
  if (isReader) {
    return (
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#d4af37' }}>Загрузка...</div>}>
        <Routes location={location}>
          <Route path="/read/:id" element={<BookReaderPage />} />
        </Routes>
      </Suspense>
    );
  }

  // Normal site layout
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Suspense fallback={<PageLoader />}>
            <div className="page-enter" key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/biographies" element={<BiographiesPage />} />
                <Route path="/biographies/:id" element={<BiographyDetailPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/content" element={<AdminContentPage />} />
                <Route path="/admin/import" element={<AdminImportPage />} />
                <Route path="/admin/stats" element={<AdminStatsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/report" element={<ReportIssuePage />} />
                <Route path="/book-languages" element={<BookLanguagesPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/hadith" element={<HadithCatalogPage />} />
                <Route path="/hadith/book/:slug" element={<HadithBookPage />} />
                <Route path="/hadith/book/:bookSlug/:hadithSlug" element={<HadithDetailPage />} />
                <Route path="/azkar" element={<AzkarCategoriesPage />} />
                <Route path="/azkar/category/:slug" element={<AzkarCategoryPage />} />
                <Route path="/azkar/morning" element={<AzkarCategoryPage />} />
                <Route path="/azkar/evening" element={<AzkarCategoryPage />} />
                <Route path="/azkar/prayer" element={<AzkarCategoryPage />} />
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="/categories" element={<CategoryTreePage />} />
                <Route path="/settings/themes" element={<ThemesPage />} />
                <Route path="/admin/books-editor" element={<AdminBookEditorPage />} />
              </Routes>
            </div>
          </Suspense>
        </div>
      </div>
      <BottomNav />
      <PwaInstallPrompt />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-bg-card)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

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
          .main-content { margin-left: 0; }
          .page-content { padding: 16px; }
        }
        @media (max-width: 768px) {
          .page-content { padding: 12px; padding-bottom: 80px; }
        }
      `}</style>
    </div>
  );
}
