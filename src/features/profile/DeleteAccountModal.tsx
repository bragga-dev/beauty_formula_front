import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/common";

interface DeleteAccountModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmed: (message: string) => void;
}

/**
 * Exclusão da própria conta (LGPD — direito de eliminação). Não é
 * hard-delete: o backend anonimiza o perfil e revoga todas as sessões,
 * mas mantém o registro pra preservar vínculos (agendamentos, pagamentos).
 * Exige senha porque é irreversível.
 */
export function DeleteAccountModal({ open, isLoading, onClose, onConfirmed }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError(null);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authService.deleteAccount(password);
      onConfirmed(response.detail);
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Excluir minha conta" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-bone-400">
          Isso encerra todas as sessões ativas e remove seus dados pessoais (nome, foto, telefone, data de
          nascimento, Instagram) permanentemente. Essa ação não pode ser desfeita. Se você tiver agendamentos ou
          pagamentos no histórico, a conta é desativada e anonimizada em vez de apagada por completo — esses
          registros são mantidos por obrigação legal, mas deixam de estar associados aos seus dados pessoais.
        </p>

        {error && (
          <p role="alert" className="rounded-card border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-500">
            {error}
          </p>
        )}

        <Input
          label="Confirme sua senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting || isLoading}>
            Excluir conta
          </Button>
        </div>
      </form>
    </Modal>
  );
}