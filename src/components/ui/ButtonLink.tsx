import { Link, type LinkProps } from "react-router-dom";
import { buttonClasses } from "./Button";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

export function ButtonLink({ variant = "primary", size = "md", fullWidth, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
