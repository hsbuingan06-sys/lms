import { type ReactNode, useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronRight,
  Compass,
  FileBadge2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Play,
  Settings2,
  ShieldCheck,
  Sun,
  Trophy,
  Users,
  X,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useRole, type UserRole } from '@/contexts/RoleContext';

// Cấu hình menu riêng biệt cho từng vai trò
export const roleNavItems: Record<UserRole, Array<{ label: string; href: string; icon: typeof Users; group: string }>> = {
  student: [
    { label: 'Bàn học cá nhân', href: '/learn', icon: Play, group: 'study' },
    { label: 'Khóa học của tôi', href: '/courses', icon: BookOpen, group: 'study' },
    { label: 'Lộ trình học tập', href: '/paths', icon: Compass, group: 'study' },
    { label: 'Chứng chỉ của tôi', href: '/certificates', icon: FileBadge2, group: 'achieve' },
    { label: 'Bảng vinh danh', href: '/leaderboard', icon: Trophy, group: 'achieve' },
    { label: 'Huy hiệu thành tích', href: '/gamification', icon: Award, group: 'achieve' },
  ],
  lecturer: [
    { label: 'Lớp học phụ trách', href: '/courses', icon: BookOpen, group: 'teaching' },
    { label: 'Sổ theo dõi học sinh', href: '/learners', icon: Users, group: 'teaching' },
    { label: 'Lộ trình bài giảng', href: '/paths', icon: Compass, group: 'teaching' },
    { label: 'Xem trước bài giảng', href: '/learn', icon: Play, group: 'review' },
    { label: 'Chứng chỉ lớp học', href: '/certificates', icon: FileBadge2, group: 'review' },
    { label: 'Thi đua của lớp', href: '/leaderboard', icon: Trophy, group: 'review' },
  ],
  admin: [
    { label: 'Phòng điều hành', href: '/', icon: LayoutDashboard, group: 'overview' },
    { label: 'Quản lý Khóa học', href: '/courses', icon: BookOpen, group: 'curriculum' },
    { label: 'Khung Lộ trình', href: '/paths', icon: Compass, group: 'curriculum' },
    { label: 'Người dùng & Phân quyền', href: '/learners', icon: Users, group: 'users' },
    { label: 'Sổ cấp Chứng chỉ', href: '/certificates', icon: FileBadge2, group: 'users' },
    { label: 'Bảng xếp hạng chung', href: '/leaderboard', icon: Trophy, group: 'insights' },
    { label: 'Thành tích & Huy hiệu', href: '/gamification', icon: Award, group: 'insights' },
    { label: 'Tích hợp e-Learning', href: '/plugins', icon: Settings2, group: 'system' },
    { label: 'Xem góc học sinh', href: '/learn', icon: Play, group: 'system' },
  ],
};

const groupLabels: Record<string, string> = {
  study: 'Góc học tập',
  achieve: 'Kết quả & Động lực',
  teaching: 'Nghiệp vụ giảng dạy',
  review: 'Kiểm tra & Ghi nhận',
  overview: 'Điều hành',
  curriculum: 'Chương trình học',
  users: 'Quản lý nhân sự',
  insights: 'Thống kê & Động lực',
  system: 'Hệ sinh thái',
};

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('lms-theme') === 'dark');
  const { role, user, switchRole, logout, isAuthenticated } = useRole();

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lms-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => setMobileOpen(false), [location]);

  const navList = roleNavItems[role];
  const groups = Array.from(new Set(navList.map(i => i.group)));

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Sidebar bên trái */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[265px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="font-display text-[19px] font-extrabold leading-none tracking-tight">nếp học</div>
            <div className="mt-1 text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/55">LMS Giáo dục</div>
          </div>
          <button
            className="ml-auto rounded-lg p-2 text-sidebar-foreground/70 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Huy hiệu vai trò đang hoạt động */}
        <div className="mx-4 mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                role === 'admin' ? 'bg-amber-500' : role === 'lecturer' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/70">
              {role === 'admin' ? 'Khu vực Quản trị' : role === 'lecturer' ? 'Khu vực Giảng viên' : 'Khu vực Học viên'}
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-semibold">{user.name}</p>
          <p className="text-[10px] text-sidebar-foreground/55">{user.team}</p>
        </div>

        {/* Danh sách mục Menu theo vai trò */}
        <div className="overflow-y-auto px-4 pt-4">
          {groups.map((group, index) => (
            <div key={group} className={index ? 'mt-6' : ''}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/45">
                {groupLabels[group] ?? group}
              </p>
              <nav className="space-y-1">
                {navList
                  .filter(item => item.group === group)
                  .map(item => {
                    const active = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-testid={`link-nav-${item.href.replace('/', '') || 'root'}`}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13px] font-medium transition-colors ${
                          active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                            : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                        }`}
                      >
                        <item.icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                        <span>{item.label}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
                      </Link>
                    );
                  })}
              </nav>
            </div>
          ))}
        </div>

        {/* Thẻ chuyển đến Góc học tập (dành cho học viên) hoặc Thông tin profile */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-xs ${
                role === 'admin'
                  ? 'bg-[#f4e4d8] text-[#ad5e3c]'
                  : role === 'lecturer'
                  ? 'bg-[#dce8f2] text-[#315779]'
                  : 'bg-[#dce9df] text-[#2c533c]'
              }`}
            >
              {user.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">{user.title}</p>
            </div>
            <button
              onClick={() => setDark(!dark)}
              aria-label="Đổi giao diện"
              className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              title="Đăng xuất khỏi tài khoản"
              className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Đóng điều hướng"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 md:hidden"
        />
      )}

      {/* Vùng nội dung chính */}
      <div className="min-h-[100dvh] md:pl-[265px]">
        {/* Header trên cùng có Role Switcher */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-muted md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={19} />
            </button>
            <div className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex">
              <span>Nếp học</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-foreground">
                {role === 'student' ? 'Học viên' : role === 'lecturer' ? 'Giảng viên' : 'Quản trị viên'}
              </span>
            </div>
          </div>

          {/* BỘ CHUYỂN ĐỔI VAI TRÒ NHANH (Role Switcher) */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => switchRole('student')}
                data-testid="role-switch-student"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  role === 'student'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Xem giao diện học sinh Ngann"
              >
                <GraduationCap size={13} />
                <span className="hidden sm:inline">Học viên</span>
                <span className="text-[10px] opacity-80">(Ngann)</span>
              </button>

              <button
                type="button"
                onClick={() => switchRole('lecturer')}
                data-testid="role-switch-lecturer"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  role === 'lecturer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Xem giao diện Cô Bui Ngan"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Giảng viên</span>
                <span className="text-[10px] opacity-80">(Cô Bui Ngan)</span>
              </button>

              <button
                type="button"
                onClick={() => switchRole('admin')}
                data-testid="role-switch-admin"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  role === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Xem giao diện Quản trị Cô Ngân Bùi"
              >
                <ShieldCheck size={13} />
                <span className="hidden sm:inline">Quản trị</span>
                <span className="text-[10px] opacity-80">(Cô Ngân Bùi)</span>
              </button>
            </div>

            <button
              onClick={() => setDark(!dark)}
              aria-label="Đổi giao diện"
              className="hidden sm:grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition shadow-2xs"
              >
                <LogOut size={13} />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-2xs"
              >
                <LogIn size={13} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </header>

        {/* Nội dung trang */}
        <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
