import { Link } from "react-router-dom";
import { ArrowUpRight, PackageX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyBRL } from "@/utils/format";
import type { ProductOut } from "@/types/products";

export function ProductCard({ product }: { product: ProductOut }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link to={ROUTES.productDetail(product.id)}>
      <Card className="group h-full overflow-hidden transition-all hover:border-gold-400/50 hover:shadow-elevated">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-700">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/70 text-bone-200">
              <PackageX className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Esgotado</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base uppercase tracking-wide text-bone-50">{product.name}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {product.description && (
            <p className="mt-2 line-clamp-2 text-sm text-bone-500">{product.description}</p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-4">
            {outOfStock ? (
              <Badge variant="neutral">Sem estoque</Badge>
            ) : (
              <span className="text-xs text-bone-500">{product.stock} em estoque</span>
            )}
            <span className="font-display text-lg text-crimson-400">{formatCurrencyBRL(product.price)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}