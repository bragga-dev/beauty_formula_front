import { useState } from "react";
import { Search, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ProductCard } from "@/features/products/ProductCard";
import { ProductCardSkeleton } from "@/features/products/ProductCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/tables/Pagination";
import { usePublicProducts } from "@/hooks/useProducts";

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = usePublicProducts(page, 12);

  const filtered = data?.items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) ?? [];

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
          onChange={(e) => setSearch(e.target.value)}
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
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={PackageSearch}
              title="Nenhum produto encontrado"
              description="Tente buscar por outro termo."
            />
          </div>
        )}
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data && (
        <div className="mt-8">
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}