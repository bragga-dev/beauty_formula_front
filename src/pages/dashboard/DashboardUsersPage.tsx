import { useState } from "react";
import { Plus, ShieldCheck, Power, PowerOff, Search, Users as UsersIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RegisterEmployeeModal } from "@/features/users/RegisterEmployeeModal";
import { useAdminUsers, useUserMutations } from "@/hooks/useAdminUsers";
import { useToast } from "@/app/providers/toast-context";
import { formatDate, initials } from "@/utils/format";
import type { UserAdminOut, UserRole } from "@/types/user";
import type { ApiError } from "@/types/common";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  employee: "Funcionário",
  client: "Cliente",
};

const ROLE_VARIANT: Record<UserRole, "gold" | "crimson" | "neutral"> = {
  admin: "crimson",
  employee: "gold",
  client: "neutral",
};

export function DashboardUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const { data, isLoading, isError, refetch } = useAdminUsers(page, 10, {
    search,
    role: roleFilter,
    is_active: statusFilter === "" ? "" : statusFilter === "true",
  });
  const { registerEmployee, promoteToEmployee, deactivate, reactivate } = useUserMutations();
  const { push } = useToast();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [promoting, setPromoting] = useState<UserAdminOut | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<UserAdminOut | null>(null);

  async function handleRegisterEmployee(email: string) {
    try {
      await registerEmployee.mutateAsync(email);
      push("Funcionário cadastrado! Um e-mail com a senha temporária foi enviado.", "success");
      setRegisterOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handlePromote() {
    if (!promoting) return;
    try {
      await promoteToEmployee.mutateAsync(promoting.id);
      push(`${promoting.display_name ?? promoting.email} agora é funcionário.`, "success");
      setPromoting(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleToggleStatus() {
    if (!togglingStatus) return;
    try {
      if (togglingStatus.is_active) {
        await deactivate.mutateAsync(togglingStatus.id);
        push("Usuário desativado.", "success");
      } else {
        await reactivate.mutateAsync(togglingStatus.id);
        push("Usuário reativado.", "success");
      }
      setTogglingStatus(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<UserAdminOut>[] = [
    {
      header: "Usuário",
      cell: (u) => {
        const name = u.display_name ?? u.email;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={u.photo_url} alt={name} fallback={initials(u.display_name ?? u.email)} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-bone-50">{u.display_name ?? "—"}</p>
              <p className="truncate text-xs text-bone-600">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      cell: (u) => <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABELS[u.role]}</Badge>,
    },
    { header: "Cadastrado em", cell: (u) => formatDate(u.date_joined), hideOnMobile: true },
    {
      header: "Status",
      cell: (u) => <Badge variant={u.is_active ? "success" : "neutral"}>{u.is_active ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      header: "Ações",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          {u.role === "client" && (
            <Button variant="ghost" size="icon" onClick={() => setPromoting(u)} aria-label="Promover a funcionário">
              <ShieldCheck className="h-4 w-4" />
            </Button>
          )}
          {u.role !== "admin" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTogglingStatus(u)}
              aria-label={u.is_active ? "Desativar" : "Reativar"}
            >
              {u.is_active ? (
                <PowerOff className="h-4 w-4 text-danger-500" />
              ) : (
                <Power className="h-4 w-4 text-success-500" />
              )}
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Usuários</h1>
          <p className="mt-1 text-bone-500">Clientes, funcionários e administradores da plataforma.</p>
        </div>
        <Button onClick={() => setRegisterOpen(true)}>
          <Plus className="h-4 w-4" /> Cadastrar funcionário
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | "");
            setPage(1);
          }}
        >
          <option value="">Todos os roles</option>
          <option value="admin">Administrador</option>
          <option value="employee">Funcionário</option>
          <option value="client">Cliente</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </Select>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState icon={UsersIcon} title="Nenhum usuário encontrado" description="Ajuste os filtros de busca." />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(u) => u.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <RegisterEmployeeModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={handleRegisterEmployee}
        isSubmitting={registerEmployee.isPending}
      />

      <ConfirmDialog
        open={!!promoting}
        title="Promover a funcionário"
        description={`Tem certeza que deseja promover "${promoting?.display_name ?? promoting?.email}" a funcionário? Essa ação não pode ser desfeita.`}
        confirmLabel="Promover"
        isLoading={promoteToEmployee.isPending}
        onConfirm={handlePromote}
        onCancel={() => setPromoting(null)}
      />

      <ConfirmDialog
        open={!!togglingStatus}
        title={togglingStatus?.is_active ? "Desativar usuário" : "Reativar usuário"}
        description={
          togglingStatus?.is_active
            ? `"${togglingStatus?.display_name ?? togglingStatus?.email}" perderá acesso à plataforma até ser reativado.`
            : `"${togglingStatus?.display_name ?? togglingStatus?.email}" voltará a ter acesso à plataforma.`
        }
        variant={togglingStatus?.is_active ? "danger" : "primary"}
        confirmLabel={togglingStatus?.is_active ? "Desativar" : "Reativar"}
        isLoading={deactivate.isPending || reactivate.isPending}
        onConfirm={handleToggleStatus}
        onCancel={() => setTogglingStatus(null)}
      />
    </div>
  );
}