import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Download, KeyRound, Laptop, LogOut, Save, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ImageCropModal } from "@/components/media/ImageCropModal";
import { useAuth } from "@/app/providers/auth-context";
import { useToast } from "@/app/providers/toast-context";
import { profileService } from "@/services/profile.service";
import { authService } from "@/services/auth.service";
import { initials } from "@/utils/format";
import { ChangePasswordModal } from "@/features/profile/ChangePasswordModal";
import { SessionsModal } from "@/features/profile/SessionsModal";
import { DeleteAccountModal } from "@/features/profile/DeleteAccountModal";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "@/types/common";
import type { Gender } from "@/types/user";

export function ProfilePage() {
  const { me, updateProfile, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const isEmployee = me?.user.role === "employee";
  // Admin não tem perfil de cliente nem de funcionário — não existe
  // dado (nome, foto, gênero...) nem endpoint no back pra editar isso.
  // Mostrar esse formulário pra ele só resulta em erro de autorização
  // ao salvar, então nem tentamos.
  const isAdmin = me?.user.role === "admin";
  const profile = me?.client ?? me?.employee;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    instagram: "",
    birth_date: "",
    gender: "Masculino" as Gender,
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

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
        const updated = await profileService.updateEmployee({ ...payload, bio: form.bio });
        updateProfile(updated);
      } else {
        const updated = await profileService.updateClient(payload);
        updateProfile(updated);
      }
      push("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  }

  async function handleCropConfirm(croppedFile: File) {
    setIsUploadingPhoto(true);
    try {
      if (isEmployee) {
        const updated = await profileService.uploadEmployeePhoto(croppedFile);
        updateProfile(updated);
      } else {
        const updated = await profileService.uploadClientPhoto(croppedFile);
        updateProfile(updated);
      }
      push("Foto atualizada!", "success");
      setCropFile(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleExportData() {
    setIsExporting(true);
    try {
      const data = await authService.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meus-dados-formula-da-beleza.json";
      a.click();
      URL.revokeObjectURL(url);
      push("Seus dados foram baixados.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleLogoutAll() {
    setIsLoggingOutAll(true);
    try {
      await authService.logoutAll();
      push("Sessões encerradas em todos os dispositivos.", "success");
      await logout();
      navigate(ROUTES.login);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
      setIsLoggingOutAll(false);
    }
  }

  async function handleAccountDeleted() {
    setIsDeleteAccountOpen(false);
    push("Conta excluída. Sentiremos sua falta!", "success");
    await logout();
    navigate(ROUTES.login);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl">Meu Perfil</h1>
      <p className="mt-1 text-bone-500">Atualize seus dados pessoais e sua foto.</p>

      <Card className="mt-8">
        <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <Avatar
              src={profile?.photo_url}
              alt={form.first_name || "Foto de perfil"}
              fallback={initials(form.first_name, form.last_name)}
              size="xl"
            />
            {!isAdmin && (
              <>
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
              </>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-bone-100">{me?.user.email}</p>
            <p className="truncate text-xs text-bone-600">{me?.user.role_label}</p>
          </div>
        </CardHeader>

        <CardBody>
          {isAdmin ? (
            <p className="text-sm text-bone-500">
              Contas de administrador ainda não têm edição de dados pessoais — apenas a senha pode ser
              alterada, na seção abaixo.
            </p>
          ) : (
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
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
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
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-display text-sm uppercase tracking-wide text-bone-50">Segurança</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-bone-100">Senha de acesso</p>
              <p className="text-xs text-bone-500">Altere sua senha periodicamente para manter sua conta segura.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsChangePasswordOpen(true)}>
              <KeyRound className="h-4 w-4" /> Alterar senha
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 pt-4">
            <div>
              <p className="text-sm text-bone-100">Sessões ativas</p>
              <p className="text-xs text-bone-500">Veja os dispositivos logados na sua conta e revogue o acesso.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsSessionsOpen(true)}>
              <Laptop className="h-4 w-4" /> Ver sessões
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 pt-4">
            <div>
              <p className="text-sm text-bone-100">Sair de todos os dispositivos</p>
              <p className="text-xs text-bone-500">Encerra sua sessão aqui e em qualquer outro dispositivo logado.</p>
            </div>
            <Button type="button" variant="secondary" isLoading={isLoggingOutAll} onClick={handleLogoutAll}>
              <LogOut className="h-4 w-4" /> Sair de tudo
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-display text-sm uppercase tracking-wide text-bone-50">Meus dados (LGPD)</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-bone-100">Exportar meus dados</p>
              <p className="text-xs text-bone-500">Baixe uma cópia dos seus dados pessoais em formato JSON.</p>
            </div>
            <Button type="button" variant="secondary" isLoading={isExporting} onClick={handleExportData}>
              <Download className="h-4 w-4" /> Exportar dados
            </Button>
          </div>

          {!isAdmin && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 pt-4">
              <div>
                <p className="text-sm text-bone-100">Excluir minha conta</p>
                <p className="text-xs text-bone-500">Apaga seus dados pessoais permanentemente. Ação irreversível.</p>
              </div>
              <Button type="button" variant="danger" onClick={() => setIsDeleteAccountOpen(true)}>
                <Trash2 className="h-4 w-4" /> Excluir conta
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <ChangePasswordModal open={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <SessionsModal open={isSessionsOpen} onClose={() => setIsSessionsOpen(false)} />
      <DeleteAccountModal
        open={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirmed={handleAccountDeleted}
      />
      <ImageCropModal
        open={!!cropFile}
        file={cropFile}
        onClose={() => setCropFile(null)}
        onConfirm={handleCropConfirm}
        isSaving={isUploadingPhoto}
      />
    </div>
  );
}