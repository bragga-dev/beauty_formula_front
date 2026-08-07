import { Mail, Phone, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/format";
import { CONTACT_SUBJECT_LABELS, CONTACT_STATUS_LABELS } from "@/types/contact";
import type { ContactOut, ContactStatus } from "@/types/contact";

interface ContactDetailModalProps {
  contact: ContactOut | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ContactStatus) => void;
  isUpdating?: boolean;
}

const STATUS_VARIANT: Record<ContactStatus, "neutral" | "success" | "danger" | "gold"> = {
  pending: "gold",
  in_progress: "neutral",
  resolved: "success",
  archived: "neutral",
};

export function ContactDetailModal({ contact, onClose, onStatusChange, isUpdating }: ContactDetailModalProps) {
  return (
    <Modal open={!!contact} onClose={onClose} title="Detalhes do contato" size="md">
      {contact && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg text-bone-50">{contact.full_name}</h3>
              <Badge variant="crimson" className="mt-1.5">
                {CONTACT_SUBJECT_LABELS[contact.subject]}
              </Badge>
            </div>
            <Badge variant={STATUS_VARIANT[contact.status]}>{CONTACT_STATUS_LABELS[contact.status]}</Badge>
          </div>

          <div className="space-y-2 rounded-card border border-ink-700 bg-ink-800/60 p-4 text-sm">
            <p className="flex items-center gap-2 text-bone-300">
              <Mail className="h-4 w-4 text-gold-400" /> {contact.email}
            </p>
            <p className="flex items-center gap-2 text-bone-300">
              <Phone className="h-4 w-4 text-gold-400" /> {contact.phone}
            </p>
            <p className="flex items-center gap-2 text-bone-300">
              <Calendar className="h-4 w-4 text-gold-400" /> {formatDate(contact.created_at)}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-bone-500">Mensagem</p>
            <p className="whitespace-pre-wrap rounded-card border border-ink-700 bg-ink-800/60 p-4 text-sm text-bone-200">
              {contact.message}
            </p>
          </div>

          <Select
            label="Atualizar status"
            value={contact.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(contact.id, e.target.value as ContactStatus)}
          >
            {Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}