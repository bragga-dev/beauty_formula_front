import { useState, type FormEvent } from "react";
import { UserPlus, AtSign, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/tables/Pagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeam } from "@/hooks/useTeam";
import { useToast } from "@/app/providers/toast-context";
import { authService } from "@/services/auth.service";
import { initials } from "@/utils/format";
import type { ApiError } from "@/types/common";

export function DashboardTeamPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useTeam(page, 12);
  const { push } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    try {
      await authService.registerEmployee(email);
      push("Funcionário cadastrado! Um e-mail de acesso foi enviado.", "success");
      setInviteOpen(false);
      setEmail("");
      refetch();
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Equipe</h1>
          <p className="mt-1 text-bone-500">Profissionais ativos na vitrine pública "Nosso Time".</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> Cadastrar funcionário
        </Button>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            {!isLoading && data?.items.length === 0 && (
              <div className="col-span-full">
                <EmptyState icon={Users} title="Nenhum funcionário cadastrado" actionLabel="Cadastrar funcionário" onAction={() => setInviteOpen(true)} />
              </div>
            )}
            {data?.items.map((employee) => {
              const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Sem nome";
              return (
                <Card key={employee.id} className="overflow-hidden">
                  <div className="aspect-square bg-ink-700">
                    {employee.photo_url ? (
                      <img src={employee.photo_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-3xl text-gold-400">
                        {initials(employee.first_name, employee.last_name)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm text-bone-50">{name}</p>
                    {employee.instagram && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gold-400">
                        <AtSign className="h-3 w-3" /> {employee.instagram}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {data && (
          <div className="mt-6">
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Cadastrar funcionário" size="sm">
        <form onSubmit={handleInvite} className="space-y-4">
          <p className="text-sm text-bone-500">
            Informe o e-mail do novo funcionário. Uma senha temporária será enviada para o primeiro acesso.
          </p>
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Cadastrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
