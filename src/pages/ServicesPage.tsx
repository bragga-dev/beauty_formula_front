import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ServiceCard } from "@/features/services/ServiceCard";
import { ServiceCardSkeleton } from "@/features/services/ServiceCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/tables/Pagination";
import { usePublicServices } from "@/hooks/useServices";

export function ServicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = usePublicServices(page, 12);

  const filtered = data?.items.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-crimson-400">Catálogo</span>
          <h1 className="mt-2 text-4xl">Nossos Serviços</h1>
        </div>
        <Input
          placeholder="Buscar serviço..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        {isError && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState icon={Search} title="Nenhum serviço encontrado" description="Tente buscar por outro termo." />
          </div>
        )}
        {filtered.map((service) => (
          <ServiceCard key={service.id} service={service} />
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
