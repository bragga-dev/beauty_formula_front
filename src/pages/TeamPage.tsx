import { useState } from "react";
import { Users } from "lucide-react";
import { EmployeeCard } from "@/features/team/EmployeeCard";
import { EmployeeCardSkeleton } from "@/features/team/EmployeeCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/tables/Pagination";
import { useTeam } from "@/hooks/useTeam";

export function TeamPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useTeam(page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-widest text-crimson-400">Nosso Time</span>
      <h1 className="mt-2 text-4xl">Especialistas que fazem a diferença</h1>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <EmployeeCardSkeleton key={i} />)}
        {isError && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}
        {!isLoading && !isError && data?.items.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState icon={Users} title="Nenhum profissional cadastrado" />
          </div>
        )}
        {data?.items.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
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