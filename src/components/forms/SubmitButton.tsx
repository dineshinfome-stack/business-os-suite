import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/common/Loader";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { formState } = useFormContext();
  const busy = formState.isSubmitting;
  return (
    <Button type="submit" disabled={busy || disabled} className={cn(className)}>
      {busy && <ButtonLoader />}
      <span>{children}</span>
    </Button>
  );
}
