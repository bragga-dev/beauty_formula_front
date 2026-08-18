import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { PageOut } from "@/types/common";
import type { ProductCreateInput, ProductPrivateOut, ProductUpdateInput } from "@/types/products";

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

  const updateImage = useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) =>
      productsService.updateImage(id, image),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: invalidate,
  });

  // Toggle otimista: atualiza `is_active` no cache antes da resposta do
  // servidor chegar, pra UI reagir na hora. Se a request falhar, reverte
  // pro estado anterior (snapshot salvo em onMutate).
  function useToggleActive(mutationFn: (id: string) => Promise<ProductPrivateOut>, nextValue: boolean) {
    return useMutation({
      mutationFn,
      onMutate: async (id: string) => {
        await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
        const previous = queryClient.getQueriesData<PageOut<ProductPrivateOut>>({ queryKey: ["admin", "products"] });

        queryClient.setQueriesData<PageOut<ProductPrivateOut>>({ queryKey: ["admin", "products"] }, (old) => {
          if (!old || !Array.isArray(old.items)) return old;
          return {
            ...old,
            items: old.items.map((item) => (item.id === id ? { ...item, is_active: nextValue } : item)),
          };
        });

        return { previous };
      },
      onError: (_err, _id, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      },
      onSettled: invalidate,
    });
  }

  const activate = useToggleActive(productsService.activate, true);
  const deactivate = useToggleActive(productsService.deactivate, false);

  return { create, update, updateImage, remove, activate, deactivate };
}