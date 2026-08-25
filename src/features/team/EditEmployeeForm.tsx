import { useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/utils/format";
import { useUpdateEmployeeProfile, useUpdateEmployeePhoto } from "@/hooks/useTeam";
import { useToast } from "@/app/providers/toast-context";
import type { ApiError } from "@/types/common";
import type { EmployeeOut } from "@/types/employee";
import type { Gender } from "@/types/user";

interface EditEmployeeFormProps {
  employee: EmployeeOut;
}

const MAX_PHOTO_SIZE_MB = 5;

/**
 * Formulário de edição de dados do funcionário (admin), conectado a:
 * - `PATCH /employees/team/{employee_id}/profile`
 * - `POST  /employees/team/{employee_id}/photo`
 *
 * Segue o mesmo padrão visual do `ProfilePage` (autoedição): botão de
 * câmera sobreposto no canto do avatar, em vez de um botão solto ao lado.
 */
export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employeeName = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Sem nome";

  const [form, setForm] = useState({
    first_name: employee.first_name ?? "",
    last_name: employee.last_name ?? "",
    username: employee.username ?? "",
    phone: employee.phone ?? "",
    instagram: employee.instagram ?? "",
    birth_date: employee.birth_date ?? "",
    gender: employee.gender,
    bio: employee.bio ?? "",
  });

  const updateProfile = useUpdateEmployeeProfile();
  const updatePhoto = useUpdateEmployeePhoto();

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      push("Formato inválido. Use JPG ou PNG.", "error");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      push(`Imagem muito grande. Máx: ${MAX_PHOTO_SIZE_MB}MB.`, "error");
      e.target.value = "";
      return;
    }

    try {
      await updatePhoto.mutateAsync({ employeeId: employee.id, file });
      push("Foto atualizada!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await updateProfile.mutateAsync({
        employeeId: employee.id,
        payload: {
          first_name: form.first_name,
          last_name: form.last_name,
          username: form.username,
          gender: form.gender,
          phone: form.phone || undefined,
          instagram: form.instagram || undefined,
          birth_date: form.birth_date || undefined,
          bio: form.bio || undefined,
        },
      });
      setForm((f) => ({ ...f, gender: updated.gender }));
      push("Dados do funcionário atualizados.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <Avatar
            src={employee.photo_url}
            alt={employeeName}
            fallback={initials(employee.first_name, employee.last_name)}
            size="xl"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updatePhoto.isPending}
            aria-label="Alterar foto"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-gold-400 hover:bg-ink-700"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-bone-100">{employeeName}</p>
          <p className="truncate text-xs text-bone-600">{employee.user.email}</p>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
            <Input
              label="Sobrenome"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </div>

          <Input
            label="Nome de usuário"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              label="Instagram"
              value={form.instagram}
              onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
              placeholder="@usuario"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Data de nascimento"
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
            />
            <Select
              label="Gênero"
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </Select>
          </div>

          <Textarea
            label="Biografia"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Resumo exibido na página pública"
          />

          <div className="flex justify-end">
            <Button type="submit" variant="gold" isLoading={updateProfile.isPending}>
              <Save className="h-4 w-4" /> Salvar alterações
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}