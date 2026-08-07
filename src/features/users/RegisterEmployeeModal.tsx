import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface RegisterEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function RegisterEmployeeModal({ open, onClose, onSubmit, isSubmitting }: RegisterEmployeeModalProps) {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(email);
    setEmail("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Cadastrar funcionário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail do funcionário"
          type="email"
          placeholder="funcionario@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-bone-600">
          Uma senha temporária é gerada automaticamente e enviada por e-mail para o primeiro
          acesso.
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