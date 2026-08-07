import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, PackageCheck, PackageX } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useProductDetail } from "@/hooks/useProducts";
import { formatCurrencyBRL } from "@/utils/format";
import { ROUTES } from "@/constants/routes";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProductDetail(productId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-3 h-4 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message="Não foi possível carregar este produto." onRetry={() => refetch()} />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(ROUTES.products)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-card border border-ink-700 bg-ink-800">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <h1 className="text-3xl">{product.name}</h1>

          <div className="mt-3">
            {outOfStock ? (
              <Badge variant="danger">
                <PackageX className="h-3 w-3" /> Sem estoque
              </Badge>
            ) : (
              <Badge variant="success">
                <PackageCheck className="h-3 w-3" /> {product.stock} em estoque
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <span className="font-display text-2xl text-crimson-400">{formatCurrencyBRL(product.price)}</span>
          </div>

          {product.description && <p className="mt-6 text-bone-400">{product.description}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={ROUTES.contact} size="lg">
              <MessageCircle className="h-4 w-4" /> Entrar em contato para comprar
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}