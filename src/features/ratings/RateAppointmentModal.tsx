import { useEffect, useState, type FormEvent } from "react";
import { Star, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useRatingMutations } from "@/hooks/useRatings";
import { useToast } from "@/app/providers/toast-context";
import { cn } from "@/utils/cn";
import type { AverageRatingPrivateOut, RatingValue } from "@/types/rating";
import type { SchedulingOut } from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

interface RateAppointmentModalProps {
  open: boolean;
  /** Agendamento sendo avaliado (precisa estar `completed`). */
  scheduling: SchedulingOut | null;
  /** Avaliação já existente pra esse agendamento, se houver — abre em modo edição. */
  existingRating?: AverageRatingPrivateOut;
  onClose: () => void;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: RatingValue) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3, 4, 5] as RatingValue[]).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn("h-8 w-8", star <= value ? "fill-gold-400 text-gold-400" : "text-ink-600")}
          />
        </button>
      ))}
    </div>
  );
}

export function RateAppointmentModal({ open, scheduling, existingRating, onClose }: RateAppointmentModalProps) {
  const { create, update, remove } = useRatingMutations();
  const { push } = useToast();

  const [rating, setRating] = useState<RatingValue>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(existingRating?.rating ?? 5);
      setComment(existingRating?.comment ?? "");
      setError("");
    }
  }, [open, existingRating]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!scheduling) return;
    try {
      if (existingRating) {
        await update.mutateAsync({ id: existingRating.id, payload: { rating, comment: comment.trim() || undefined } });
        push("Avaliação atualizada.", "success");
      } else {
        await create.mutateAsync({
          scheduling_id: scheduling.id,
          rating,
          comment: comment.trim() || undefined,
        });
        push("Avaliação enviada. Obrigado pelo retorno!", "success");
      }
      onClose();
    } catch (err) {
      const detail = (err as ApiError).detail;
      setError(typeof detail === "string" ? detail : "Não foi possível salvar sua avaliação.");
    }
  }

  async function handleDelete() {
    if (!existingRating) return;
    try {
      await remove.mutateAsync(existingRating.id);
      push("Avaliação removida.", "success");
      onClose();
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={existingRating ? "Editar avaliação" : "Avaliar atendimento"} size="sm">
      {scheduling && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="font-display text-sm uppercase tracking-wide text-bone-50">{scheduling.service.name}</p>
            <p className="mt-1 text-xs text-bone-500">
              com{" "}
              {[scheduling.employee.first_name, scheduling.employee.last_name].filter(Boolean).join(" ") ||
                "profissional"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-bone-500">Sua nota</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <Textarea
            label="Comentário (opcional)"
            placeholder="Conte como foi seu atendimento..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          {existingRating && !existingRating.is_authorized && (
            <p className="text-xs text-bone-600">
              Sua avaliação ainda não foi publicada — fica visível pra você até ser aprovada.
            </p>
          )}

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            {existingRating ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} isLoading={remove.isPending}>
                <Trash2 className="h-4 w-4 text-danger-500" /> Remover
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {existingRating ? "Salvar alterações" : "Enviar avaliação"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}