import { useEffect, useState } from "react";
import { Laptop, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { authService } from "@/services/auth.service";
import { useToast } from "@/app/providers/toast-context";
import { formatDate } from "@/utils/format";
import type { ApiError } from "@/types/common";
import type { SessionOut } from "@/types/user";

interface SessionsModalProps {
  open: boolean;
  onClose: () => void;
}

/** Lista os refresh tokens ativos (dispositivos logados) e permite revogar um por um. */
export function SessionsModal({ open, onClose }: SessionsModalProps) {
  const { push } = useToast();
  const [sessions, setSessions] = useState<SessionOut[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    authService
      .listSessions()
      .then(setSessions)
      .catch((err) => push((err as ApiError).detail as string, "error"))
      .finally(() => setIsLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRevoke(sessionId: number) {
    setRevokingId(sessionId);
    try {
      await authService.revokeSession(sessionId);
      setSessions((prev) => prev?.filter((s) => s.id !== sessionId) ?? null);
      push("Sessão encerrada.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sessões ativas" size="sm">
      <p className="text-sm text-bone-400">Dispositivos com sessão ativa na sua conta.</p>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : sessions?.length === 0 ? (
          <p className="text-sm text-bone-500">Nenhuma sessão ativa encontrada.</p>
        ) : (
          sessions?.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-card border border-ink-700 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Laptop className="h-4 w-4 shrink-0 text-bone-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone-100">{session.device ?? "Dispositivo desconhecido"}</p>
                  <p className="truncate text-xs text-bone-600">
                    {session.created_at && `Login em ${formatDate(session.created_at)} · `}
                    Expira em {formatDate(session.expires_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRevoke(session.id)}
                isLoading={revokingId === session.id}
                aria-label="Encerrar sessão"
              >
                <Trash2 className="h-4 w-4 text-danger-500" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}