import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { ProductOut, ProductPrivateOut, ProductCreateInput, ProductUpdateInput } from "@/types/products";

export const productsService = {
  listPublic: (page = 1, page_size = 20) =>
    api
      .get<PageOut<ProductOut>>("/products/list-public-products", { params: { page, page_size } })
      .then((r) => r.data),

  listPrivate: (page = 1, page_size = 20) =>
    api
      .get<PageOut<ProductPrivateOut>>("/products/list-private-products", { params: { page, page_size } })
      .then((r) => r.data),

  detail: (productId: string) =>
    api.get<ProductOut>(`/products/detail-product/${productId}`).then((r) => r.data),

  create: (payload: ProductCreateInput, image?: File | null) => {
    const form = new FormData();
    form.append("payload", JSON.stringify(payload));
    if (image) form.append("image", image);
    return api
      .post<ProductOut>("/products/create-product", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (productId: string, payload: ProductUpdateInput) =>
    api.patch<ProductOut>(`/products/update-product/${productId}`, payload).then((r) => r.data),

  remove: (productId: string) => api.delete(`/products/delete-product/${productId}`),

  activate: (productId: string) =>
    api.patch<ProductOut>(`/products/activate-product/${productId}`).then((r) => r.data),

  deactivate: (productId: string) =>
    api.patch<ProductOut>(`/products/deactivate-product/${productId}`).then((r) => r.data),
};