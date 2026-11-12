import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ROUTES } from "@/constants/routes";
import formula1Image from "@/assets/formula-1.jpg";

// A senha chega no fragmento da URL (#...), que o navegador NÃO envia ao servidor.
// Lemos uma vez e limpamos o endereço pra ela não ficar visível/no histórico.
function readPasswordFromHash(): string {
  const raw = window.location.hash.slice(1);
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export function CopyPasswordPage() {
  const [password] = useState(readPasswordFromHash);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleCopy() {
    const ok = await copyText(password);
    setCopied(ok);
    setFailed(!ok);
    if (ok) setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Link to={ROUTES.home} className="flex items-center gap-3">
        <img src={formula1Image} alt="Fórmula da Beleza" className="h-12 w-auto object-contain" />
        <span className="font-display text-xl font-bold text-bone-50">Fórmula da Beleza</span>
      </Link>

      {password ? (
        <>
          <div>
            <h1 className="text-2xl">Sua senha de acesso</h1>
            <p className="mt-2 text-bone-500">Copie a senha e cole no login. Ela é exibida só nesta tela.</p>
          </div>
          <code className="select-all rounded-lg border border-dashed border-gold-500/40 bg-ink-900 px-6 py-3 font-mono text-xl font-bold tracking-widest text-gold-400">
            {password}
          </code>
          <Button onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Senha copiada!" : "Copiar senha"}
          </Button>
          {failed && <p className="text-sm text-danger-500">Não foi possível copiar. Selecione a senha acima e copie manualmente.</p>}
          <ButtonLink to={ROUTES.login} variant="ghost">
            Ir para o login
          </ButtonLink>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl">Senha não encontrada</h1>
            <p className="mt-2 text-bone-500">Abra esta página pelo botão “Copiar senha” do e-mail que você recebeu.</p>
          </div>
          <ButtonLink to={ROUTES.login}>Ir para o login</ButtonLink>
        </>
      )}
    </div>
  );
}