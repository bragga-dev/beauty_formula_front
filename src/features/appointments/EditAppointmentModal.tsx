import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTeam } from "@/hooks/useTeam";
import { usePublicServices } from "@/hooks/useServices";
import type { SchedulingOut, SchedulingUpdateInput } from "@/types/scheduling.types";

interface EditAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SchedulingUpdateInput) => Promise<void>;
  scheduling: SchedulingOut | null;
  isSubmitting?: boolean;
}

/** `datetime-local` trabalha em horário local sem timezone — converte pros dois lados. */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditAppointmentModal({ open, onClose, onSubmit, scheduling, isSubmitting }: EditAppointmentModalProps) {
  const { data: team } = useTeam(1, 100);
  const { data: services } = usePublicServices(1, 100);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !scheduling) return;
    setServiceId(scheduling.service.id);
    setEmployeeId(scheduling.employee.id);
    setScheduledTime(toDatetimeLocalValue(scheduling.scheduled_time));
    setNotes(scheduling.notes ?? "");
  }, [open, scheduling]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!scheduling) return;
    const payload: SchedulingUpdateInput = {};
    if (serviceId !== scheduling.service.id) payload.service_id = serviceId;
    if (employeeId !== scheduling.employee.id) payload.employee_id = employeeId;
    if (scheduledTime && scheduledTime !== toDatetimeLocalValue(scheduling.scheduled_time)) {
      payload.scheduled_time = new Date(scheduledTime).toISOString();
    }
    if (notes !== (scheduling.notes ?? "")) payload.notes = notes;
    await onSubmit(payload);
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar agendamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Serviço" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services?.items.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select label="Funcionário" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          {team?.items.map((e) => (
            <option key={e.id} value={e.id}>
              {[e.first_name, e.last_name].filter(Boolean).join(" ") || "Sem nome"}
            </option>
          ))}
        </Select>

        <Input
          label="Data e horário"
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />

        <Textarea label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}