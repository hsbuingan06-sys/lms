import { Award } from 'lucide-react';
import { getListLmsBadgesQueryKey, useListLmsBadges } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, QueryState } from '@/components/common';

export default function Gamification() {
  const badgesQuery = useListLmsBadges({ query: { queryKey: getListLmsBadgesQueryKey() } });

  return (
    <div className="page-enter">
      <Heading
        eyebrow="Khen thưởng & Động lực"
        title="Bộ sưu tập Huy hiệu"
        description="Mỗi huy hiệu là một minh chứng cho bước tiến vượt bậc của học viên."
      />
      <QueryState loading={badgesQuery.isLoading} error={badgesQuery.error} refetch={() => badgesQuery.refetch()}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(badgesQuery.data ?? []).map(badge => (
            <Card key={badge.id} className="border-card-border shadow-2xs">
              <CardContent className="flex gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f3e8c9] text-[#9b7627]">
                  <Award size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-bold">{badge.name}</h3>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                      Đã trao
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                    <span>
                      Học viên: <b className="text-foreground">{badge.learner}</b>
                    </span>
                    <span>{badge.awardedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
