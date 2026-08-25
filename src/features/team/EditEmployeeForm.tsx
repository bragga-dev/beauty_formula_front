import { useRef, useState } from "react";
import { Save, Camera } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/utils/format";
import { useUpdateEmployeeProfile, useUpdateEmployeePhoto } from "@/hooks/useTeam";
import { useToast } from "@/app/providers/toast-context";
import type { ApiError } from "@/types/common";
import type { EmployeeTeamDetailOut } from "@/types/employee";

interface EditEmployeeFormProps {
  employee: EmployeeTeamDetailOut;
}

const MAX_PHOTO_SIZE_MB = 5;

/**
 * Formulário de edição de dados do funcionário (admin), conectado a:
 * - `PATCH /employees/team/{employee_id}/profile` (nome, sobrenome, instagram, bio)
 * - `POST  /employees/team/{employee_id}/photo` (troca de foto)
 *
 * Só edita os campos que `EmployeeTeamDetailOut` expõe hoje (o back também
 * aceita username/gender/phone/birth_date em `EmployeeUpdateIn`, mas o
 * detalhe público de funcionário usado nesta página não traz esses campos).
 */
export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employeeName = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Sem nome";

  const [firstName, setFirstName] = useState(employee.first_name ?? "");
  const [lastName, setLastName] = useState(employee.last_name ?? "");
  const [instagram, setInstagram] = useState(employee.instagram ?? "");
  const [bio, setBio] = useState(employee.bio ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const updateProfile = useUpdateEmployeeProfile();
  const updatePhoto = useUpdateEmployeePhoto();

  const isDirty =
    firstName !== (employee.first_name ?? "") ||
    lastName !== (employee.last_name ?? "") ||
    instagram !== (employee.instagram ?? "") ||
    bio !== (employee.bio ?? "");

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo depois
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      push("Formato inválido. Use JPG ou PNG.", "error");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      push(`Imagem muito grande. Máx: ${MAX_PHOTO_SIZE_MB}MB.`, "error");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    try {
      await updatePhoto.mutateAsync({ employeeId: employee.id, file });
      push("Foto atualizada.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
      setPhotoPreview(null);
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        employeeId: employee.id,
        payload: {
          first_name: firstName,
          last_name: lastName,
          instagram: instagram || undefined,
          bio: bio || undefined,
        },
      });
      push("Dados do funcionário atualizados.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={photoPreview ?? employee.photo_url}
              alt={employeeName}
              fallback={initials(employee.first_name, employee.last_name)}
              size="lg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePhotoClick}
              disabled={updatePhoto.isPending}
            >
              <Camera className="h-4 w-4" /> {updatePhoto.isPending ? "Enviando..." : "Trocar foto"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <Input
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario"
          />

          <Textarea
            label="Biografia"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Resumo exibido na página pública"
          />

          <div className="flex justify-end">
            <Button type="submit" variant="gold" disabled={!isDirty || updateProfile.isPending}>
              <Save className="h-4 w-4" /> {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}