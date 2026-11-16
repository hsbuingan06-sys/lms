import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tint,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  icon: LucideIcon;
  tint?: string;
}) {
  return (
    <Card className="overflow-hidden border-card-border shadow-2xs">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint ?? 'bg-secondary text-primary'}`}>
            <Icon size={17} />
          </span>
        </div>
        <div className="mt-3 font-display text-[28px] font-extrabold tracking-[-.03em]">{value}</div>
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
