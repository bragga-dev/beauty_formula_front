import { useState } from "react";
import { Search, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ProductCard } from "@/features/products/ProductCard";
import { ProductCardSkeleton } from "@/features/products/ProductCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/tables/Pagination";
import { usePublicProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 12;
// Página de vitrine pública: catálogo é pequeno o bastante pra buscar tudo
// de uma vez e paginar no client, permitindo que a busca encontre produtos
// em qualquer página — não apenas nos itens da página atualmente carregada.
const FETCH_ALL_SIZE = 500;

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = usePublicProducts(1, FETCH_ALL_SIZE);

  const filtered =
    data?.items.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase())) ?? [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-crimson-400">Loja</span>
          <h1 className="mt-2 text-4xl">Nossos Produtos</h1>
        </div>
        <Input
          placeholder="Buscar produto..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        {isError && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}
        {!isLoading && !isError && paginated.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={PackageSearch}
              title="Nenhum produto encontrado"
              description="Tente buscar por outro termo."
            />
          </div>
        )}
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="mt-8">
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}