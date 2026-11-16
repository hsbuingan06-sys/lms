import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  FileBadge2,
  Flame,
  ListChecks,
  Play,
  Plus,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'wouter';
import { getGetLmsDashboardQueryKey, useGetLmsDashboard } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, QueryState, StatCard } from '@/components/common';
import { useRole } from '@/contexts/RoleContext';

export default function Dashboard() {
  const { role, user } = useRole();
  const q = useGetLmsDashboard({ query: { queryKey: getGetLmsDashboardQueryKey() } });
  const d = q.data;
  const max = Math.max(1, ...(d?.weeklyEngagement ?? []).map(x => x.active));

  // Nếu là học viên vào trang chủ -> Chào mừng học viên Ngann và dẫn vào bàn học
  if (role === 'student') {
    return (
      <div className="page-enter space-y-6">
        <div className="rounded-3xl border border-border bg-linear-to-br from-emerald-500/10 via-card to-background p-6 md:p-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={13} /> Góc học tập của bạn
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">Chào bạn, {user.name}!</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Mỗi ngày một bài học nhỏ là bước tiến lớn trên hành trình phát triển bản thân. Sẵn sàng bắt đầu buổi học hôm nay chưa?
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90"
              >
                <Play size={15} fill="currentColor" /> Vào học ngay
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
              >
                <BookOpen size={15} /> Khóa học của tôi
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-card-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
                <Flame size={22} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chuỗi chuyên cần</p>
                <p className="font-display text-2xl font-bold">12 ngày liên tục</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <Zap size={22} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
                <p className="font-display text-2xl font-bold">1.840 điểm</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-600">
                <FileBadge2 size={22} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chứng chỉ đạt được</p>
                <p className="font-display text-2xl font-bold">1 chứng chỉ</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Nếu là giảng viên -> Bảng điều khiển lớp học của Cô Bui Ngan
  if (role === 'lecturer') {
    return (
      <div className="page-enter">
        <Heading
          eyebrow="Tổ Sư Phạm & Đào Tạo"
          title={`Chào mừng ${user.name}`}
          description="Nơi theo dõi bài giảng, quản lý học sinh theo lớp và chấm điểm rèn luyện."
          action={
            <Link
              href="/courses"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Soạn khóa học mới
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Khóa học phụ trách" value="3 môn" hint="Do Cô Bui Ngan giảng dạy" icon={BookOpen} />
          <StatCard
            label="Học sinh đang học"
            value="3 em"
            hint="Ngann, Bui, L"
            icon={Users}
            tint="bg-[#dce8f2] text-[#315779]"
          />
          <StatCard
            label="Tỷ lệ hoàn thành"
            value="82%"
            hint="Đánh giá mức độ tích cực"
            icon={ListChecks}
            tint="bg-[#e6ecd9] text-[#57733c]"
          />
          <StatCard
            label="Chứng chỉ đã cấp"
            value="3 giấy"
            hint="Được duyệt tự động"
            icon={Award}
            tint="bg-[#f3e8c9] text-[#9b7627]"
          />
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold">Xem sổ theo dõi và điểm số học sinh</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Kiểm tra chi tiết từng học sinh trong các lớp 10A, 10B và ghi danh thêm em mới.
            </p>
          </div>
          <Link
            href="/learners"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-muted px-4 text-xs font-semibold hover:bg-muted/80"
          >
            Mở sổ theo dõi <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Nếu là Quản trị viên -> Bảng điều hành tổng thể toàn trường (Cô Ngân Bùi)
  return (
    <div className="page-enter">
      <Heading
        eyebrow="Ban Giám Hiệu · Phòng Điều Hành"
        title={`Chào ${user.name}`}
        description="Bức tranh toàn cảnh về hoạt động học tập, chất lượng đào tạo và tiến độ toàn trường."
        action={
          <Link
            href="/courses"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Tạo khóa học
          </Link>
        }
      />
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()}>
        {d && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Khóa học đang mở" value={d.activeCourses} hint="Nội dung đã duyệt phát hành" icon={BookOpen} />
              <StatCard
                label="Tổng số thành viên"
                value="5 người"
                hint="Bao gồm BGH, giáo viên & học sinh"
                icon={Users}
                tint="bg-[#f4e4d8] text-[#ad5e3c]"
              />
              <StatCard
                label="Tỷ lệ hoàn thành"
                value={`${d.completionRate}%`}
                hint="Trung bình trên toàn trường"
                icon={ListChecks}
                tint="bg-[#e6ecd9] text-[#57733c]"
              />
              <StatCard
                label="Chứng chỉ chờ cấp"
                value={d.pendingCertificates}
                hint="Đủ điều kiện ghi nhận"
                icon={Award}
                tint="bg-[#f3e8c9] text-[#9b7627]"
              />
            </section>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <Card className="border-card-border shadow-2xs">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
                        Nhịp điệu chuyên cần
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold">Thống kê 7 ngày gần nhất</h2>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary">
                      Thời gian thực
                    </span>
                  </div>
                  <div className="mt-7 flex h-[190px] items-end justify-between gap-2 border-b border-border pb-0">
                    {(d.weeklyEngagement ?? []).map((day, i) => (
                      <div key={`${day.day}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div className="flex h-[155px] w-full items-end justify-center gap-1">
                          <div
                            title={`${day.active} học sinh học`}
                            className="w-[34%] max-w-8 rounded-t-md bg-primary/75"
                            style={{ height: `${Math.max(8, (day.active / max) * 100)}%` }}
                          />
                          <div
                            title={`${day.completed} bài xong`}
                            className="w-[34%] max-w-8 rounded-t-md bg-accent/80"
                            style={{ height: `${Math.max(6, (day.completed / max) * 100)}%` }}
                          />
                        </div>
                        <span className="pb-1 text-[10px] text-muted-foreground">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <i className="h-2 w-2 rounded-xs bg-primary/75" />
                      Học viên tích cực
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="h-2 w-2 rounded-xs bg-accent/80" />
                      Bài hoàn thành
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border shadow-2xs">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
                        Nhật ký sự kiện
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold">Hoạt động mới nhất</h2>
                    </div>
                    <Activity size={17} className="text-primary" />
                  </div>
                  <div className="mt-4 space-y-1">
                    {(d.recentActivity ?? []).map(item => (
                      <div key={item.id} className="flex gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/60">
                        <div
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                            item.kind === 'certificate'
                              ? 'bg-[#f3e8c9] text-[#9b7627]'
                              : item.kind === 'completion'
                              ? 'bg-[#e6ecd9] text-[#57733c]'
                              : 'bg-secondary text-primary'
                          }`}
                        >
                          {item.kind === 'certificate' ? (
                            <Award size={14} />
                          ) : item.kind === 'completion' ? (
                            <Check size={14} />
                          ) : (
                            <Users size={14} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold">{item.title}</p>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p>
                        </div>
                        <span className="shrink-0 pt-0.5 text-[9px] text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
