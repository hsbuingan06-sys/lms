import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  BookOpen,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Info,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Notice, Field } from '@/components/common';
import { useRole, type UserRole } from '@/contexts/RoleContext';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [team, setTeam] = useState('Lớp 10A');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Cập nhật gợi ý phòng ban / lớp khi đổi vai trò
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'student') setTeam('Lớp 10A');
    else if (newRole === 'lecturer') setTeam('Tổ Sư Phạm & Đào Tạo');
    else if (newRole === 'admin') setTeam('Ban Giám Hiệu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    const res = await signup({
      name,
      email,
      password,
      role,
      team,
    });
    setLoading(false);

    if (res.success) {
      setLocation(role === 'student' ? '/learn' : '/');
    } else {
      setErrorMsg(res.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/20 px-4 py-8">
      <div className="w-full max-w-[500px] space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap size={30} />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">nếp học</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            Hệ sinh thái LMS Giáo dục
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-card-border shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold">Đăng ký tài khoản</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tạo tài khoản để bắt đầu trải nghiệm hệ thống quản trị học tập số.
              </p>
            </div>

            {/* Chú thích thân thiện dành cho người làm giáo dục */}
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs leading-relaxed text-blue-900 dark:text-blue-200">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <span>
                <b>Chế độ thử nghiệm:</b> Bạn có thể tự do đăng ký với tư cách <b>Học viên</b>, <b>Giảng viên</b> hoặc <b>Quản trị viên</b> để trực tiếp trải nghiệm góc nhìn của từng vị trí trong nhà trường.
              </span>
            </div>

            {errorMsg && <Notice message={errorMsg} error onClose={() => setErrorMsg('')} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Họ và tên" required>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    minLength={2}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Địa chỉ Email" required>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="minh.anh@nova.vn"
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Mật khẩu (tối thiểu 6 ký tự)" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Lựa chọn vai trò */}
              <div>
                <label className="block text-xs font-semibold mb-2">Chọn vai trò tài khoản <i className="text-destructive">*</i></label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                      role === 'student'
                        ? 'border-emerald-600 bg-emerald-500/10 font-bold text-emerald-800 dark:text-emerald-200 shadow-2xs'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <GraduationCap size={18} className="mb-1 text-emerald-600" />
                    <span className="text-xs">Học viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('lecturer')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                      role === 'lecturer'
                        ? 'border-blue-600 bg-blue-500/10 font-bold text-blue-800 dark:text-blue-200 shadow-2xs'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <BookOpen size={18} className="mb-1 text-blue-600" />
                    <span className="text-xs">Giảng viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                      role === 'admin'
                        ? 'border-amber-600 bg-amber-500/10 font-bold text-amber-800 dark:text-amber-200 shadow-2xs'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ShieldCheck size={18} className="mb-1 text-amber-600" />
                    <span className="text-xs">Quản trị</span>
                  </button>
                </div>
              </div>

              <Field label="Lớp học / Phòng ban công tác">
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={team}
                    onChange={e => setTeam(e.target.value)}
                    placeholder="Ví dụ: Lớp 10A, Tổ Sư Phạm..."
                    className="pl-9"
                  />
                </div>
              </Field>

              <Button type="submit" disabled={loading} className="w-full font-semibold">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký & Bắt đầu'}
              </Button>
            </form>

            {/* Link chuyển sang Đăng nhập */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
