import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { ContactOut, ContactCreateInput, ContactUpdateInput, ContactStatus, ContactSubject } from "@/types/contact";

interface ListContactsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: ContactStatus;
  subject?: ContactSubject;
}

export const contactService = {
  create: (payload: ContactCreateInput) =>
    api.post<ContactOut>("/contacts/create-contact", payload).then((r) => r.data),

  list: ({ page = 1, page_size = 20, search, status, subject }: ListContactsParams = {}) =>
    api
      .get<PageOut<ContactOut>>("/contacts/list-contacts", {
        params: { page, page_size, search: search || undefined, status: status || undefined, subject: subject || undefined },
      })
      .then((r) => r.data),

  detail: (contactId: string) =>
    api.get<ContactOut>(`/contacts/detail-contact/${contactId}`).then((r) => r.data),

  updateStatus: (contactId: string, payload: ContactUpdateInput) =>
    api.patch<ContactOut>(`/contacts/update-contact-status/${contactId}`, payload).then((r) => r.data),

  remove: (contactId: string) => api.delete(`/contacts/delete-contact/${contactId}`),
};