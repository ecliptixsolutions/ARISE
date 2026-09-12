import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
};

export function PasswordField({
  name,
  label,
  autoComplete,
  minLength = 8,
  required = true,
  className = "",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <label className={`grid gap-1.5 text-sm ${className}`}>
      <span className="font-medium text-navy">{label}</span>
      <span className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-11 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-surface"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}
