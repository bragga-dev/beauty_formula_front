import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil } from "lucide-react";
import { ImageCropModal } from "@/components/media/ImageCropModal";

interface ImagePickerFieldProps {
  label: string;
  /** Imagem já recortada e pronta para envio (controlado pelo componente pai). */
  value: File | null;
  onChange: (file: File | null) => void;
  /** URL da imagem atual, ao editar um item que já tem foto salva. */
  existingImageUrl?: string | null;
  /** Proporção largura/altura do recorte. Padrão 4:3, igual aos cards de serviço/produto. */
  aspect?: number;
}

const MAX_SIZE_MB = 5;

export function ImagePickerField({
  label,
  value,
  onChange,
  existingImageUrl,
  aspect = 4 / 3,
}: ImagePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Formato inválido. Selecione uma imagem.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Imagem muito grande. Máx: ${MAX_SIZE_MB}MB.`);
      return;
    }
    setPendingFile(file);
  }

  const thumbnail = previewUrl ?? existingImageUrl;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-bone-500">{label}</label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-card border border-ink-700 bg-ink-900"
        >
          {thumbnail ? (
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-bone-600">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition-all group-hover:bg-ink-950/60 group-hover:opacity-100">
            <Pencil className="h-5 w-5 text-bone-50" />
          </div>
        </button>

        <div className="text-xs text-bone-500">
          {thumbnail ? "Clique na imagem para trocar." : "Clique para escolher uma imagem."}
          <br />
          Você poderá ajustar o enquadramento antes de salvar.
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

      <ImageCropModal
        open={!!pendingFile}
        file={pendingFile}
        aspect={aspect}
        onClose={() => setPendingFile(null)}
        onConfirm={(cropped) => {
          onChange(cropped);
          setPendingFile(null);
        }}
      />
    </div>
  );
}