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
  const [width, setWidth] = useState(320);

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.round(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isReady || !buttonRef.current || !window.google) return;

    if (!GOOGLE_CLIENT_ID) {
      onError("Login com Google indisponível no momento.");
      return;
    }

    window.google.accounts.id.initialize({
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

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text,
      logo_alignment: "left",
      locale: "pt-BR",
      width: Math.min(Math.max(width, 200), 400),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, text, width]);

  return (
    <div ref={wrapperRef} className={cn("flex w-full justify-center", disabled && "pointer-events-none opacity-50")}>
      <div ref={buttonRef} />
      {!isReady && !error && <div className="h-11 w-full animate-pulse rounded-card bg-ink-800" />}
    </div>
  );
}