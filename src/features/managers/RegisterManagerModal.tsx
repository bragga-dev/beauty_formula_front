import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ManagerCreateInput } from "@/types/manager";

interface RegisterManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ManagerCreateInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function RegisterManagerModal({ open, onClose, onSubmit, isSubmitting }: RegisterManagerModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    });
    setEmail("");
    setFirstName("");
    setLastName("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Cadastrar gerente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail do gerente"
          type="email"
          placeholder="gerente@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <p className="text-xs text-bone-600">
          Uma senha temporária é gerada automaticamente e enviada por e-mail para o primeiro acesso.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Cadastrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}