import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

/**
 * ButtonLink — renders a react-router <Link> with Button styling.
 * Use this instead of <Button asChild><Link /></Button> since
 * @base-ui/react's Button does not support the asChild/Slot pattern.
 */
export function ButtonLink({
  to,
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <Link
      to={to}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
