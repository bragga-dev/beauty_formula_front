import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface CarouselProps {
  children: ReactNode[];
  /** Largura de cada item (classes Tailwind). Controla quantos itens aparecem por vez em cada breakpoint. */
  itemClassName?: string;
  className?: string;
}

/**
 * Carrossel horizontal com scroll-snap nativo do CSS — sem dependência externa.
 * Suporta swipe/touch e trackpad nativamente (é scroll de verdade), com setas
 * de apoio para desktop. As setas ficam desabilitadas nas pontas.
 */
export function Carousel({ children, itemClassName, className }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, children.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (children.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {canScrollPrev && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-ink-600 bg-ink-900/90 p-2.5 text-bone-100 shadow-elevated backdrop-blur transition hover:border-gold-400 hover:text-gold-400 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollNext && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Próximo"
          className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-ink-600 bg-ink-900/90 p-2.5 text-bone-100 shadow-elevated backdrop-blur transition hover:border-gold-400 hover:text-gold-400 sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}