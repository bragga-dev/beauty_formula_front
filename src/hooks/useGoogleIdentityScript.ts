import { useEffect, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o script do Google.")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o script do Google."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Carrega o script do Google Identity Services sob demanda (apenas nas
 * telas de login/cadastro), evitando adicioná-lo no index.html global.
 */
export function useGoogleIdentityScript() {
  const [isReady, setIsReady] = useState(!!window.google?.accounts?.id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  return { isReady, error };
}