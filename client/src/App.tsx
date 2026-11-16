import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Award, BookOpen, ChevronRight, CircleHelp, Clock3, Code2,
  Compass, FileBadge2, Flame, GraduationCap, Layers3, LayoutDashboard,
  ListChecks, Menu, Moon, Play, Plus, Search, Settings2, ShieldCheck, Sun,
  Users, X, Zap, Check, RefreshCw, ArrowUpRight, Activity, Video, Trophy,
} from 'lucide-react';
import {
  getGetLmsDashboardQueryKey, getGetLmsLeaderboardQueryKey, getListLmsBadgesQueryKey,
  getListLmsCertificatesQueryKey, getListLmsCoursesQueryKey,
  getListLmsLearnersQueryKey, getListLmsLearningPathsQueryKey,
  getListLmsPluginsQueryKey, useAutoEnrollLearners, useCompleteLmsLesson,
  useCreateLmsCourse, useGetLmsDashboard, useGetLmsLeaderboard,
  useListLmsBadges, useListLmsCertificates, useListLmsCourses, useListLmsLearners,
  useListLmsLearningPaths, useListLmsPlugins, useRecordXapiEvent,
  useUpdateLmsCourse,
} from '@/api';
import type { Course, CourseInput, Learner } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Route, Switch, Link, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const accentBackgrounds: Record<string, string> = {
  teal: '#dce9df',
  violet: '#e5e1ef',
  amber: '#f1e9ce',
  blue: '#dce8f2',
  rose: '#f1dfdc',
};

const nav = [
  { label: 'Tổng quan', href: '/', icon: LayoutDashboard, group: 'workspace' },
  { label: 'Khóa học', href: '/courses', icon: BookOpen, group: 'workspace' },
  { label: 'Học viên', href: '/learners', icon: Users, group: 'workspace' },
  { label: 'Lộ trình học', href: '/paths', icon: Compass, group: 'workspace' },
  { label: 'Chứng chỉ', href: '/certificates', icon: FileBadge2, group: 'insights' },
  { label: 'Bảng xếp hạng', href: '/leaderboard', icon: Trophy, group: 'insights' },
  { label: 'Huy hiệu & thành tích', href: '/gamification', icon: Award, group: 'insights' },
  { label: 'Tích hợp', href: '/plugins', icon: Settings2, group: 'manage' },
  { label: 'Không gian học', href: '/learn', icon: Play, group: 'manage' },
];

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('lms-theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lms-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => setMobileOpen(false), [location]);
  return <div className="min-h-[100dvh] bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[82px] items-center gap-3 border-b border-sidebar-border px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><GraduationCap size={23}/></div>
        <div><div className="font-display text-[20px] font-extrabold leading-none tracking-tight">nếp học</div><div className="mt-1 text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/55">Learning workspace</div></div>
        <button className="ml-auto rounded-lg p-2 text-sidebar-foreground/70 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={18}/></button>
      </div>
      <div className="px-4 pt-7">
        {['workspace', 'insights', 'manage'].map((group, index) => <div key={group} className={index ? 'mt-7' : ''}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/40">{group === 'workspace' ? 'Không gian' : group === 'insights' ? 'Theo dõi' : 'Quản trị'}</p>
          <nav className="space-y-1">{nav.filter(item => item.group === group).map(item => {
            const active = location === item.href;
            return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`} className={`group flex items-center gap-3 rounded-xl px-3 py-[10px] text-[13px] font-medium transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <item.icon size={17} strokeWidth={active ? 2.2 : 1.8}/><span>{item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"/>}
            </Link>;
          })}</nav>
        </div>)}
      </div>
      <div className="mt-auto p-4">
        <Link href="/learn" className="block rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4 transition hover:bg-sidebar-accent" data-testid="link-learning-portal-card">
          <div className="mb-3 flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary/20 text-sidebar-primary"><Zap size={16}/></span><ArrowUpRight size={15} className="text-sidebar-foreground/45"/></div>
          <p className="text-xs font-semibold">Tiếp tục phát triển</p><p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/55">Một bài học nhỏ, tiến bộ lớn.</p>
        </Link>
        <div className="mt-4 flex items-center gap-3 border-t border-sidebar-border pt-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d9a788] text-[11px] font-bold text-[#34261e]">NT</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">Nếp Training</p><p className="text-[10px] text-sidebar-foreground/50">Quản trị viên</p></div>
          <button onClick={() => setDark(!dark)} aria-label="Đổi giao diện" data-testid="button-theme-toggle" className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground">{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Đóng điều hướng" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 md:hidden"/>}
    <div className="min-h-[100dvh] md:pl-[252px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl md:px-9">
        <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu size={19}/></button>
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span>Workspace</span><ChevronRight size={13}/><span className="font-medium text-foreground">{nav.find(item => item.href === location)?.label ?? 'Tổng quan'}</span></div>
          <div className="sm:hidden font-display text-lg font-bold">nếp học</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary"/><span>Hệ thống đang hoạt động</span></div>
          <button onClick={() => setDark(!dark)} aria-label="Đổi giao diện" data-testid="button-theme-header" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d9a788] text-[11px] font-bold text-[#34261e]">NT</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-7 md:px-9 md:py-9">{children}</main>
    </div>
  </div>;
}

function Heading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-primary">{eyebrow}</p><h1 className="font-display text-[32px] font-extrabold leading-tight tracking-[-.04em] md:text-[38px]" data-testid="text-page-title">{title}</h1><p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p></div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>;
}

