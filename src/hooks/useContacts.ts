import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactService } from "@/services/contact.service";
import type { ContactCreateInput, ContactStatus, ContactSubject } from "@/types/contact";

export function useCreateContact() {
  return useMutation({
    mutationFn: (payload: ContactCreateInput) => contactService.create(payload),
  });
}

interface AdminContactsFilters {
  search?: string;
  status?: ContactStatus | "";
  subject?: ContactSubject | "";
}

export function useAdminContacts(page: number, pageSize = 10, filters: AdminContactsFilters = {}) {
  return useQuery({
    queryKey: ["admin", "contacts", page, pageSize, filters],
    queryFn: () =>
      contactService.list({
        page,
        page_size: pageSize,
        search: filters.search,
        status: filters.status || undefined,
        subject: filters.subject || undefined,
      }),
  });
}

export function useContactMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      contactService.updateStatus(id, { status }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => contactService.remove(id),
    onSuccess: invalidate,
  });

  return { updateStatus, remove };
}