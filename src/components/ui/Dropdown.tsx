import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full z-40 mt-2 min-w-48 overflow-hidden rounded-card border border-ink-700 bg-ink-800 py-1 shadow-elevated",
            align === "right" ? "right-0" : "left-0",
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-bone-300 transition-colors hover:bg-ink-700 hover:text-bone-50",
        className,
      )}
      {...props}
    />
  );
}
