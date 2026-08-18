import { QrCode } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Selos das formas de pagamento aceitas.
 *
 * São "chips" com o nome de cada bandeira estilizado na cor característica
 * dela — não é uma reprodução pixel-a-pixel do logotipo oficial (evita
 * qualquer dor de cabeça com uso de marca registrada), mas comunica a
 * mesma informação de forma reconhecível, do jeito que costuma aparecer
 * em rodapé de e-commerce.
 *
 * Pra atualizar a lista de bandeiras aceitas, edite só o array `CARD_BRANDS`
 * abaixo.
 */
const CARD_BRANDS: { name: string; className: string }[] = [
  { name: "Visa", className: "text-[#1A1F71]" },
  { name: "Mastercard", className: "text-[#EB001B]" },
  { name: "Elo", className: "text-[#FFCB05]" },
  { name: "Diners Club", className: "text-[#0079BE]" },
  { name: "Discover", className: "text-[#FF6000]" },
  { name: "Amex", className: "text-[#2E77BC]" },
  { name: "Cabal", className: "text-[#00A9E0]" },
  { name: "Banescard", className: "text-[#0056A3]" },
  { name: "Credz", className: "text-[#8DC63F]" },
  { name: "Sorocred", className: "text-[#E30613]" },
  { name: "JCB", className: "text-[#0B4EA2]" },
];

interface PaymentBrandsProps {
  className?: string;
  /** "chips": selos brancos (bom em fundo escuro, ex. rodapé). "inline": só texto discreto (bom em cards claros). */
  variant?: "chips" | "inline";
}

export function PaymentBrands({ className, variant = "chips" }: PaymentBrandsProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bone-500", className)}>
        <span className="inline-flex items-center gap-1 font-medium text-[#32BCAD]">
          <QrCode className="h-3.5 w-3.5" /> Pix
        </span>
        <span aria-hidden className="text-ink-600">·</span>
        <span>{CARD_BRANDS.map((b) => b.name).join(" · ")}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex h-7 items-center gap-1 rounded-md bg-bone-50 px-2.5 text-xs font-bold text-[#32BCAD]">
        <QrCode className="h-3.5 w-3.5" /> Pix
      </span>
      {CARD_BRANDS.map((brand) => (
        <span
          key={brand.name}
          className={cn(
            "flex h-7 items-center rounded-md bg-bone-50 px-2.5 text-xs font-bold",
            brand.className,
          )}
        >
          {brand.name}
        </span>
      ))}
    </div>
  );
}