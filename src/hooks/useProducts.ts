import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";

export function usePublicProducts(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["products", "public", page, pageSize],
    queryFn: () => productsService.listPublic(page, pageSize),
  });
}

export function useProductDetail(productId?: string) {
  return useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => productsService.detail(productId as string),
    enabled: !!productId,
  });
}