import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  className?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  required,
  description,
  className,
}: FormFieldProps<T>) {
  const { register, formState } = useFormContext<T>();
  const error = formState.errors[name];
  const errorMessage = error && (error.message as string | undefined);
  const id = `field-${String(name)}`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className={required ? "after:ml-0.5 after:text-destructive after:content-['*']" : undefined}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled || formState.isSubmitting}
        aria-invalid={!!error}
        aria-describedby={errorMessage ? `${id}-error` : description ? `${id}-desc` : undefined}
        {...register(name)}
      />
      {description && !errorMessage && (
        <p id={`${id}-desc`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {errorMessage && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
