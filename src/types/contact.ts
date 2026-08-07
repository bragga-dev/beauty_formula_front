export type ContactSubject = "appointment" | "question" | "compliment" | "complaint" | "other";

export type ContactStatus = "pending" | "in_progress" | "resolved" | "archived";

export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, string> = {
  appointment: "Agendamento",
  question: "Dúvida",
  compliment: "Elogio",
  complaint: "Reclamação",
  other: "Outro",
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  archived: "Arquivado",
};

export interface ContactOut {
  id: string;
  full_name: string;
  subject: ContactSubject;
  message: string;
  email: string;
  phone: string;
  status: ContactStatus;
  created_at: string;
}

export interface ContactCreateInput {
  full_name: string;
  subject: ContactSubject;
  message: string;
  email: string;
  phone: string;
}

export interface ContactUpdateInput {
  status: ContactStatus;
}