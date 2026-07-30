import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to={ROUTES.home} className={cn("group flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/50 bg-ink-800 text-crimson-500 transition-transform group-hover:rotate-12">
        <Scissors className="h-4 w-4" />
      </span>
      <span className="font-display leading-none tracking-wide">
        <span className="block text-[10px] text-gold-400">FÓRMULA</span>
        <span className="block text-base text-bone-50">DA BELEZA</span>
      </span>
    </Link>
  );
}