function Notice({ message, error, onClose }: { message: string; error?: boolean; onClose?: () => void }) {
  if (!message) return null;
  return <div role="status" data-testid="status-feedback" className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${error ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-primary/25 bg-primary/5 text-primary'}`}>
    {error ? <CircleHelp size={16}/> : <Check size={16}/>}<span className="flex-1">{message}</span>{onClose && <button onClick={onClose} aria-label="Đóng thông báo"><X size={15}/></button>}
  </div>;
}

function LoadingState() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="state-loading">{[1,2,3,4].map(i => <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-card/70"/>)}</div>;
}

function QueryState({ loading, error, refetch, empty, children }: { loading: boolean; error: unknown; refetch: () => void; empty?: boolean; children: ReactNode }) {
  if (loading) return <LoadingState/>;
  if (error) return <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center" data-testid="state-error"><div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-destructive/10 text-destructive"><RefreshCw size={19}/></div><h3 className="font-display text-lg font-bold">Không thể tải dữ liệu</h3><p className="mt-1 text-sm text-muted-foreground">Kiểm tra kết nối rồi thử lại nhé.</p><Button onClick={refetch} variant="outline" className="mt-4" data-testid="button-retry"><RefreshCw size={15} className="mr-2"/>Thử lại</Button></div>;
  if (empty) return <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center" data-testid="state-empty"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Layers3 size={21}/></div><h3 className="font-display text-lg font-bold">Chưa có dữ liệu</h3><p className="mt-1 text-sm text-muted-foreground">Nội dung sẽ xuất hiện ở đây khi được thêm vào workspace.</p></div>;
  return <>{children}</>;
}

function StatCard({ label, value, hint, icon: Icon, tint }: { label: string; value: ReactNode; hint: string; icon: typeof Users; tint?: string }) {
  return <Card className="overflow-hidden border-card-border shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between"><p className="text-[12px] font-medium text-muted-foreground">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${tint ?? 'bg-secondary text-primary'}`}><Icon size={17}/></span></div><div className="mt-4 font-display text-[30px] font-extrabold tracking-[-.04em]" data-testid={`stat-${label.toLowerCase().replaceAll(' ','-')}`}>{value}</div><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></CardContent></Card>;
}

function Dashboard() {
  const q = useGetLmsDashboard({ query: { queryKey: getGetLmsDashboardQueryKey() } });
  const d = q.data;
  const max = Math.max(1, ...(d?.weeklyEngagement ?? []).map(x => x.active));
  return <div className="page-enter">
    <Heading eyebrow="Thứ hai, ngày mới" title="Chào bạn, Nếp." description="Một bức tranh rõ ràng để đội ngũ học tập tiến về phía trước." action={<Link href="/courses" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90" data-testid="link-create-course"><Plus size={16}/>Tạo khóa học</Link>}/>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()}>
      {d && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Khóa học đang chạy" value={d.activeCourses} hint="Nội dung đang mở cho đội ngũ" icon={BookOpen}/>
          <StatCard label="Tổng học viên" value={d.totalLearners.toLocaleString('vi-VN')} hint="Đang phát triển cùng nhau" icon={Users} tint="bg-[#f4e4d8] text-[#ad5e3c]"/>
          <StatCard label="Tỷ lệ hoàn thành" value={`${d.completionRate}%`} hint="Trên tất cả khóa học" icon={ListChecks} tint="bg-[#e6ecd9] text-[#57733c]"/>
          <StatCard label="Chứng chỉ chờ cấp" value={d.pendingCertificates} hint="Sẵn sàng ghi nhận nỗ lực" icon={Award} tint="bg-[#f3e8c9] text-[#9b7627]"/>
        </section>
        <div className="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <Card className="border-card-border shadow-sm"><CardContent className="p-5 md:p-6">
            <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Nhịp học tập</p><h2 className="mt-1 font-display text-xl font-bold">Tuần này trong workspace</h2></div><span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary">7 ngày gần nhất</span></div>
            <div className="mt-8 flex h-[205px] items-end justify-between gap-2 border-b border-border pb-0" data-testid="chart-weekly-engagement">
              {(d.weeklyEngagement ?? []).map((day, i) => <div key={`${day.day}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-[168px] w-full items-end justify-center gap-1">
                  <div title={`${day.active} người học`} className="w-[34%] max-w-8 rounded-t-md bg-primary/75 transition-transform hover:scale-x-110" style={{ height: `${Math.max(7, day.active / max * 100)}%` }}/>
                  <div title={`${day.completed} bài hoàn thành`} className="w-[34%] max-w-8 rounded-t-md bg-accent/80 transition-transform hover:scale-x-110" style={{ height: `${Math.max(5, day.completed / max * 100)}%` }}/>
                </div><span className="pb-2 text-[10px] text-muted-foreground">{day.day}</span>
              </div>)}
            </div><div className="mt-4 flex gap-5 text-[10px] text-muted-foreground"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-primary/75"/>Người học tích cực</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-accent/80"/>Bài hoàn thành</span></div>
          </CardContent></Card>
          <Card className="border-card-border shadow-sm"><CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Tín hiệu gần đây</p><h2 className="mt-1 font-display text-xl font-bold">Hoạt động mới</h2></div><Activity size={17} className="text-primary"/></div>
            <div className="mt-5 space-y-1">
              {(d.recentActivity ?? []).length ? d.recentActivity.map((item, i) => <div key={item.id} data-testid={`activity-item-${item.id}`} className="flex gap-3 rounded-xl px-2 py-3 hover:bg-muted/70">
                <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.kind === 'certificate' ? 'bg-[#f3e8c9] text-[#9b7627]' : item.kind === 'completion' ? 'bg-[#e6ecd9] text-[#57733c]' : 'bg-secondary text-primary'}`}>
                  {item.kind === 'certificate' ? <Award size={15}/> : item.kind === 'completion' ? <Check size={15}/> : item.kind === 'quiz' ? <ListChecks size={15}/> : <Users size={15}/>}
                </div><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold">{item.title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.detail}</p></div><span className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">{item.time}</span>
              </div>) : <p className="py-10 text-center text-sm text-muted-foreground">Hoạt động mới sẽ xuất hiện tại đây.</p>}
            </div>
          </CardContent></Card>
        </div>
        <div className="mt-6 rounded-2xl bg-[#dce9df] p-6 text-[#27453a] dark:bg-[#203b33] dark:text-[#d7e9dc] md:flex md:items-center md:justify-between">
          <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/60 dark:bg-white/10"><Compass size={21}/></div><div><p className="font-display text-lg font-bold">Học tốt hơn khi biết đường đi.</p><p className="mt-1 text-sm opacity-75">Xây lộ trình rõ ràng để mỗi bước tiến đều có ý nghĩa.</p></div></div>
          <Link href="/paths" className="mt-4 inline-flex items-center gap-2 text-sm font-bold md:mt-0" data-testid="link-explore-paths">Khám phá lộ trình <ArrowUpRight size={15}/></Link>
        </div>
      </>}
    </QueryState>
  </div>;
}

type CourseDialogProps = { open: boolean; onClose: () => void; course?: Course };
function CourseDialog({ open, onClose, course }: CourseDialogProps) {
  const qc = useQueryClient();
  const create = useCreateLmsCourse();
  const update = useUpdateLmsCourse();
  const [feedback, setFeedback] = useState('');
  const [err, setErr] = useState(false);
  const [form, setForm] = useState<CourseInput>({ title: '', description: '', category: '', level: 'Cơ bản', duration: '', lessons: 1, format: 'Native' });
  useEffect(() => {
    if (open) {
      setForm(course ? { title: course.title, description: course.description, category: course.category, level: course.level, duration: course.duration, lessons: course.lessons, format: course.format } : { title: '', description: '', category: '', level: 'Cơ bản', duration: '', lessons: 1, format: 'Native' });
      setFeedback('');
    }
  }, [open, course]);
  if (!open) return null;
  const pending = create.isPending || update.isPending;
  const set = (key: keyof CourseInput, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(''); setErr(false);
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: getListLmsCoursesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetLmsDashboardQueryKey() });
      setFeedback(course ? 'Đã cập nhật khóa học.' : 'Đã tạo khóa học mới.');
      setTimeout(onClose, 650);
    };
    const onError = () => { setErr(true); setFeedback('Chưa thể lưu khóa học. Vui lòng kiểm tra lại và thử lần nữa.'); };
    if (course) update.mutate({ id: course.id, data: form }, { onSuccess, onError });
    else create.mutate({ data: form }, { onSuccess, onError });
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="course-dialog-title" className="max-h-[92dvh] w-full max-w-[570px] overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{course ? 'Chỉnh sửa nội dung' : 'Thư viện nội dung'}</p><h2 id="course-dialog-title" className="mt-1 font-display text-2xl font-bold">{course ? 'Cập nhật khóa học' : 'Tạo khóa học mới'}</h2></div><button onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X size={18}/></button></div>
      {feedback && <Notice message={feedback} error={err}/>}
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tên khóa học" required><Input required minLength={2} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ví dụ: Giao tiếp cùng khách hàng" data-testid="input-course-title"/></Field>
        <Field label="Mô tả"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Khóa học giúp người học..." className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-course-description"/></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Danh mục"><Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Kỹ năng mềm" data-testid="input-course-category"/></Field><Field label="Thời lượng"><Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="2 giờ 30 phút" data-testid="input-course-duration"/></Field></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cấp độ"><select value={form.level} onChange={e => set('level', e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" data-testid="select-course-level"><option>Cơ bản</option><option>Trung cấp</option><option>Nâng cao</option></select></Field>
          <Field label="Số bài học"><Input type="number" min={1} value={form.lessons} onChange={e => set('lessons', Number(e.target.value))} data-testid="input-course-lessons"/></Field>
          <Field label="Định dạng"><select value={form.format} onChange={e => set('format', e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" data-testid="select-course-format"><option>Native</option><option>SCORM 1.2</option><option>xAPI</option><option>H5P</option></select></Field>
        </div>
        {course && <Field label="Trạng thái"><select value={course.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value } as CourseInput))} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" data-testid="select-course-status"><option>Đang hoạt động</option><option>Bản nháp</option><option>Lưu trữ</option></select></Field>}
        <div className="flex justify-end gap-2 border-t border-border pt-4"><Button variant="outline" type="button" onClick={onClose}>Hủy</Button><Button type="submit" disabled={pending} data-testid="button-save-course">{pending ? 'Đang lưu...' : course ? 'Lưu thay đổi' : 'Tạo khóa học'}</Button></div>
      </form>
    </div>
  </div>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) { return <label className="block space-y-1.5"><span className="text-xs font-semibold">{label}{required && <i className="ml-1 text-destructive">*</i>}</span>{children}</label>; }

function Courses() {
  const q = useListLmsCourses({ query: { queryKey: getListLmsCoursesQueryKey() } });
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>();
  const courses = useMemo(() => (q.data ?? []).filter(c => `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase())), [q.data, search]);
  return <div className="page-enter">
    <Heading eyebrow="Nội dung học tập" title="Khóa học" description="Tạo nội dung có cấu trúc và theo dõi hành trình học tập của đội ngũ." action={<Button onClick={() => { setEditing(undefined); setDialog(true); }} data-testid="button-new-course"><Plus size={16} className="mr-2"/>Tạo khóa học</Button>}/>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{q.data?.length ?? 0} khóa học trong thư viện</p><div className="relative w-full sm:max-w-[280px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khóa học..." className="pl-9" data-testid="input-search-courses"/></div></div>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && q.data.length === 0}>
      {courses.length === 0 && q.data?.length ? <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">Không tìm thấy khóa học phù hợp.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course, i) => <Card key={course.id} data-testid={`card-course-${course.id}`} className="group overflow-hidden border-card-border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="relative h-[124px] overflow-hidden" style={{ background: accentBackgrounds[course.accent] ?? (i % 2 ? '#d6e2d8' : '#ead9c9') }}><div className="absolute -right-3 -top-8 h-36 w-36 rounded-full border-[22px] border-white/25"/><div className="absolute bottom-4 left-5 flex items-center gap-2"><span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">{course.category || 'Chuyên môn'}</span><span className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-medium text-slate-700">{course.level}</span></div><span className="absolute right-4 top-4 rounded-lg bg-white/65 px-2 py-1 text-[9px] font-bold tracking-[.12em] text-slate-700">{course.format}</span></div>
        <CardContent className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-[17px] font-bold leading-snug">{course.title}</h2><button onClick={() => { setEditing(course); setDialog(true); }} aria-label={`Sửa ${course.title}`} className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground" data-testid={`button-edit-course-${course.id}`}><Settings2 size={15}/></button></div><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">{course.description || 'Nội dung học tập được thiết kế để giúp đội ngũ tiến bộ từng ngày.'}</p>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><ListChecks size={13}/>{course.lessons} bài học</span><span className="flex items-center gap-1"><Clock3 size={13}/>{course.duration}</span><span className="flex items-center gap-1"><Users size={13}/>{course.enrolled} học viên</span></div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><Badge variant="outline" className="text-[10px]">{course.status}</Badge><span className="text-[10px] font-medium text-muted-foreground">Tiến độ trung bình <b className="ml-1 text-foreground">{course.progress}%</b></span></div>
        </CardContent></Card>)}</div>}
    </QueryState>
    <CourseDialog open={dialog} course={editing} onClose={() => setDialog(false)}/>
  </div>;
}

