import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/utils/token-storage";
import { useToast } from "@/app/providers/toast-context";
import type { ApiError } from "@/types/common";

const EMPTY_FORM = { old_password: "", new_password: "", new_password2: "" };

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { push } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setError(null);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.new_password !== form.new_password2) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await authService.changePassword(form.old_password, form.new_password, form.new_password2);
      // A troca de senha invalida os tokens anteriores no back-end; o novo
      // refresh já vem setado direto no cookie httpOnly, só o access
      // precisa ser guardado aqui pra manter a sessão ativa.
      tokenStorage.setAccess(tokens.access);
      push("Senha alterada com sucesso!", "success");
      onClose();
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Alterar senha" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-card border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-500">
            {error}
          </p>
        )}
        <Input
          label="Senha atual"
          type="password"
          value={form.old_password}
          onChange={(e) => setForm((f) => ({ ...f, old_password: e.target.value }))}
          required
          autoComplete="current-password"
        />
        <Input
          label="Nova senha"
          type="password"
          hint="Mínimo de 8 caracteres."
          value={form.new_password}
          onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          value={form.new_password2}
          onChange={(e) => setForm((f) => ({ ...f, new_password2: e.target.value }))}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar nova senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}