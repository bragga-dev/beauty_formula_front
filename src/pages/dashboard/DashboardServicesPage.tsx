import { useState } from "react";
import { Plus, Pencil, Trash2, Power, Scissors, ImageIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ServiceFormModal } from "@/features/services/ServiceFormModal";
import { useAdminServices, useServiceMutations } from "@/hooks/useAdminServices";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDuration } from "@/utils/format";
import type { ServicePrivateOut, ServiceCreateInput } from "@/types/service";
import type { ApiError } from "@/types/common";

export function DashboardServicesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminServices(page);
  const { create, update, remove, activate, deactivate } = useServiceMutations();
  const { push } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePrivateOut | null>(null);
  const [deletingService, setDeletingService] = useState<ServicePrivateOut | null>(null);

  function openCreate() {
    setEditingService(null);
    setFormOpen(true);
  }

  function openEdit(service: ServicePrivateOut) {
    setEditingService(service);
    setFormOpen(true);
  }

  async function handleFormSubmit(payload: ServiceCreateInput, image?: File | null) {
    try {
      if (editingService) {
        await update.mutateAsync({ id: editingService.id, payload });
      } else {
        await create.mutateAsync({ payload, image });
      }
      push(editingService ? "Serviço atualizado!" : "Serviço criado!", "success");
      setFormOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleToggleActive(service: ServicePrivateOut) {
    try {
      if (service.is_active) {
        await deactivate.mutateAsync(service.id);
        push("Serviço desativado.", "success");
      } else {
        await activate.mutateAsync(service.id);
        push("Serviço ativado.", "success");
      }
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleDelete() {
    if (!deletingService) return;
    try {
      await remove.mutateAsync(deletingService.id);
      push("Serviço excluído.", "success");
      setDeletingService(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<ServicePrivateOut>[] = [
    {
      header: "Serviço",
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-card bg-ink-700">
            {s.image_url ? (
              <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="m-auto mt-2.5 h-5 w-5 text-bone-600" />
            )}
          </div>
          <span className="font-medium text-bone-50">{s.name}</span>
        </div>
      ),
    },
    { header: "Duração", cell: (s) => formatDuration(s.duration_minutes), hideOnMobile: true },
    { header: "Preço", cell: (s) => formatCurrencyBRL(s.price) },
    {
      header: "Status",
      cell: (s) => <Badge variant={s.is_active ? "success" : "neutral"}>{s.is_active ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      header: "Ações",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(s)} aria-label="Ativar/desativar">
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingService(s)} aria-label="Excluir">
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Serviços</h1>
          <p className="mt-1 text-bone-500">Gerencie o catálogo de serviços da Fórmula da Beleza.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Nenhum serviço cadastrado"
            description="Crie o primeiro serviço para começar a receber agendamentos."
            actionLabel="Novo serviço"
            onAction={openCreate}
          />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(s) => s.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ServiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        service={editingService}
        isSubmitting={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deletingService}
        title="Excluir serviço"
        description={`Tem certeza que deseja excluir "${deletingService?.name}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingService(null)}
      />
    </div>
  );
}
