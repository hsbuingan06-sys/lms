import { BookOpen, Compass } from 'lucide-react';
import { Link } from 'wouter';
import { getListLmsLearningPathsQueryKey, useListLmsLearningPaths } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, QueryState, accentBackgrounds } from '@/components/common';
import { useRole } from '@/contexts/RoleContext';

export default function Paths() {
  const { role } = useRole();
  const q = useListLmsLearningPaths({ query: { queryKey: getListLmsLearningPathsQueryKey() } });
  const colors = ['#dce9df', '#efe1d4', '#e5e1ef', '#f1e9ce'];

  const title = role === 'student' ? 'Lộ trình học tập của bạn' : role === 'lecturer' ? 'Khung bài giảng theo lộ trình' : 'Khung Lộ trình Đào tạo Toàn trường';
  const description =
    role === 'student'
      ? 'Hành trình các môn học được xếp theo thứ tự bậc thang giúp bạn tiến bộ mỗi ngày.'
      : 'Thiết kế chuỗi khóa học kết nối kiến thức bài bản cho học sinh.';

  return (
    <div className="page-enter">
      <Heading
        eyebrow="Khung đào tạo"
        title={title}
        description={description}
        action={
          <Link
            href="/courses"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:bg-muted"
          >
            <BookOpen size={14} /> Xem danh sách môn
          </Link>
        }
      />
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
        <div className="grid gap-5 lg:grid-cols-2">
          {(q.data ?? []).map((path, i) => (
            <Card key={path.id} className="overflow-hidden border-card-border shadow-2xs">
              <div
                className="flex min-h-[130px] items-center justify-between px-6 py-5"
                style={{ background: accentBackgrounds[path.accent] ?? colors[i % colors.length] }}
              >
                <div className="max-w-[75%]">
                  <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-800">
                    LỘ TRÌNH 0{i + 1}
                  </span>
                  <h2 className="mt-2 font-display text-[20px] font-extrabold tracking-tight text-slate-900">{path.title}</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/60 text-slate-800">
                  <Compass size={22} />
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-xs leading-relaxed text-muted-foreground">{path.description}</p>
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Thứ tự môn học</p>
                  <ol className="space-y-1.5">
                    {(path.courseTitles ?? []).map((t, idx) => (
                      <li key={`${path.id}-${t}`} className="flex items-center gap-2 text-xs">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[9px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-3 text-[11px]">
                  <span>Hoàn thành trung bình</span>
                  <span className="font-bold text-foreground">{path.completion}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
