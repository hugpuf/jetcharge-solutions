import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  step?: string;
}

export function FormField({ label, value, onChange, prefix, step = "1" }: FormFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-muted-foreground font-normal">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70 pointer-events-none z-10">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`input-pill numeric-input ${prefix ? 'pl-8' : ''} focus-visible:ring-0 focus-visible:ring-offset-0`}
        />
      </div>
    </div>
  );
}