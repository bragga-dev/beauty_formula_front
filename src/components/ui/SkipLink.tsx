interface SkipLinkProps {
  targetId?: string;
}

/**
 * Fica fora da tela até o usuário navegar até ele via teclado (Tab) — aí
 * aparece no canto superior esquerdo. Deixa quem usa leitor de tela ou
 * navega só com teclado pular o menu e ir direto pro conteúdo da página,
 * sem precisar passar por todos os links do header primeiro.
 */
export function SkipLink({ targetId = "main-content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-card focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:uppercase focus:tracking-wide focus:text-ink-950 focus:shadow-elevated"
    >
      Pular para o conteúdo
    </a>
  );
}