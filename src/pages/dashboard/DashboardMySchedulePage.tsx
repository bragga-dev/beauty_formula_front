import { useState, type FormEvent } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkingHours, useWorkingHoursMutations } from "@/hooks/useWorkingHours";
import { useToast } from "@/app/providers/toast-context";
import { WEEKDAY_LABELS, type Weekday, type EmployeeWorkingHoursOut } from "@/types/schedule";
import type { ApiError } from "@/types/common";

export function DashboardMySchedulePage() {
  const { data, isLoading, isError, refetch } = useWorkingHours();
  const { create, remove } = useWorkingHoursMutations();
  const { push } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState<EmployeeWorkingHoursOut | null>(null);
  const [form, setForm] = useState({ weekday: "0", start_time: "09:00", end_time: "18:00" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        weekday: Number(form.weekday),
        start_time: form.start_time,
        end_time: form.end_time,
      });
      push("Turno cadastrado!", "success");
      setFormOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRemove() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      push("Turno excluído.", "success");
      setRemoving(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const sorted = [...(data ?? [])].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Minha Agenda</h1>
          <p className="mt-1 text-bone-500">Cadastre os turnos em que você atende durante a semana.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Novo turno
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={Clock} title="Nenhum turno cadastrado" description="Cadastre seus horários de trabalho para que clientes possam agendar com você." actionLabel="Novo turno" onAction={() => setFormOpen(true)} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((wh) => (
              <Card key={wh.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-bone-50">{wh.weekday_display}</p>
                  <p className="mt-1 text-xs text-bone-500">
                    {wh.start_time.slice(0, 5)} — {wh.end_time.slice(0, 5)} · {wh.total_hours}h
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setRemoving(wh)} aria-label="Excluir turno">
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo turno" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
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
        title="Excluir turno"
        description={`Remover o turno de ${removing?.weekday_display}?`}
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
