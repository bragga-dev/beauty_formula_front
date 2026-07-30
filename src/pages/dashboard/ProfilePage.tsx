import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/app/providers/auth-context";
import { useToast } from "@/app/providers/toast-context";
import { profileService } from "@/services/profile.service";
import { initials } from "@/utils/format";
import type { ApiError } from "@/types/common";

export function ProfilePage() {
  const { me, refreshMe } = useAuth();
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmployee = me?.user.role === "employee";
  const profile = me?.client ?? me?.employee;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    instagram: "",
    birth_date: "",
    gender: "male" as "male" | "female" | "other",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      username: profile.username ?? "",
      phone: profile.phone ?? "",
      instagram: profile.instagram ?? "",
      birth_date: profile.birth_date ?? "",
      gender: profile.gender,
      bio: (me?.employee?.bio as string) ?? "",
    });
  }, [profile, me]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        phone: form.phone || undefined,
        instagram: form.instagram || undefined,
        birth_date: form.birth_date || undefined,
        gender: form.gender,
      };
      if (isEmployee) {
        await profileService.updateEmployee({ ...payload, bio: form.bio });
      } else {
        await profileService.updateClient(payload);
      }
      await refreshMe();
      push("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      if (isEmployee) {
        await profileService.uploadEmployeePhoto(file);
      } else {
        await profileService.uploadClientPhoto(file);
      }
      await refreshMe();
      push("Foto atualizada!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl">Meu Perfil</h1>
      <p className="mt-1 text-bone-500">Atualize seus dados pessoais e sua foto.</p>

      <Card className="mt-8">
        <CardHeader className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={profile?.photo_url}
              alt={form.first_name || "Foto de perfil"}
              fallback={initials(form.first_name, form.last_name)}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              aria-label="Alterar foto"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-gold-400 hover:bg-ink-700"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="text-sm text-bone-100">{me?.user.email}</p>
            <p className="text-xs text-bone-600">{me?.user.role_label}</p>
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
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as typeof form.gender }))}
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </Select>
            </div>
            {isEmployee && (
              <Textarea
                label="Bio"
                placeholder="Conte um pouco sobre sua experiência..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            )}
            <Button type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" /> Salvar alterações
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
