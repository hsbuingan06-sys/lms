import { type ReactNode } from 'react';

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">
        {label}
        {required && <i className="ml-1 text-destructive">*</i>}
      </span>
      {children}
    </label>
  );
}
