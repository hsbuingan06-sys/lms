import { useMemo, useState } from 'react';
import { ArrowUpRight, Clock3, ListChecks, Plus, Search, Settings2, Users } from 'lucide-react';
import { Link } from 'wouter';
import { getListLmsCoursesQueryKey, useListLmsCourses } from '@/api';
import type { Course } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heading, QueryState, accentBackgrounds } from '@/components/common';
import { CourseDialog } from '@/components/dialogs';
import { useRole } from '@/contexts/RoleContext';

export default function Courses() {
  const { role } = useRole();
  const q = useListLmsCourses({ query: { queryKey: getListLmsCoursesQueryKey() } });
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>();

  const courses = useMemo(
    () => (q.data ?? []).filter(c => `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase())),
    [q.data, search]
  );

  const eyebrow = role === 'student' ? 'Góc học tập của bạn' : role === 'lecturer' ? 'Tổ Sư Phạm · Lớp giảng dạy' : 'Ban Giám Hiệu · Quản lý';
  const title = role === 'student' ? 'Khóa học của tôi' : role === 'lecturer' ? 'Lớp học phụ trách' : 'Quản lý toàn bộ Khóa học';
  const description =
    role === 'student'
      ? 'Danh sách các khóa học bạn đang tham gia. Bấm "Vào học ngay" để tiếp tục tiến độ.'
      : role === 'lecturer'
      ? 'Các môn học do Cô Bui Ngan giảng dạy và biên soạn nội dung.'
      : 'Danh mục tất cả các khóa học trong hệ thống nhà trường.';

  return (
    <div className="page-enter">
      <Heading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          role !== 'student' && (
            <Button
              onClick={() => {
                setEditing(undefined);
                setDialog(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Soạn khóa học mới
            </Button>
          )
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{courses.length} khóa học trong danh mục</p>
        <div className="relative w-full sm:max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm môn học..." className="pl-9" />
        </div>
      </div>
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && q.data.length === 0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, i) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-card-border shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="relative h-[115px] overflow-hidden"
                style={{ background: accentBackgrounds[course.accent] ?? (i % 2 ? '#d6e2d8' : '#ead9c9') }}
              >
                <div className="absolute -right-3 -top-8 h-32 w-32 rounded-full border-[20px] border-white/20" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-800">
                    {course.category || 'Môn học'}
                  </span>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] font-medium text-slate-800">
                    {course.level}
                  </span>
                </div>
                <span className="absolute right-3 top-3 rounded-md bg-white/65 px-2 py-0.5 text-[9px] font-bold tracking-[.1em] text-slate-700">
                  {course.format}
                </span>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[16px] font-bold leading-snug">{course.title}</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Giảng viên: <span className="font-semibold text-foreground">Cô Bui Ngan</span>
                    </p>
                  </div>
                  {role !== 'student' && (
                    <button
                      onClick={() => {
                        setEditing(course);
                        setDialog(true);
                      }}
                      aria-label={`Sửa ${course.title}`}
                      className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Settings2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{course.description}</p>
                <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ListChecks size={13} />
                    {course.lessons} bài
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {course.enrolled} học viên
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10px] text-muted-foreground">
                    Tiến độ: <b className="text-foreground">{course.progress}%</b>
                  </span>
                  {role === 'student' ? (
                    <Link
                      href="/learn"
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Vào học ngay <ArrowUpRight size={13} />
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {course.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
      <CourseDialog open={dialog} course={editing} onClose={() => setDialog(false)} />
    </div>
  );
}
