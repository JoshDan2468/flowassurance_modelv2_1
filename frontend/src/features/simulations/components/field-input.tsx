import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  unit?: string;
  step?: string;
  hint?: string;
  className?: string;
}

export function FieldInput<T extends FieldValues>({
  name,
  label,
  unit,
  step = "any",
  hint,
  className,
}: FieldInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = (errors as Record<string, { message?: string } | undefined>)[name as string];

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type="number"
          step={step}
          inputMode="decimal"
          {...register(name, { valueAsNumber: true })}
          className={cn(
            "h-10 border-border/60 bg-background/60 pr-14 font-mono text-sm",
            error && "border-destructive focus-visible:ring-destructive/40",
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {error?.message ? (
        <p className="text-[11px] text-destructive">{error.message}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
