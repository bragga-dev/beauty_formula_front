import { useState } from "react";
import { Plus, Power, Trash2, Scissors } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePublicServices } from "@/hooks/useServices";
import { useMyServices, useMyServiceMutations } from "@/hooks/useMyServices";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDuration } from "@/utils/format";
import type { ApiError } from "@/types/common";
import type { EmployeeServiceOut } from "@/types/employee";

export function DashboardMyServicesPage() {
  const { data, isLoading, isError, refetch } = useMyServices();
  const { data: catalog } = usePublicServices(1, 100);
  const { create, activate, deactivate, remove } = useMyServiceMutations();
  const { push } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<EmployeeServiceOut | null>(null);

  const linkedIds = new Set(data?.items.map((l) => l.service_id));
  const availableToAdd = catalog?.items.filter((s) => !linkedIds.has(s.id)) ?? [];

  async function handleAdd(serviceId: string) {
    try {
      await create.mutateAsync(serviceId);
      push("Serviço vinculado!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleToggle(link: EmployeeServiceOut) {
    try {
      if (link.is_active) {
        await deactivate.mutateAsync(link.id);
      } else {
        await activate.mutateAsync(link.id);
      }
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRemove() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      push("Vínculo removido.", "success");
      setRemoving(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Meus Serviços</h1>
          <p className="mt-1 text-bone-500">Escolha quais serviços você atende.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Vincular serviço
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState icon={Scissors} title="Nenhum serviço vinculado" actionLabel="Vincular serviço" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="grid gap-3">
            {data?.items.map((link) => (
              <Card key={link.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-bone-50">{link.service.name}</p>
                  <p className="mt-1 text-xs text-bone-500">
                    {formatDuration(link.service.duration_minutes)} · {formatCurrencyBRL(link.service.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={link.is_active ? "success" : "neutral"}>{link.is_active ? "Ativo" : "Inativo"}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(link)} aria-label="Ativar/desativar">
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoving(link)} aria-label="Remover">
                    <Trash2 className="h-4 w-4 text-danger-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Vincular serviço">
        <div className="space-y-2">
          {availableToAdd.length === 0 && (
            <p className="text-sm text-bone-500">Todos os serviços do catálogo já estão vinculados a você.</p>
          )}
          {availableToAdd.map((service) => (
            <button
              key={service.id}
              onClick={() => handleAdd(service.id)}
              disabled={create.isPending}
              className="flex w-full items-center justify-between rounded-card border border-ink-700 p-3 text-left text-sm transition-colors hover:border-gold-400/50 disabled:opacity-50"
            >
              <span className="text-bone-100">{service.name}</span>
              <span className="text-crimson-400">{formatCurrencyBRL(service.price)}</span>
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removing}
        title="Remover vínculo"
        description={`Deseja remover "${removing?.service.name}" da sua lista de serviços?`}
        variant="danger"
        confirmLabel="Remover"
        isLoading={remove.isPending}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