function EnrollDialog({ open, onClose, learners, courses }: { open: boolean; onClose: () => void; learners: Learner[]; courses: Course[] }) {
  const qc = useQueryClient();
  const mutation = useAutoEnrollLearners();
  const [courseId, setCourseId] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => { if (open) { setSelected([]); setMessage(''); setCourseId(courses[0] ? String(courses[0].id) : ''); } }, [open, courses]);
  if (!open) return null;
  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const submit = () => {
    setMessage(''); setError(false);
    mutation.mutate({ data: { courseId: Number(courseId), learnerIds: selected } }, {
      onSuccess: result => {
        qc.invalidateQueries({ queryKey: getListLmsLearnersQueryKey() });
        qc.invalidateQueries({ queryKey: getListLmsCoursesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLmsDashboardQueryKey() });
        setMessage(`${result.message} (${result.enrolled} ghi danh mới, ${result.skipped} đã được ghi danh trước đó).`);
      },
      onError: () => { setError(true); setMessage('Không thể tự động ghi danh. Vui lòng thử lại.'); },
    });
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><div role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
    <div className="mb-5 flex justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-primary">Ghi danh tự động</p><h2 className="mt-1 font-display text-2xl font-bold">Chọn người học</h2></div><button onClick={onClose} aria-label="Đóng" className="p-2 text-muted-foreground"><X size={18}/></button></div>
    {message && <Notice message={message} error={error}/>}
    <Field label="Khóa học"><select value={courseId} onChange={e => setCourseId(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" data-testid="select-enroll-course">{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
    <div className="mt-4 flex items-center justify-between"><span className="text-xs font-semibold">Học viên ({selected.length} đã chọn)</span><button onClick={() => setSelected(selected.length === learners.length ? [] : learners.map(l => l.id))} className="text-xs font-semibold text-primary" data-testid="button-toggle-all-learners">{selected.length === learners.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</button></div>
    <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border p-2">{learners.map(person => <label key={person.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"><input type="checkbox" checked={selected.includes(person.id)} onChange={() => toggle(person.id)} className="accent-[hsl(var(--primary))]" data-testid={`checkbox-learner-${person.id}`}/><Avatar name={person.name}/><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{person.name}</span><span className="block truncate text-[10px] text-muted-foreground">{person.team}</span></span></label>)}</div>
    <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Đóng</Button><Button onClick={submit} disabled={mutation.isPending || !courseId || !selected.length} data-testid="button-auto-enroll">{mutation.isPending ? 'Đang ghi danh...' : `Ghi danh ${selected.length || ''}`}</Button></div>
  </div></div>;
}
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.trim().split(/\s+/).slice(-2).map(x => x[0]).join('').toUpperCase();
  const colors = ['bg-[#dce9df] text-[#365642]', 'bg-[#f3e3d5] text-[#8c5138]', 'bg-[#e7e1ef] text-[#62517a]', 'bg-[#f1e9ce] text-[#8a6b22]'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return <span className={`grid shrink-0 place-items-center rounded-full font-bold ${size === 'md' ? 'h-11 w-11 text-xs' : 'h-8 w-8 text-[10px]'} ${color}`}>{initials}</span>;
}

function Learners() {
  const q = useListLmsLearners({ query: { queryKey: getListLmsLearnersQueryKey() } });
  const c = useListLmsCourses({ query: { queryKey: getListLmsCoursesQueryKey() } });
  const [search, setSearch] = useState('');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const learners = (q.data ?? []).filter(l => `${l.name} ${l.email} ${l.team}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-enter">
    <Heading eyebrow="Cộng đồng học tập" title="Học viên" description="Nhìn thấy đội ngũ đang học gì, cùng với những bước tiến gần nhất." action={<Button onClick={() => setEnrollOpen(true)} disabled={!q.data?.length || !c.data?.length} data-testid="button-open-enrollment"><Plus size={16} className="mr-2"/>Ghi danh học viên</Button>}/>
    <Card className="mb-5 border-card-border shadow-sm"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Users size={18}/></div><div><p className="font-display text-lg font-bold">{q.data?.length ?? '—'} học viên</p><p className="text-[11px] text-muted-foreground">Đội ngũ tiến bộ, cùng một nhịp</p></div></div><div className="relative w-full sm:max-w-[280px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email, nhóm..." className="pl-9" data-testid="input-search-learners"/></div></CardContent></Card>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
      {learners.length === 0 && q.data?.length ? <div className="py-14 text-center text-sm text-muted-foreground">Không có học viên phù hợp với tìm kiếm này.</div> : <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_110px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid"><span>Học viên</span><span>Nhóm</span><span>Khóa học hiện tại</span><span>Hoạt động gần nhất</span><span>Tiến độ</span></div>
        {learners.map(l => <div key={l.id} data-testid={`row-learner-${l.id}`} className="grid gap-3 border-b border-border px-4 py-4 last:border-0 hover:bg-muted/30 md:grid-cols-[1.4fr_1fr_1fr_1fr_110px] md:items-center md:gap-4 md:px-5">
          <div className="flex items-center gap-3"><Avatar name={l.name}/><div className="min-w-0"><p className="truncate text-xs font-bold">{l.name}</p><p className="truncate text-[10px] text-muted-foreground">{l.email}</p></div></div>
          <div className="flex justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Nhóm</span><span className="text-xs">{l.team}</span></div>
          <div className="flex justify-between gap-3 text-xs md:block"><span className="text-muted-foreground md:hidden">Đang học</span><span className="line-clamp-1 text-xs">{l.activeCourse || 'Chưa ghi danh'}</span></div>
          <div className="flex justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Hoạt động</span><span className="text-xs text-muted-foreground">{l.lastActive}</span></div>
          <div><div className="flex justify-between text-[10px]"><span className="text-muted-foreground md:hidden">Tiến độ</span><b>{l.progress}%</b></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(l.progress,100)}%` }}/></div></div>
        </div>)}
      </div>}
    </QueryState>
    <EnrollDialog open={enrollOpen} onClose={() => setEnrollOpen(false)} learners={q.data ?? []} courses={c.data ?? []}/>
  </div>;
}

