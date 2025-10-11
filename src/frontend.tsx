/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import i18n from "./i18n"; // initialize i18next

const elem = document.getElementById("root")!;
// Keep <html lang> in sync with current language
const setHtmlLang = () => {
  const html = document.documentElement;
  if (html) html.setAttribute("lang", i18n.language ?? "en");
};
setHtmlLang();
i18n.on("languageChanged", setHtmlLang);

// Update document title and meta description based on translations
const setHeadTranslations = () => {
  document.title = i18n.t("app.title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", i18n.t("app.description"));
  const skip = document.querySelector('.skip-link');
  if (skip) skip.textContent = i18n.t("a11y.skip_to_main");
};
setHeadTranslations();
i18n.on("languageChanged", setHeadTranslations);
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
