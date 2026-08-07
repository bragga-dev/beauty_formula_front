import { useState } from "react";
import { Plus, Pencil, Trash2, Power, Package, ImageIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductFormModal } from "@/features/products/ProductFormModal";
import { useAdminProducts, useProductMutations } from "@/hooks/useAdminProducts";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL } from "@/utils/format";
import type { ProductPrivateOut, ProductCreateInput } from "@/types/products";
import type { ApiError } from "@/types/common";

export function DashboardProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminProducts(page);
  const { create, update, remove, activate, deactivate } = useProductMutations();
  const { push } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductPrivateOut | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductPrivateOut | null>(null);

  function openCreate() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(product: ProductPrivateOut) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleFormSubmit(payload: ProductCreateInput, image?: File | null) {
    try {
      if (editingProduct) {
        await update.mutateAsync({ id: editingProduct.id, payload });
      } else {
        await create.mutateAsync({ payload, image });
      }
      push(editingProduct ? "Produto atualizado!" : "Produto criado!", "success");
      setFormOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleToggleActive(product: ProductPrivateOut) {
    try {
      if (product.is_active) {
        await deactivate.mutateAsync(product.id);
        push("Produto desativado.", "success");
      } else {
        await activate.mutateAsync(product.id);
        push("Produto ativado.", "success");
      }
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    try {
      await remove.mutateAsync(deletingProduct.id);
      push("Produto excluído.", "success");
      setDeletingProduct(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<ProductPrivateOut>[] = [
    {
      header: "Produto",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-card bg-ink-700">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="m-auto mt-2.5 h-5 w-5 text-bone-600" />
            )}
          </div>
          <span className="font-medium text-bone-50">{p.name}</span>
        </div>
      ),
    },
    { header: "Estoque", cell: (p) => p.stock, hideOnMobile: true },
    { header: "Preço", cell: (p) => formatCurrencyBRL(p.price) },
    {
      header: "Status",
      cell: (p) => <Badge variant={p.is_active ? "success" : "neutral"}>{p.is_active ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      header: "Ações",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(p)} aria-label="Ativar/desativar">
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingProduct(p)} aria-label="Excluir">
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Produtos</h1>
          <p className="mt-1 text-bone-500">Gerencie o catálogo de produtos da Fórmula da Beleza.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto cadastrado"
            description="Crie o primeiro produto para começar a vender."
            actionLabel="Novo produto"
            onAction={openCreate}
          />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(p) => p.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        isSubmitting={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deletingProduct}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deletingProduct?.name}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}