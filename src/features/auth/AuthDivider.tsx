interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "ou" }: AuthDividerProps) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-ink-700" />
      <span className="text-xs uppercase tracking-widest text-bone-600">{label}</span>
      <span className="h-px flex-1 bg-ink-700" />
    </div>
  );
}