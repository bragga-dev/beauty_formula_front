import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { ProductPrivateOut, ProductCreateInput } from "@/types/products";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductCreateInput, image?: File | null) => Promise<void>;
  product?: ProductPrivateOut | null;
  isSubmitting?: boolean;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "0",
};

export function ProductFormModal({ open, onClose, onSubmit, product, isSubmitting }: ProductFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        stock: String(product.stock),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setImage(null);
  }, [open, product]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(
      {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      },
      image,
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? "Editar produto" : "Novo produto"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do produto"
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
            label="Estoque"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-bone-500">
            {product ? "Trocar imagem (opcional)" : "Imagem"}
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
            {product ? "Salvar alterações" : "Criar produto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}