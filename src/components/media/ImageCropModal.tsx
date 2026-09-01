import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ImageCropModalProps {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  isSaving?: boolean;
  /** Proporção largura/altura do recorte final. 1 = quadrado (padrão, ideal p/ foto de perfil). */
  aspect?: number;
  /** Lado maior da imagem final gerada, em pixels. */
  outputSize?: number;
}

const VIEWPORT_SIZE = 288;

/**
 * Deixa o usuário posicionar e dar zoom na foto antes de salvar, resolvendo
 * o problema de fotos ficarem descentralizadas quando o `object-cover`
 * recorta automaticamente a imagem original nos cards/avatares.
 */
export function ImageCropModal({
  open,
  file,
  onClose,
  onConfirm,
  isSaving = false,
  aspect = 1,
  outputSize = 640,
}: ImageCropModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(null);

  const viewW = aspect >= 1 ? VIEWPORT_SIZE : VIEWPORT_SIZE * aspect;
  const viewH = aspect >= 1 ? VIEWPORT_SIZE / aspect : VIEWPORT_SIZE;

  useEffect(() => {
    if (!file) {
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.onload = () => setNatural({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!open || !file || !imgUrl) return null;
  const currentFile = file;

  const baseScale =
    natural.width && natural.height ? Math.max(viewW / natural.width, viewH / natural.height) : 1;

  function dispFor(zoomValue: number) {
    const scale = baseScale * zoomValue;
    return { width: natural.width * scale, height: natural.height * scale, scale };
  }

  function clamp(offX: number, offY: number, dispWValue: number, dispHValue: number) {
    const maxX = Math.max(0, (dispWValue - viewW) / 2);
    const maxY = Math.max(0, (dispHValue - viewH) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, offX)), y: Math.min(maxY, Math.max(-maxY, offY)) };
  }

  const { width: dispW, height: dispH, scale } = dispFor(zoom);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clamp(dragState.current.origin.x + dx, dragState.current.origin.y + dy, dispW, dispH));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(value: number) {
    const { width, height } = dispFor(value);
    setZoom(value);
    setOffset((o) => clamp(o.x, o.y, width, height));
  }

  async function handleConfirm() {
    const img = new Image();
    img.src = imgUrl!;
    if (!img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    }

    const cropW = viewW / scale;
    const cropH = viewH / scale;
    const cropX = Math.max(0, ((dispW - viewW) / 2 - offset.x) / scale);
    const cropY = Math.max(0, ((dispH - viewH) / 2 - offset.y) / scale);

    const outW = aspect >= 1 ? outputSize : Math.round(outputSize * aspect);
    const outH = aspect >= 1 ? Math.round(outputSize / aspect) : outputSize;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], currentFile.name.replace(/\.[^.]+$/, "") + ".jpg", {
          type: "image/jpeg",
        });
        onConfirm(croppedFile);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajustar foto" size="sm">
      <p className="mb-4 text-sm text-bone-500">
        Arraste a imagem para posicionar e use o zoom para centralizar sua foto antes de salvar.
      </p>

      <div
        className="relative mx-auto touch-none select-none overflow-hidden rounded-card border border-ink-700 bg-ink-900"
        style={{
          width: viewW,
          height: viewH,
          cursor: "grab",
          backgroundImage: `url(${imgUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${dispW}px ${dispH}px`,
          backgroundPosition: `${(viewW - dispW) / 2 + offset.x}px ${(viewH - dispH) / 2 + offset.y}px`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="mt-4 flex items-center gap-3">
        <ZoomIn className="h-4 w-4 shrink-0 text-bone-500" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className="w-full accent-gold-400"
          aria-label="Zoom da foto"
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="button" variant="gold" onClick={handleConfirm} isLoading={isSaving}>
          <Check className="h-4 w-4" /> Salvar foto
        </Button>
      </div>
    </Modal>
  );
}