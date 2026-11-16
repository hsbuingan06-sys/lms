import { type ReactNode } from 'react';

export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-.03em] md:text-[34px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
