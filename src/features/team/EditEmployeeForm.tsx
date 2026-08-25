import { Construction, Save } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/utils/format";
import type { EmployeeTeamDetailOut } from "@/types/employee";

interface EditEmployeeFormProps {
  employee: EmployeeTeamDetailOut;
}

/**
 * Formulário de edição de dados do funcionário — layout final já pronto,
 * mas submit desabilitado: o back ainda não expõe uma rota de update
 * pra esses campos (o único dado editável hoje é `booking_window_days`,
 * via `useUpdateBookingWindow`). Assim que a rota existir, trocar os
 * `disabled` pelo mutation real e os `defaultValue` por state controlado.
 */
export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const employeeName = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Sem nome";

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 rounded-card border border-gold-400/30 bg-gold-400/5 px-4 py-3 text-sm text-gold-400">
          <Construction className="h-4 w-4 shrink-0" />
          Edição ainda não disponível — o back não tem rota de atualização de dados do funcionário. Layout pronto
          pra quando a rota existir.
        </div>

        <fieldset disabled className="mt-6 space-y-6 opacity-70">
          <div className="flex items-center gap-4">
            <Avatar src={employee.photo_url} alt={employeeName} fallback={initials(employee.first_name, employee.last_name)} size="lg" />
            <Button type="button" variant="outline" size="sm">
              Trocar foto
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" defaultValue={employee.first_name ?? ""} />
            <Input label="Sobrenome" defaultValue={employee.last_name ?? ""} />
          </div>

          <Input label="Instagram" defaultValue={employee.instagram ?? ""} placeholder="@usuario" />

          <Textarea label="Biografia" defaultValue={employee.bio ?? ""} placeholder="Resumo exibido na página pública" />

          <div className="flex justify-end">
            <Button type="button" variant="gold">
              <Save className="h-4 w-4" /> Salvar alterações
            </Button>
          </div>
        </fieldset>
      </CardBody>
    </Card>
  );
}