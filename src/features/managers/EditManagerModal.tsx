import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ImageCropModal } from "@/components/media/ImageCropModal";
import { useManagerMutations } from "@/hooks/useManagers";
import { useToast } from "@/app/providers/toast-context";
import { initials } from "@/utils/format";
import type { ManagerOut } from "@/types/manager";
import type { ApiError } from "@/types/common";

const MAX_PHOTO_SIZE_MB = 5;

interface EditManagerModalProps {
  manager: ManagerOut | null;
  onClose: () => void;
}

export function EditManagerModal({ manager, onClose }: EditManagerModalProps) {
  const { push } = useToast();
  const { update, uploadPhoto, deletePhoto } = useManagerMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    if (!manager) return;
    setFirstName(manager.first_name ?? "");
    setLastName(manager.last_name ?? "");
    setPhotoUrl(manager.photo_url ?? null);
  }, [manager]);

  if (!manager) return null;
  const managerId = manager.id;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ managerId, payload: { first_name: firstName, last_name: lastName } });
      push("Gerente atualizado!", "success");
      onClose();
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      push("Formato inválido. Use JPG ou PNG.", "error");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      push(`Imagem muito grande. Máx: ${MAX_PHOTO_SIZE_MB}MB.`, "error");
      return;
    }
    setCropFile(file);
  }

  async function handleCropConfirm(croppedFile: File) {
    try {
      const updated = await uploadPhoto.mutateAsync({ managerId, file: croppedFile });
      setPhotoUrl(updated.photo_url ?? null);
      push("Foto atualizada!", "success");
      setCropFile(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRemovePhoto() {
    try {
      const updated = await deletePhoto.mutateAsync(managerId);
      setPhotoUrl(updated.photo_url ?? null);
      push("Foto removida.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <>
      <Modal open={!!manager} onClose={onClose} title="Editar gerente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={photoUrl} alt={firstName || "Foto"} fallback={initials(firstName, lastName)} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPhoto.isPending}
                aria-label="Alterar foto"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-gold-400 hover:bg-ink-700"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-bone-100">{manager.user.email}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 px-0"
                isLoading={deletePhoto.isPending}
                onClick={handleRemovePhoto}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover foto
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={update.isPending}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={update.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
      <ImageCropModal
        open={!!cropFile}
        file={cropFile}
        onClose={() => setCropFile(null)}
        onConfirm={handleCropConfirm}
        isSaving={uploadPhoto.isPending}
      />
    </>
  );
}