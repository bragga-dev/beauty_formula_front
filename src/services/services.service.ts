import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { ServiceOut, ServicePrivateOut, ServiceCreateInput, ServiceUpdateInput } from "@/types/service";

export const servicesService = {
  listPublic: (page = 1, page_size = 20) =>
    api
      .get<PageOut<ServiceOut>>("/services/list-services", { params: { page, page_size } })
      .then((r) => r.data),

  listPrivate: (page = 1, page_size = 20) =>
    api
      .get<PageOut<ServicePrivateOut>>("/services/list-private-services", { params: { page, page_size } })
      .then((r) => r.data),

  detail: (serviceId: string) =>
    api.get<ServiceOut>(`/services/detail-service/${serviceId}`).then((r) => r.data),

  create: (payload: ServiceCreateInput, image?: File | null) => {
    const form = new FormData();
    form.append("payload", JSON.stringify(payload));
    if (image) form.append("image", image);
    return api
      .post<ServiceOut>("/services/create-service", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (serviceId: string, payload: ServiceUpdateInput) =>
    api.patch<ServiceOut>(`/services/update-service/${serviceId}`, payload).then((r) => r.data),

  updateImage: (serviceId: string, image: File) => {
    const form = new FormData();
    form.append("image", image);
    return api
      .patch<ServiceOut>(`/services/update-image-service/${serviceId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  remove: (serviceId: string) => api.delete(`/services/delete-service/${serviceId}`),

  activate: (serviceId: string) =>
    api.patch<ServiceOut>(`/services/activate-service/${serviceId}`).then((r) => r.data),

  deactivate: (serviceId: string) =>
    api.patch<ServiceOut>(`/services/deactivate-service/${serviceId}`).then((r) => r.data),
};
