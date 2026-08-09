import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { PAGE_TITLES, SITE_TITLE } from "@/constants/pageTitles";

/**
 * Atualiza `document.title` a cada troca de rota, evitando que todas as
 * abas do navegador mostrem o mesmo título fixo ("Fórmula da Beleza").
 * Também ajuda o SEO básico, já que buscadores indexam o <title>.
 *
 * Renderizado uma vez dentro do AppRouter — cobre todas as rotas
 * automaticamente via o mapa em `constants/pageTitles.ts`.
 */
export function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const matchedEntry = Object.entries(PAGE_TITLES).find(([pattern]) =>
      matchPath({ path: pattern, end: true }, location.pathname),
    );
    const pageTitle = matchedEntry?.[1];
    document.title = pageTitle ? `${pageTitle} | ${SITE_TITLE}` : SITE_TITLE;
  }, [location.pathname]);

  return null;
}