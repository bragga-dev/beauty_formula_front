import { useState } from "react";
import { Briefcase, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RegisterManagerModal } from "@/features/managers/RegisterManagerModal";
import { EditManagerModal } from "@/features/managers/EditManagerModal";
import { useManagers, useManagerMutations } from "@/hooks/useManagers";
import { useToast } from "@/app/providers/toast-context";
import { formatDate, initials } from "@/utils/format";
import type { ManagerCreateInput, ManagerOut } from "@/types/manager";
import type { ApiError } from "@/types/common";

function managerName(m: ManagerOut) {
  return [m.first_name, m.last_name].filter(Boolean).join(" ") || null;
}

export function DashboardManagersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useManagers(page, 10);
  const { create, remove, deactivate, reactivate } = useManagerMutations();
  const { push } = useToast();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [editing, setEditing] = useState<ManagerOut | null>(null);
  const [deleting, setDeleting] = useState<ManagerOut | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<ManagerOut | null>(null);

  async function handleRegister(payload: ManagerCreateInput) {
    try {
      await create.mutateAsync(payload);
      push("Gerente cadastrado! Um e-mail com a senha temporária foi enviado.", "success");
      setRegisterOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      push("Gerente excluído.", "success");
      setDeleting(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleToggleStatus() {
    if (!togglingStatus) return;
    try {
      if (togglingStatus.user.is_active) {
        await deactivate.mutateAsync(togglingStatus.user.id);
        push("Gerente desativado.", "success");
      } else {
        await reactivate.mutateAsync(togglingStatus.user.id);
        push("Gerente reativado.", "success");
      }
      setTogglingStatus(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  function renderActions(m: ManagerOut) {
    return (
      <>
        <Button variant="ghost" size="icon" onClick={() => setEditing(m)} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTogglingStatus(m)}
          aria-label={m.user.is_active ? "Desativar" : "Reativar"}
        >
          {m.user.is_active ? (
            <PowerOff className="h-4 w-4 text-danger-500" />
          ) : (
            <Power className="h-4 w-4 text-success-500" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeleting(m)} aria-label="Excluir">
          <Trash2 className="h-4 w-4 text-danger-500" />
        </Button>
      </>
    );
  }

  const columns: Column<ManagerOut>[] = [
    {
      header: "Gerente",
      cell: (m) => {
        const name = managerName(m);
        return (
          <div className="flex items-center gap-3">
            <Avatar src={m.photo_url} alt={name ?? m.user.email} fallback={initials(m.first_name, m.last_name) || initials(m.user.email)} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-bone-50">{name ?? "—"}</p>
              <p className="truncate text-xs text-bone-600">{m.user.email}</p>
            </div>
          </div>
        );
      },
    },
    { header: "Cadastrado em", cell: (m) => formatDate(m.user.date_joined), hideOnMobile: true },
    {
      header: "Status",
      cell: (m) => (
        <Badge variant={m.user.is_active ? "success" : "neutral"}>{m.user.is_active ? "Ativo" : "Inativo"}</Badge>
      ),
    },
    {
      header: "Ações",
      cell: (m) => <div className="flex justify-end gap-1">{renderActions(m)}</div>,
      className: "text-right",
    },
  ];

  function renderManagerCard(m: ManagerOut) {
    const name = managerName(m);
    return (
      <MobileRowCard
        media={<Avatar src={m.photo_url} alt={name ?? m.user.email} fallback={initials(m.first_name, m.last_name) || initials(m.user.email)} size="sm" />}
        title={name ?? "—"}
        subtitle={m.user.email}
        badges={<Badge variant={m.user.is_active ? "success" : "neutral"}>{m.user.is_active ? "Ativo" : "Inativo"}</Badge>}
        meta={[{ label: "Cadastrado em", value: formatDate(m.user.date_joined) }]}
        actions={renderActions(m)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Gerentes</h1>
          <p className="mt-1 text-bone-500">Contas com acesso de gestão ao painel (somente o administrador cadastra).</p>
        </div>
        <Button onClick={() => setRegisterOpen(true)}>
          <Plus className="h-4 w-4" /> Cadastrar gerente
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum gerente cadastrado"
            actionLabel="Cadastrar gerente"
            onAction={() => setRegisterOpen(true)}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(m) => m.id}
              isLoading={isLoading}
              renderCard={renderManagerCard}
            />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <RegisterManagerModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={handleRegister}
        isSubmitting={create.isPending}
      />

      <EditManagerModal manager={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir gerente"
        description={`Tem certeza que deseja excluir "${deleting ? (managerName(deleting) ?? deleting.user.email) : ""}"? A conta será removida e essa ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={!!togglingStatus}
        title={togglingStatus?.user.is_active ? "Desativar gerente" : "Reativar gerente"}
        description={
          togglingStatus?.user.is_active
            ? `"${togglingStatus ? (managerName(togglingStatus) ?? togglingStatus.user.email) : ""}" perderá acesso à plataforma até ser reativado.`
            : `"${togglingStatus ? (managerName(togglingStatus) ?? togglingStatus.user.email) : ""}" voltará a ter acesso à plataforma.`
        }
        variant={togglingStatus?.user.is_active ? "danger" : "primary"}
        confirmLabel={togglingStatus?.user.is_active ? "Desativar" : "Reativar"}
        isLoading={deactivate.isPending || reactivate.isPending}
        onConfirm={handleToggleStatus}
        onCancel={() => setTogglingStatus(null)}
      />
    </div>
  );
}