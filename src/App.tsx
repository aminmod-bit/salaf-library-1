import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "@/i18n";
import HomePage from "@/pages/HomePage";
import { BooksFoldersPage, BookFolderPage } from "@/pages/BooksPage";
import BookReaderPage from "@/pages/PDFReaderPage";
import { AzkarFoldersPage, AzkarFolderPage } from "@/pages/AzkarPage";
import { HadithCollectionsPage, HadithCollectionPage } from "@/pages/HadithPage";
import { ArticlesFoldersPage, ArticleFolderPage, ArticleViewPage } from "@/pages/ArticlesPage";
import { BiographiesFoldersPage, BiographiesFolderPage, BiographyViewPage } from "@/pages/BiographiesPage";
import LibraryPage, { LibraryLanguagePage } from "@/pages/LibraryPage";
import { FavoritesPage, HistoryPage, SearchPage } from "@/pages/UtilityPages";
import AdminPage from "@/pages/AdminPage";
import { AboutPage, NotFoundPage } from "@/pages/InfoPages";
import { setLanguage } from "@/i18n";

export default function App() {
  useEffect(() => {
    // Set initial direction on mount
    const lng = (localStorage.getItem("salaf.lang") || "ru");
    setLanguage(lng);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksFoldersPage />} />
        <Route path="/books/folder/:folderKey" element={<BookFolderPage />} />
        <Route path="/books/reader/:bookId" element={<BookReaderPage />} />

        <Route path="/azkar" element={<AzkarFoldersPage />} />
        <Route path="/azkar/folder/:folderKey" element={<AzkarFolderPage />} />

        <Route path="/hadith" element={<HadithCollectionsPage />} />
        <Route path="/hadith/collection/:collectionId" element={<HadithCollectionPage />} />

        <Route path="/articles" element={<ArticlesFoldersPage />} />
        <Route path="/articles/folder/:folderKey" element={<ArticleFolderPage />} />
        <Route path="/articles/view/:articleId" element={<ArticleViewPage />} />

        <Route path="/biographies" element={<BiographiesFoldersPage />} />
        <Route path="/biographies/folder/:folderKey" element={<BiographiesFolderPage />} />
        <Route path="/biographies/view/:biographyId" element={<BiographyViewPage />} />

        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:langCode" element={<LibraryLanguagePage />} />

        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}