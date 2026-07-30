import { useState, type FormEvent } from "react";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { useTimeOff, useTimeOffMutations } from "@/hooks/useTimeOff";
import { useToast } from "@/app/providers/toast-context";
import { formatDate, formatTime } from "@/utils/format";
import { WEEKDAY_LABELS, BLOCK_TYPE_LABELS, type Weekday, type BlockType, type EmployeeTimeOffOut } from "@/types/schedule";
import type { ApiError } from "@/types/common";

type Mode = "recurring" | "punctual";

export function DashboardMyTimeOffPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useTimeOff(page);
  const { create, remove } = useTimeOffMutations();
  const { push } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState<EmployeeTimeOffOut | null>(null);
  const [mode, setMode] = useState<Mode>("recurring");
  const [form, setForm] = useState({
    block_type: "lunch" as BlockType,
    weekday: "0",
    start_time: "12:00",
    end_time: "13:00",
    start_datetime: "",
    end_datetime: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (mode === "recurring") {
        await create.mutateAsync({
          block_type: form.block_type,
          weekday: Number(form.weekday),
          start_time: form.start_time,
          end_time: form.end_time,
        });
      } else {
        await create.mutateAsync({
          block_type: form.block_type,
          start_datetime: new Date(form.start_datetime).toISOString(),
          end_datetime: new Date(form.end_datetime).toISOString(),
        });
      }
      push("Bloqueio cadastrado!", "success");
      setFormOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRemove() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      push("Bloqueio excluído.", "success");
      setRemoving(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Meus Bloqueios</h1>
          <p className="mt-1 text-bone-500">Almoço, pausas, férias e outros horários indisponíveis.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Novo bloqueio
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState icon={CalendarOff} title="Nenhum bloqueio cadastrado" actionLabel="Novo bloqueio" onAction={() => setFormOpen(true)} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((block) => (
              <Card key={block.id} className="flex items-center justify-between p-4">
                <div>
                  <Badge variant="gold">{BLOCK_TYPE_LABELS[block.block_type]}</Badge>
                  <p className="mt-2 text-sm text-bone-100">
                    {block.weekday != null
                      ? `${WEEKDAY_LABELS[block.weekday as Weekday]} · ${block.start_time?.slice(0, 5)}–${block.end_time?.slice(0, 5)}`
                      : `${block.start_datetime ? formatDate(block.start_datetime) : ""} ${block.start_datetime ? formatTime(block.start_datetime) : ""} — ${block.end_datetime ? formatTime(block.end_datetime) : ""}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setRemoving(block)} aria-label="Excluir bloqueio">
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              </Card>
            ))}
          </div>
        )}
        {data && (
          <div className="mt-4">
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo bloqueio" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 rounded-card border border-ink-700 p-1">
            <button
              type="button"
              onClick={() => setMode("recurring")}
              className={`flex-1 rounded-card py-2 text-xs uppercase tracking-wide ${mode === "recurring" ? "bg-crimson-500 text-bone-50" : "text-bone-500"}`}
            >
              Recorrente
            </button>
            <button
              type="button"
              onClick={() => setMode("punctual")}
              className={`flex-1 rounded-card py-2 text-xs uppercase tracking-wide ${mode === "punctual" ? "bg-crimson-500 text-bone-50" : "text-bone-500"}`}
            >
              Pontual
            </button>
          </div>

          <Select
            label="Tipo de bloqueio"
            value={form.block_type}
            onChange={(e) => setForm((f) => ({ ...f, block_type: e.target.value as BlockType }))}
          >
            {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          {mode === "recurring" ? (
            <>
              <Select
                label="Dia da semana"
                value={form.weekday}
                onChange={(e) => setForm((f) => ({ ...f, weekday: e.target.value }))}
              >
                {(Object.keys(WEEKDAY_LABELS) as unknown as Weekday[]).map((day) => (
                  <option key={day} value={day}>
                    {WEEKDAY_LABELS[day]}
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Início"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  required
                />
                <Input
                  label="Fim"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  required
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Início"
                type="datetime-local"
                value={form.start_datetime}
                onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
                required
              />
              <Input
                label="Fim"
                type="datetime-local"
                value={form.end_datetime}
                onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              Cadastrar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removing}
        title="Excluir bloqueio"
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