function Paths() {
  const q = useListLmsLearningPaths({ query: { queryKey: getListLmsLearningPathsQueryKey() } });
  const colors = ['#dce9df', '#efe1d4', '#e5e1ef', '#f1e9ce'];
  return <div className="page-enter"><Heading eyebrow="Thiết kế phát triển" title="Lộ trình học" description="Một con đường học tập rõ ràng, kết nối kỹ năng thành sự tiến bộ thực tế." action={<Link href="/courses" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted" data-testid="link-path-courses"><BookOpen size={16}/>Xem khóa học</Link>}/>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
      <div className="grid gap-5 lg:grid-cols-2">{(q.data ?? []).map((path, i) => <Card key={path.id} data-testid={`card-path-${path.id}`} className="overflow-hidden border-card-border shadow-sm">
        <div className="flex min-h-[140px] items-center justify-between px-6 py-5" style={{ background: accentBackgrounds[path.accent] ?? colors[i % colors.length] }}><div className="max-w-[75%]"><span className="rounded-full bg-white/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-700">LỘ TRÌNH 0{i+1}</span><h2 className="mt-3 font-display text-[22px] font-extrabold tracking-tight text-slate-800">{path.title}</h2></div><div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/55 text-slate-700"><Compass size={25}/></div></div>
        <CardContent className="p-5 md:p-6"><p className="text-sm leading-relaxed text-muted-foreground">{path.description}</p>
          <div className="mt-5"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Thứ tự học đề xuất</p><ol className="space-y-2">{(path.courseTitles ?? []).map((title, courseIndex) => <li key={`${path.id}-${title}`} className="flex items-center gap-2.5 text-xs"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary font-mono-ui text-[10px] font-bold text-primary">{String(courseIndex + 1).padStart(2, '0')}</span><span>{title}</span>{courseIndex < (path.courseTitles?.length ?? 0) - 1 && <ChevronRight size={13} className="ml-auto text-muted-foreground"/>}</li>)}</ol></div>
          <div className="mt-5 grid grid-cols-3 gap-3"><PathMetric value={path.courses} label="Khóa học"/><PathMetric value={path.duration} label="Thời lượng"/><PathMetric value={path.learners} label="Học viên"/></div>
          <div className="mt-5"><div className="mb-2 flex justify-between text-[11px]"><span className="font-semibold">Hoàn thành trung bình</span><span className="font-mono-ui text-muted-foreground">{path.completion}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(path.completion,100)}%` }}/></div></div>
        </CardContent></Card>)}</div>
    </QueryState>
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 md:flex md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3e8c9] text-[#9b7627]"><Zap size={18}/></div><div><h3 className="font-display font-bold">Lộ trình là hành trình, không phải danh sách.</h3><p className="mt-1 text-xs text-muted-foreground">Sắp xếp các khóa học theo thứ tự giúp học viên áp dụng kiến thức tốt hơn.</p></div></div><Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary md:mt-0" data-testid="link-create-path-course">Khám phá thư viện <ChevronRight size={14}/></Link></div>
  </div>;
}
function PathMetric({ value, label }: { value: ReactNode; label: string }) { return <div className="rounded-xl bg-muted/65 p-3"><p className="font-display text-lg font-bold">{value}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p></div>; }

function Certificates() {
  const q = useListLmsCertificates({ query: { queryKey: getListLmsCertificatesQueryKey() } });
  return <div className="page-enter"><Heading eyebrow="Ghi nhận thành tựu" title="Chứng chỉ" description="Mỗi chứng chỉ là một cột mốc đáng tự hào trên hành trình phát triển." action={<div className="rounded-full border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground"><ShieldCheck size={14} className="mr-1.5 inline text-primary"/>Chứng chỉ được cấp tự động</div>}/>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
      <Card className="overflow-hidden border-card-border shadow-sm"><div className="grid grid-cols-[1.3fr_1.3fr_1fr_120px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground max-md:hidden"><span>Người nhận</span><span>Khóa học</span><span>Mã chứng chỉ</span><span>Trạng thái</span></div>
        {(q.data ?? []).map(c => <div key={c.id} data-testid={`row-certificate-${c.id}`} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.3fr_1.3fr_1fr_120px] md:items-center md:gap-4">
          <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f3e8c9] text-[#9b7627]"><Award size={17}/></div><div><p className="text-xs font-bold">{c.learner}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{c.issuedAt}</p></div></div><div className="text-xs font-medium">{c.course}</div><code className="font-mono-ui text-[10px] text-muted-foreground">{c.serial}</code><Badge variant={c.status === 'Đã cấp' ? 'default' : 'secondary'} className="w-fit text-[10px]">{c.status}</Badge>
        </div>)}
      </Card>
    </QueryState>
  </div>;
}

function Leaderboard() {
  const q = useGetLmsLeaderboard({ query: { queryKey: getGetLmsLeaderboardQueryKey() } });
  const podium = (q.data ?? []).slice(0,3);
  return <div className="page-enter"><Heading eyebrow="Nỗ lực được nhìn thấy" title="Bảng xếp hạng" description="Ghi nhận những thói quen học tập bền bỉ và tinh thần chia sẻ trong đội ngũ." action={<span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-[11px] font-semibold text-secondary-foreground"><Flame size={15} className="text-[#bd6846]"/>Điểm và chuỗi ngày học</span>}/>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
      {podium.length > 0 && <div className="mb-6 grid gap-3 md:grid-cols-3">{[podium[1],podium[0],podium[2]].filter(Boolean).map((entry, i) => <div key={entry.id} data-testid={`podium-${entry.id}`} className={`relative overflow-hidden rounded-2xl border border-card-border p-5 text-center ${i === 1 ? 'bg-[#dce9df] dark:bg-[#203b33] md:-mt-3 md:pb-8' : 'bg-card'}`}><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-background text-primary"><Trophy size={21}/></div><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hạng #{entry.rank}</span><p className="mt-1 font-display text-lg font-bold">{entry.name}</p><p className="text-[11px] text-muted-foreground">{entry.team}</p><p className="mt-3 font-mono-ui text-2xl font-medium">{entry.points.toLocaleString('vi-VN')}<span className="ml-1 text-[10px] text-muted-foreground">điểm</span></p></div>)}</div>}
      <Card className="overflow-hidden border-card-border shadow-sm"><div className="grid grid-cols-[60px_1.5fr_1fr_100px_90px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground max-md:hidden"><span>Hạng</span><span>Học viên</span><span>Nhóm</span><span>Chuỗi ngày</span><span>Huy hiệu</span></div>
        {(q.data ?? []).map((entry, i) => <div key={entry.id} data-testid={`row-rank-${entry.id}`} className={`grid grid-cols-[40px_1fr_auto] gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[60px_1.5fr_1fr_100px_90px] md:items-center md:gap-4 md:px-5 ${i < 3 ? 'bg-primary/[.035]' : ''}`}>
          <span className={`font-mono-ui text-sm font-bold ${i === 0 ? 'text-[#a77a1e]' : 'text-muted-foreground'}`}>{String(entry.rank).padStart(2,'0')}</span><div className="flex items-center gap-3"><Avatar name={entry.name}/><div><p className="text-xs font-bold">{entry.name}</p><p className="text-[10px] text-muted-foreground md:hidden">{entry.team}</p><p className="mt-0.5 font-mono-ui text-[10px] text-primary">{entry.points.toLocaleString('vi-VN')} điểm</p></div></div><span className="hidden text-xs text-muted-foreground md:block">{entry.team}</span><span className="flex items-center justify-end gap-1.5 text-xs"><Flame size={14} className="text-[#bd6846]"/>{entry.streak} ngày</span><span className="hidden items-center gap-1.5 text-xs md:flex"><Award size={14} className="text-[#a77a1e]"/>{entry.badges}</span>
        </div>)}
      </Card>
    </QueryState>
  </div>;
}

function Gamification() {
  const badgesQuery = useListLmsBadges({ query: { queryKey: getListLmsBadgesQueryKey() } });
  const leaderboardQuery = useGetLmsLeaderboard({ query: { queryKey: getGetLmsLeaderboardQueryKey() } });
  const badgeIcons: Record<string, typeof Award> = {
    award: Award, flame: Flame, trophy: Trophy, book: BookOpen, zap: Zap,
    streak: Flame, completion: Check, learner: GraduationCap, default: ShieldCheck,
  };
  const error = badgesQuery.error || leaderboardQuery.error;
  const loading = badgesQuery.isLoading || leaderboardQuery.isLoading;
  const retry = () => { badgesQuery.refetch(); leaderboardQuery.refetch(); };
  return <div className="page-enter">
    <Heading eyebrow="Ghi nhận nỗ lực" title="Thành tích & huy hiệu" description="Tiến bộ được nhìn thấy rõ hơn khi từng bước nhỏ đều được ghi nhận." action={<span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-[11px] font-semibold text-secondary-foreground"><Trophy size={14} className="text-[#a77a1e]"/>Thành tích đội ngũ</span>}/>
    <QueryState loading={loading} error={error} refetch={retry}>
      <section className="mb-7">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Bộ sưu tập</p><h2 className="mt-1 font-display text-xl font-bold">Huy hiệu đã trao</h2></div><span className="font-mono-ui text-xs text-muted-foreground">{badgesQuery.data?.length ?? 0} huy hiệu</span></div>
        {badgesQuery.data?.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{badgesQuery.data.map(badge => {
          const Icon = badgeIcons[badge.icon.toLowerCase()] ?? badgeIcons.default;
          return <Card key={badge.id} data-testid={`card-badge-${badge.id}`} className="border-card-border shadow-sm"><CardContent className="flex gap-4 p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f3e8c9] text-[#9b7627]"><Icon size={21}/></div>
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-display text-base font-bold">{badge.name}</h3><span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">Đã trao</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{badge.description}</p><div className="mt-3 flex items-center justify-between border-t border-border pt-3"><span className="text-[10px] font-medium">{badge.learner}</span><span className="text-[10px] text-muted-foreground">{badge.awardedAt}</span></div></div>
          </CardContent></Card>;
        })}</div> : <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center" data-testid="state-badges-empty"><div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary"><Award size={20}/></div><p className="font-display font-bold">Huy hiệu đầu tiên đang chờ</p><p className="mt-1 text-xs text-muted-foreground">Học viên sẽ tự động nhận huy hiệu khi đạt các cột mốc học tập.</p></div>}
      </section>
      <section>
        <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Bảng xếp hạng</p><h2 className="mt-1 font-display text-xl font-bold">Người học nổi bật</h2></div>
        {leaderboardQuery.data?.length ? <Card className="overflow-hidden border-card-border shadow-sm"><div className="grid grid-cols-[60px_1.5fr_1fr_100px_90px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground max-md:hidden"><span>Hạng</span><span>Học viên</span><span>Nhóm</span><span>Chuỗi ngày</span><span>Huy hiệu</span></div>
          {leaderboardQuery.data.map((entry, index) => <div key={entry.id} data-testid={`gamification-rank-${entry.id}`} className="grid grid-cols-[40px_1fr_auto] gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[60px_1.5fr_1fr_100px_90px] md:items-center md:gap-4 md:px-5">
            <span className={`font-mono-ui text-sm font-bold ${index === 0 ? 'text-[#a77a1e]' : 'text-muted-foreground'}`}>{String(entry.rank).padStart(2,'0')}</span><div className="flex items-center gap-3"><Avatar name={entry.name}/><div><p className="text-xs font-bold">{entry.name}</p><p className="text-[10px] text-muted-foreground md:hidden">{entry.team}</p><p className="mt-0.5 font-mono-ui text-[10px] text-primary">{entry.points.toLocaleString('vi-VN')} điểm</p></div></div><span className="hidden text-xs text-muted-foreground md:block">{entry.team}</span><span className="flex items-center justify-end gap-1.5 text-xs"><Flame size={14} className="text-[#bd6846]"/>{entry.streak} ngày</span><span className="hidden items-center gap-1.5 text-xs md:flex"><Award size={14} className="text-[#a77a1e]"/>{entry.badges}</span>
          </div>)}
        </Card> : <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">Bảng xếp hạng sẽ hiện khi có hoạt động học tập.</div>}
      </section>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#dce9df] p-5 text-[#27453a] dark:bg-[#203b33] dark:text-[#d7e9dc]"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/60 dark:bg-white/10"><Zap size={17}/></div><div><p className="font-display text-sm font-bold">Học viên nhận thành tích tự động.</p><p className="mt-1 text-xs leading-relaxed opacity-75">Khi một bài học được hoàn tất, hệ thống ghi nhận điểm và cập nhật các huy hiệu đạt được. Bộ sưu tập này luôn lấy dữ liệu mới nhất từ hệ thống.</p><Link href="/learn" className="mt-3 inline-flex items-center gap-1 text-xs font-bold" data-testid="link-gamification-learn">Mở không gian học <ArrowUpRight size={14}/></Link></div></div>
    </QueryState>
  </div>;
}

function Plugins() {
  const q = useListLmsPlugins({ query: { queryKey: getListLmsPluginsQueryKey() } });
  const icons: Record<string, typeof Code2> = { scorm: Layers3, xapi: Activity, h5p: ListChecks, video: Video, default: Code2 };
  return <div className="page-enter"><Heading eyebrow="Hệ sinh thái học tập" title="Tích hợp & tiêu chuẩn" description="Quản lý các định dạng nội dung và tiêu chuẩn giúp dữ liệu học tập kết nối nhất quán." action={<span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px]"><span className="h-2 w-2 rounded-full bg-primary"/>{q.data?.filter(p => p.status === 'Đang bật').length ?? '—'} đang bật</span>}/>
    <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
      <div className="grid gap-4 md:grid-cols-2">{(q.data ?? []).map(plugin => {
        const Icon = icons[plugin.icon.toLowerCase()] ?? icons.default;
        const enabled = plugin.status === 'Đang bật';
        return <Card key={plugin.id} data-testid={`card-plugin-${plugin.id}`} className="border-card-border shadow-sm"><CardContent className="flex gap-4 p-5 md:p-6">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${enabled ? 'bg-[#dce9df] text-[#365642]' : 'bg-secondary text-muted-foreground'}`}><Icon size={22}/></div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-lg font-bold">{plugin.name}</h2><Badge variant={enabled ? 'default' : 'outline'} className="text-[10px]">{plugin.status}</Badge></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{plugin.description}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">{plugin.standard}</span><span className="text-[10px] font-semibold text-primary">{enabled ? 'Đã kết nối' : plugin.status}</span></div></div>
        </CardContent></Card>;
      })}</div>
    </QueryState>
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f3e8c9] text-[#9b7627]"><ShieldCheck size={17}/></div><div><p className="text-sm font-bold">Tiêu chuẩn mở, dữ liệu rõ ràng</p><p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">SCORM, xAPI và H5P giúp nội dung học tập hoạt động nhất quán. Trạng thái tích hợp hiện được quản lý qua cấu hình hệ thống.</p></div></div>
  </div>;
}

