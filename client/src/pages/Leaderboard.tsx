import { Flame, Trophy } from 'lucide-react';
import { getGetLmsLeaderboardQueryKey, useGetLmsLeaderboard } from '@/api';
import { Heading, QueryState } from '@/components/common';
import { useRole } from '@/contexts/RoleContext';

export default function Leaderboard() {
  const { role } = useRole();
  const q = useGetLmsLeaderboard({ query: { queryKey: getGetLmsLeaderboardQueryKey() } });
  const podium = (q.data ?? []).slice(0, 3);

  const title =
    role === 'student' ? 'Bảng vinh danh lớp 10A' : role === 'lecturer' ? 'Phong trào thi đua của lớp' : 'Bảng xếp hạng toàn trường';

  return (
    <div className="page-enter">
      <Heading
        eyebrow="Động lực học tập"
        title={title}
        description="Ghi nhận những thói quen học tập bền bỉ, chuỗi ngày chăm chỉ và điểm số tích lũy."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">
            <Flame size={14} className="text-[#bd6846]" />
            Chuỗi ngày học liên tục
          </span>
        }
      />
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!q.data?.length}>
        {podium.length > 0 && (
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry, i) => (
              <div
                key={entry.id}
                className={`relative overflow-hidden rounded-2xl border border-card-border p-5 text-center ${
                  i === 1 ? 'bg-[#dce9df] dark:bg-[#203b33] md:-mt-2 md:pb-7' : 'bg-card'
                }`}
              >
                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-background text-primary shadow-xs">
                  <Trophy size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Hạng #{entry.rank}
                </span>
                <p className="mt-1 font-display text-base font-bold">{entry.name}</p>
                <p className="text-[11px] text-muted-foreground">{entry.team}</p>
                <p className="mt-2 font-mono text-xl font-bold">
                  {entry.points.toLocaleString('vi-VN')}
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">điểm</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
