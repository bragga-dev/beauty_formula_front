import { useState } from "react";
import { Trash2, Eye, Search, MailQuestion } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ContactDetailModal } from "@/features/contacts/ContactDetailModal";
import { useAdminContacts, useContactMutations } from "@/hooks/useContacts";
import { useToast } from "@/app/providers/toast-context";
import { formatDate } from "@/utils/format";
import { CONTACT_SUBJECT_LABELS, CONTACT_STATUS_LABELS } from "@/types/contact";
import type { ContactOut, ContactStatus, ContactSubject } from "@/types/contact";
import type { ApiError } from "@/types/common";

const STATUS_VARIANT: Record<ContactStatus, "neutral" | "success" | "danger" | "gold"> = {
  pending: "gold",
  in_progress: "neutral",
  resolved: "success",
  archived: "neutral",
};

export function DashboardContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [subjectFilter, setSubjectFilter] = useState<ContactSubject | "">("");

  const { data, isLoading, isError, refetch } = useAdminContacts(page, 10, {
    search,
    status: statusFilter,
    subject: subjectFilter,
  });
  const { updateStatus, remove } = useContactMutations();
  const { push } = useToast();

  const [viewingContact, setViewingContact] = useState<ContactOut | null>(null);
  const [deletingContact, setDeletingContact] = useState<ContactOut | null>(null);

  async function handleStatusChange(id: string, status: ContactStatus) {
    try {
      await updateStatus.mutateAsync({ id, status });
      push("Status atualizado.", "success");
      setViewingContact((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleDelete() {
    if (!deletingContact) return;
    try {
      await remove.mutateAsync(deletingContact.id);
      push("Contato excluído.", "success");
      setDeletingContact(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<ContactOut>[] = [
    {
      header: "Nome",
      cell: (c) => <span className="font-medium text-bone-50">{c.full_name}</span>,
    },
    { header: "Assunto", cell: (c) => CONTACT_SUBJECT_LABELS[c.subject], hideOnMobile: true },
    { header: "E-mail", cell: (c) => c.email, hideOnMobile: true },
    { header: "Recebido em", cell: (c) => formatDate(c.created_at), hideOnMobile: true },
    {
      header: "Status",
      cell: (c) => <Badge variant={STATUS_VARIANT[c.status]}>{CONTACT_STATUS_LABELS[c.status]}</Badge>,
    },
    {
      header: "Ações",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewingContact(c)} aria-label="Ver detalhes">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingContact(c)} aria-label="Excluir">
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
          <h1 className="text-3xl">Contatos</h1>
          <p className="mt-1 text-bone-500">Mensagens recebidas pelo formulário do site.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Input
          placeholder="Buscar por nome..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ContactStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          {Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value as ContactSubject | "");
            setPage(1);
          }}
        >
          <option value="">Todos os assuntos</option>
          {Object.entries(CONTACT_SUBJECT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState icon={MailQuestion} title="Nenhum contato encontrado" description="Ajuste os filtros ou aguarde novas mensagens." />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(c) => c.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ContactDetailModal
        contact={viewingContact}
        onClose={() => setViewingContact(null)}
        onStatusChange={handleStatusChange}
        isUpdating={updateStatus.isPending}
      />

      <ConfirmDialog
        open={!!deletingContact}
        title="Excluir contato"
        description={`Tem certeza que deseja excluir a mensagem de "${deletingContact?.full_name}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingContact(null)}
      />
    </div>
  );
}