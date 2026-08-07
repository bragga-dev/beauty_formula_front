import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { ProductCreateInput, ProductUpdateInput } from "@/types/products";

export function useAdminProducts(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "products", page, pageSize],
    queryFn: () => productsService.listPrivate(page, pageSize),
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  const create = useMutation({
    mutationFn: ({ payload, image }: { payload: ProductCreateInput; image?: File | null }) =>
      productsService.create(payload, image),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdateInput }) =>
      productsService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: (id: string) => productsService.activate(id),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => productsService.deactivate(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, activate, deactivate };
}