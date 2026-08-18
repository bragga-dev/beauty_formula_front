import { useEffect, useRef, useState } from "react";
import { useGoogleIdentityScript } from "@/hooks/useGoogleIdentityScript";
import { GOOGLE_CLIENT_ID } from "@/constants/env";
import { cn } from "@/utils/cn";

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  disabled?: boolean;
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
}

export function GoogleAuthButton({ text = "continue_with", disabled, onCredential, onError }: GoogleAuthButtonProps) {
  const { isReady, error } = useGoogleIdentityScript();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // O botão só é renderizado depois que sabemos o tamanho real do
    // container (ver `width === null` no efeito abaixo) — então a PRIMEIRA
    // medição aplica na hora, sem debounce (nada foi renderizado ainda,
    // não tem o que cancelar). Só medições seguintes (resize de verdade da
    // janela, não o layout inicial se ajustando) passam por debounce.
    let timeout: ReturnType<typeof setTimeout>;
    let hasMeasured = false;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (!w) return;

      if (!hasMeasured) {
        hasMeasured = true;
        setWidth(Math.round(w));
        return;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWidth((prev) => (prev === null || Math.abs(prev - w) > 8 ? Math.round(w) : prev));
      }, 150);
    });
    observer.observe(el);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isReady || width === null || !buttonRef.current || !window.google) return;

    if (!GOOGLE_CLIENT_ID) {
      onError("Login com Google indisponível no momento.");
      return;
    }

    // StrictMode (dev) roda este efeito 2x de propósito: monta → limpa →
    // monta de novo, pra flagrar side effects sem cleanup. Sem essa
    // proteção, cada montagem chamava initialize()+renderButton() de
    // verdade, disparando 2 requisições reais pro Google pro mesmo
    // container — a primeira abortada, o Google devolvendo 403 pra sessão
    // órfã. Adiando a chamada de verdade pro próximo tick (setTimeout 0) e
    // cancelando no cleanup, só a montagem que "sobrevive" chega a chamar
    // o Google. Em produção o StrictMode não dobra efeitos, então isso
    // roda uma única vez normalmente — sem delay perceptível.
    const timeoutId = setTimeout(() => {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            onError("Não foi possível autenticar com o Google.");
            return;
          }
          onCredential(response.credential);
        },
        ux_mode: "popup",
        cancel_on_tap_outside: true,
      });

      if (!buttonRef.current) return;
      buttonRef.current.innerHTML = "";
      window.google!.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text,
        logo_alignment: "left",
        locale: "pt-BR",
        width: Math.min(Math.max(width, 200), 400),
      });
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, text, width]);

  return (
    <div ref={wrapperRef} className={cn("flex w-full justify-center", disabled && "pointer-events-none opacity-50")}>
      <div ref={buttonRef} />
      {(!isReady || width === null) && !error && <div className="h-11 w-full animate-pulse rounded-card bg-ink-800" />}
    </div>
  );
}