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
  onConfirmed: () => void;
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
      await authService.deleteAccount(password);
      onConfirmed();
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
          Isso apaga sua conta e seus dados pessoais permanentemente e encerra todas as sessões ativas. Essa ação
          não pode ser desfeita. Se você tiver agendamentos, pagamentos ou avaliações no histórico, a exclusão
          será bloqueada — nesse caso, entre em contato para resolver isso antes.
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