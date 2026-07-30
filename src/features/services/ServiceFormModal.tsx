import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { ServicePrivateOut, ServiceCreateInput } from "@/types/service";

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ServiceCreateInput, image?: File | null) => Promise<void>;
  service?: ServicePrivateOut | null;
  isSubmitting?: boolean;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  commission_percentage: "70",
  duration_minutes: "30",
};

export function ServiceFormModal({ open, onClose, onSubmit, service, isSubmitting }: ServiceFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setForm({
        name: service.name,
        description: service.description ?? "",
        price: service.price,
        commission_percentage: "70",
        duration_minutes: String(service.duration_minutes),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setImage(null);
  }, [open, service]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(
      {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        commission_percentage: Number(form.commission_percentage),
        duration_minutes: Number(form.duration_minutes),
      },
      image,
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={service ? "Editar serviço" : "Novo serviço"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do serviço"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Textarea
          label="Descrição"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço (R$)"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <Input
            label="Duração (min)"
            type="number"
            min="1"
            value={form.duration_minutes}
            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
            required
          />
        </div>
        <Input
          label="Comissão do profissional (%)"
          type="number"
          min="0"
          max="100"
          value={form.commission_percentage}
          onChange={(e) => setForm((f) => ({ ...f, commission_percentage: e.target.value }))}
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-bone-500">
            {service ? "Trocar imagem (opcional)" : "Imagem"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-bone-400 file:mr-4 file:rounded-card file:border-0 file:bg-ink-700 file:px-4 file:py-2 file:text-xs file:uppercase file:text-bone-100 hover:file:bg-ink-600"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {service ? "Salvar alterações" : "Criar serviço"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
