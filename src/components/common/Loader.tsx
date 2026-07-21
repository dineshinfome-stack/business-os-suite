import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader size={32} />
    </div>
  );
}

export function ButtonLoader() {
  return <Loader size={16} className="text-current" />;
}