function LearningPortal() {
  const qc = useQueryClient();
  const learnersQuery = useListLmsLearners({ query: { queryKey: getListLmsLearnersQueryKey() } });
  const coursesQuery = useListLmsCourses({ query: { queryKey: getListLmsCoursesQueryKey() } });
  const complete = useCompleteLmsLesson();
  const record = useRecordXapiEvent();
  const [learnerId, setLearnerId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessonNumber, setLessonNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [failure, setFailure] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const learners = learnersQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const selectedCourse = courses.find(course => String(course.id) === courseId);
  const lessonCount = selectedCourse?.lessons ?? 1;
  const lessonTitles = ['Bắt đầu từ khách hàng', 'Đặt câu hỏi mở', 'Nhận diện nhu cầu', 'Đề xuất giải pháp', 'Xác nhận kết quả', 'Ôn tập và kiểm tra'];
  const activeLessonTitle = lessonTitles[(lessonNumber - 1) % lessonTitles.length] ?? `Bài học ${lessonNumber}`;
  useEffect(() => {
    if (!learners.length || !courses.length) return;
    if (!learnerId) {
      const firstLearner = learners[0]!;
      const preferred = courses.find(item => item.title === firstLearner.activeCourse);
      setLearnerId(String(firstLearner.id));
      if (!courseId) setCourseId(String(preferred?.id ?? courses[0]!.id));
      return;
    }
    if (!courseId) {
      const activeCourse = learners.find(item => String(item.id) === learnerId)?.activeCourse;
      const match = courses.find(item => item.title === activeCourse);
      setCourseId(String(match?.id ?? courses[0]!.id));
    }
  }, [courseId, courses, learnerId, learners]);
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setPlaybackSeconds(value => Math.min(402, value + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);
  useEffect(() => { if (playbackSeconds >= 402) setIsPlaying(false); }, [playbackSeconds]);
  const submit = () => {
    if (!learnerId || !courseId || selectedAnswer === null) return;
    const score = selectedAnswer === 1 ? 100 : 40;
    setFeedback(''); setFailure(false);
    record.mutate({ data: { learnerId: Number(learnerId), verb: score >= 70 ? 'http://adlnet.gov/expapi/verbs/completed' : 'http://adlnet.gov/expapi/verbs/answered', objectId: `course:${courseId}/lesson:${lessonNumber}`, score, raw: { lessonTitle: activeLessonTitle, response: selectedAnswer === 1 ? 'listen-first' : 'solution-first', source: 'nếp-học-demo' } } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetLmsDashboardQueryKey() });
        if (score < 70) {
          setFailure(false);
          setFeedback('Chưa đạt 70 điểm. Lần thử đã được ghi nhận bằng xAPI — hãy chọn lại đáp án và thử lần nữa.');
          return;
        }
        complete.mutate({ data: { learnerId: Number(learnerId), courseId: Number(courseId), lessonId: `lesson-${lessonNumber}`, score } }, {
          onSuccess: result => {
            setCompleted(true);
            setFeedback(`Hoàn thành bài học. +${result.pointsAwarded} điểm${result.certificateIssued ? ' · Chứng chỉ đã được cấp.' : ''}`);
            qc.invalidateQueries({ queryKey: getListLmsLearnersQueryKey() });
            qc.invalidateQueries({ queryKey: getListLmsCoursesQueryKey() });
            qc.invalidateQueries({ queryKey: getGetLmsDashboardQueryKey() });
            qc.invalidateQueries({ queryKey: getListLmsCertificatesQueryKey() });
            qc.invalidateQueries({ queryKey: getGetLmsLeaderboardQueryKey() });
            qc.invalidateQueries({ queryKey: getListLmsBadgesQueryKey() });
          },
          onError: () => { setFailure(true); setFeedback('Sự kiện xAPI đã ghi nhận, nhưng chưa thể hoàn tất bài học. Thử lại nhé.'); },
        });
      },
      onError: () => { setFailure(true); setFeedback('Không thể ghi nhận sự kiện học tập. Vui lòng thử lại.'); },
    });
  };
  const reset = () => { setCompleted(false); setSelectedAnswer(null); setFeedback(''); setPlaybackSeconds(0); setIsPlaying(false); };
  const isPending = complete.isPending || record.isPending;
  return <div className="page-enter">
    <Heading eyebrow="Nếp học · Learner space" title="Dành cho hành trình của bạn." description="Học theo nhịp riêng, ghi nhận từng bước tiến."/>
    {(learnersQuery.error || coursesQuery.error) && <QueryState loading={learnersQuery.isLoading || coursesQuery.isLoading} error={learnersQuery.error || coursesQuery.error} refetch={() => { learnersQuery.refetch(); coursesQuery.refetch(); }} children={null}/>}
    {!learnersQuery.isLoading && !coursesQuery.isLoading && (!learners.length || !courses.length) ? <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><GraduationCap className="mx-auto mb-3 text-primary" size={26}/><h2 className="font-display text-xl font-bold">Không gian học đang chờ bạn</h2><p className="mt-2 text-sm text-muted-foreground">Cần có ít nhất một học viên và một khóa học để bắt đầu trải nghiệm.</p><Link href="/courses" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Đến thư viện khóa học <ArrowUpRight size={15}/></Link></div> :
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.75fr)]">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3"><Field label="Hồ sơ học viên"><select value={learnerId} onChange={e => { setLearnerId(e.target.value); const learner = learners.find(item => String(item.id) === e.target.value); const preferredCourse = courses.find(item => item.title === learner?.activeCourse); if (preferredCourse) setCourseId(String(preferredCourse.id)); setLessonNumber(1); reset(); }} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" data-testid="select-learning-learner">{learners.map(l => <option key={l.id} value={l.id}>{l.name} · {l.team}</option>)}</select></Field><Field label="Khóa học"><select value={courseId} onChange={e => { setCourseId(e.target.value); setLessonNumber(1); reset(); }} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" data-testid="select-learning-course">{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field><Field label={`Bài học · ${lessonCount} bài`}><select value={lessonNumber} onChange={e => { setLessonNumber(Number(e.target.value)); reset(); }} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" data-testid="select-learning-lesson">{Array.from({ length: lessonCount }, (_, index) => <option key={index + 1} value={index + 1}>{String(index + 1).padStart(2, '0')} · {lessonTitles[index % lessonTitles.length] ?? `Bài học ${index + 1}`}</option>)}</select></Field></div>
        <Card className="overflow-hidden border-card-border shadow-sm"><div className="relative aspect-video overflow-hidden bg-[#243c3a]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_15%,rgba(225,177,132,.72),transparent_24%),radial-gradient(ellipse_at_28%_80%,rgba(83,133,111,.85),transparent_45%),linear-gradient(125deg,#243c3a,#55766b_58%,#d29b72)]"/>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, transparent 35%, rgba(255,255,255,.4) 35.3%, transparent 35.6%),linear-gradient(45deg,transparent 60%,rgba(255,255,255,.25) 60.3%,transparent 60.6%)' }}/>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"><span className="mb-4 rounded-full border border-white/40 bg-black/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em]">BÀI HỌC {String(lessonNumber).padStart(2, '0')} / {String(lessonCount).padStart(2, '0')} · H5P</span><button type="button" onClick={() => { if (playbackSeconds >= 402) setPlaybackSeconds(0); setIsPlaying(value => !value); }} aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'} data-testid="button-video-toggle" className={`grid h-14 w-14 place-items-center rounded-full border border-white/55 bg-white/20 backdrop-blur-sm transition hover:scale-105 ${isPlaying ? 'animate-pulse' : ''}`}>{isPlaying ? <span className="h-4 w-4 rounded-sm bg-white"/> : <Play size={20} fill="currentColor"/>}</button><p className="mt-4 text-xs font-medium text-white/80">{isPlaying ? `Đang phát · ${activeLessonTitle}` : activeLessonTitle}</p></div>
           <input type="range" min="0" max="402" value={playbackSeconds} onChange={e => setPlaybackSeconds(Number(e.target.value))} aria-label="Tua video bài học" data-testid="input-video-seek" className="absolute bottom-6 left-4 right-4 z-10 h-1 w-[calc(100%-2rem)] cursor-pointer accent-[#e8b487]"/>
           <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[10px] text-white/85"><span>{`${String(Math.floor(playbackSeconds / 60)).padStart(2, '0')}:${String(playbackSeconds % 60).padStart(2, '0')} / 06:42`}</span><span className="h-3 w-px bg-white/35"/><span>Phụ đề tiếng Việt</span></div><span className="absolute bottom-3 right-4 text-[10px] text-white/80">1.0×</span>
         </div><CardContent className="p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Bài học tương tác · Phần {lessonNumber}</p><h2 className="mt-1 font-display text-xl font-bold">{activeLessonTitle}</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce9df] px-3 py-1.5 text-[10px] font-semibold text-[#365642] dark:bg-[#28483c] dark:text-[#c4e0cb]"><Clock3 size={12}/> 7 phút</span></div><p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">Trước khi đưa ra giải pháp, hãy dành một nhịp để hiểu khách hàng thực sự cần gì. Mỗi bài học kết hợp video, câu hỏi tương tác và ghi nhận tiến độ theo chuẩn xAPI.</p>
        </CardContent></Card>
         <Card className="border-card-border shadow-sm"><CardContent className="p-5 md:p-6"><div className="mb-4 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Kiểm tra nhanh · Quiz game</p><h3 className="mt-1 font-display text-lg font-bold">Khách hàng đang bối rối. Bạn sẽ làm gì trước?</h3></div><span className="font-mono-ui text-[10px] text-muted-foreground">{String(lessonNumber).padStart(2, '0')} / {String(lessonCount).padStart(2, '0')}</span></div>
          <div className="space-y-2">{['Đưa ra ngay giải pháp bạn cho là phù hợp nhất.', 'Đặt câu hỏi mở và lắng nghe điều họ đang cần.', 'Chuyển cuộc trò chuyện sang một đồng nghiệp khác.'].map((answer, i) => <button key={answer} onClick={() => { setSelectedAnswer(i); setFeedback(''); }} disabled={completed} data-testid={`button-quiz-answer-${i}`} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition-colors ${selectedAnswer === i ? 'border-primary bg-primary/5 text-foreground' : 'border-border hover:bg-muted/60'} ${completed ? 'cursor-default' : ''}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${selectedAnswer === i ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>{String.fromCharCode(65+i)}</span>{answer}{completed && i === 1 && <Check size={15} className="ml-auto text-primary"/>}</button>)}</div>
          {feedback && <div className="mt-4"><Notice message={feedback} error={failure}/></div>}
           <div className="mt-5 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center"><p className="text-[10px] text-muted-foreground">Đạt từ 70 điểm để ghi nhận tiến độ. Mỗi lần thử được lưu theo chuẩn xAPI.</p>{completed ? <Button variant="outline" onClick={reset} data-testid="button-lesson-reset">Học lại bài này</Button> : <Button onClick={submit} disabled={selectedAnswer === null || isPending} data-testid="button-complete-lesson">{isPending ? 'Đang ghi nhận...' : 'Nộp câu trả lời'} <ChevronRight size={15} className="ml-1"/></Button>}</div>
        </CardContent></Card>
      </div>
      <aside className="space-y-5">
        <Card className="border-card-border shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Hành trình của bạn</p><h3 className="mt-1 font-display text-lg font-bold">{learners.find(l => String(l.id) === learnerId)?.name ?? 'Người học'}</h3></div><Avatar name={learners.find(l => String(l.id) === learnerId)?.name ?? 'Người học'} size="md"/></div>
          <div className="mt-5 flex items-end justify-between"><span className="text-xs text-muted-foreground">Tiến độ khóa học</span><span className="font-mono-ui text-xl font-medium">{learners.find(l => String(l.id) === learnerId)?.progress ?? 0}<span className="text-xs">%</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${learners.find(l => String(l.id) === learnerId)?.progress ?? 0}%` }}/></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-muted/65 p-3"><div className="flex items-center gap-1.5 text-[#b76843]"><Flame size={14}/><span className="font-mono-ui text-sm">{learners.find(l => String(l.id) === learnerId)?.streak ?? 0}</span></div><p className="mt-1 text-[10px] text-muted-foreground">ngày liên tiếp</p></div><div className="rounded-xl bg-muted/65 p-3"><div className="flex items-center gap-1.5 text-primary"><Zap size={14}/><span className="font-mono-ui text-sm">{learners.find(l => String(l.id) === learnerId)?.points ?? 0}</span></div><p className="mt-1 text-[10px] text-muted-foreground">điểm tích lũy</p></div></div>
        </CardContent></Card>
        <Card className="border-card-border shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><h3 className="font-display font-bold">Nội dung khóa học</h3><span className="text-[10px] text-muted-foreground">{courses.find(c => String(c.id) === courseId)?.lessons ?? 6} bài</span></div>
          <div className="mt-4 space-y-1">{['Chào mừng & mục tiêu', 'Bắt đầu từ khách hàng', 'Lắng nghe chủ động', 'Tìm đúng vấn đề', 'Gợi ý giải pháp', 'Tổng kết & thực hành'].map((lesson, i) => <div key={lesson} className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 ${i === 1 ? 'bg-primary/8 text-primary' : ''}`}><span className={`grid h-6 w-6 place-items-center rounded-full ${i === 0 ? 'bg-[#dce9df] text-[#365642] dark:bg-[#28483c] dark:text-[#c4e0cb]' : i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i === 0 ? <Check size={12}/> : i === 1 ? <Play size={11} fill="currentColor"/> : <span className="text-[9px]">{String(i+1).padStart(2,'0')}</span>}</span><span className={`flex-1 text-[11px] ${i === 1 ? 'font-bold' : 'text-muted-foreground'}`}>{lesson}</span>{i !== 1 && <span className="text-[9px] text-muted-foreground">{i === 0 ? 'Hoàn thành' : `${5+i} phút`}</span>}</div>)}</div>
        </CardContent></Card>
        <div className="rounded-2xl bg-[#f0e5d9] p-5 text-[#574231] dark:bg-[#3b3027] dark:text-[#ead9c8]"><div className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/60 dark:bg-white/10"><Award size={17}/></div><div><p className="font-display text-sm font-bold">Mỗi bước đều đáng ghi nhận.</p><p className="mt-1 text-[11px] leading-relaxed opacity-75">Hoàn thành bài học để ghi nhận tiến độ và điểm thưởng của bạn.</p></div></div></div>
      </aside>
    </div>}
  </div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppShell><Switch>
    <Route path="/" component={Dashboard}/>
    <Route path="/courses" component={Courses}/>
    <Route path="/learners" component={Learners}/>
    <Route path="/paths" component={Paths}/>
    <Route path="/certificates" component={Certificates}/>
    <Route path="/leaderboard" component={Leaderboard}/>
    <Route path="/gamification" component={Gamification}/>
    <Route path="/plugins" component={Plugins}/>
    <Route path="/learn" component={LearningPortal}/>
    <Route component={NotFound}/>
  </Switch></AppShell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default App;
