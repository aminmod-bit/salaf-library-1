import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', document.baseURI || window.location.origin + import.meta.env.BASE_URL).toString();
    navigator.serviceWorker.register(swUrl).catch(() => {
      // PWA registration is optional; the app remains fully usable without it.
    });
  });
}
