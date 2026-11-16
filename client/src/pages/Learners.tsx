import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users } from 'lucide-react';
import {
  getListLmsCoursesQueryKey,
  getListLmsLearnersQueryKey,
  useListLmsCourses,
  useListLmsLearners,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heading, Notice, QueryState, Avatar } from '@/components/common';
import { EnrollDialog } from '@/components/dialogs';
import { useRole } from '@/contexts/RoleContext';

export default function Learners() {
  const { role } = useRole();
  const q = useListLmsLearners({ query: { queryKey: getListLmsLearnersQueryKey() } });
  const c = useListLmsCourses({ query: { queryKey: getListLmsCoursesQueryKey() } });
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [roleMsg, setRoleMsg] = useState('');

  const learners = (q.data ?? []).filter(l =>
    `${l.name} ${l.email} ${l.team}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/lms/learners/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: getListLmsLearnersQueryKey() });
        setRoleMsg('Đã cập nhật phân quyền người dùng thành công.');
        setTimeout(() => setRoleMsg(''), 3000);
      }
    } catch {
      setRoleMsg('Chưa thể đổi vai trò. Vui lòng thử lại.');
    }
  };

  const eyebrow = role === 'student' ? 'Lớp 10A' : role === 'lecturer' ? 'Tổ Sư Phạm · Theo dõi lớp' : 'Ban Giám Hiệu · Phân quyền';
  const title = role === 'student' ? 'Bạn học cùng lớp' : role === 'lecturer' ? 'Sổ theo dõi học sinh' : 'Người dùng & Phân quyền';
  const description =
    role === 'student'
      ? 'Những người bạn cùng lớp đang đồng hành cùng bạn trên hành trình học tập.'
      : role === 'lecturer'
      ? 'Theo dõi mức độ chuyên cần, bài tập và tiến độ của từng học sinh do Cô Bui Ngan phụ trách.'
      : 'Danh sách thành viên toàn trường. Quản trị viên có quyền cấp quyền Giảng viên hoặc Quản trị viên.';

  return (
    <div className="page-enter">
      <Heading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          role !== 'student' && (
            <Button onClick={() => setEnrollOpen(true)} disabled={!q.data?.length || !c.data?.length}>
              <Plus size={16} className="mr-2" />
              Ghi danh học viên vào lớp
            </Button>
          )
        }
      />
      {roleMsg && <Notice message={roleMsg} onClose={() => setRoleMsg('')} />}
      <Card className="mb-5 border-card-border shadow-2xs">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
              <Users size={18} />
            </div>
            <div>
              <p className="font-display text-base font-bold">{learners.length} thành viên</p>
              <p className="text-[11px] text-muted-foreground">
                {role === 'admin' ? 'Học viên, Giảng viên và Quản lý' : 'Đang học tập tích cực'}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:max-w-[280px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={!!q.data && !q.data.length}>
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xs">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_130px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Họ và tên</span>
            <span>Phòng ban / Lớp</span>
            <span>Khóa học hiện tại</span>
            <span>Hoạt động gần nhất</span>
            <span>{role === 'admin' ? 'Vai trò / Quyền' : 'Tiến độ'}</span>
          </div>
          {learners.map(l => {
            const userRole =
              (l as any).role ??
              (l.name.includes('Cô') ? (l.name.includes('Ngân Bùi') ? 'admin' : 'lecturer') : 'student');
            return (
              <div
                key={l.id}
                className="grid gap-3 border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted/30 md:grid-cols-[1.4fr_1fr_1fr_1fr_130px] md:items-center md:gap-4 md:px-5"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={l.name} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{l.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{l.email}</p>
                  </div>
                </div>
                <div className="text-xs">{l.team}</div>
                <div className="line-clamp-1 text-xs text-muted-foreground">{l.activeCourse || 'Chưa ghi danh'}</div>
                <div className="text-xs text-muted-foreground">{l.lastActive}</div>
                <div>
                  {role === 'admin' ? (
                    <select
                      value={userRole}
                      onChange={e => handleUpdateRole(l.id, e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-[11px] font-medium"
                    >
                      <option value="student">🎓 Học viên</option>
                      <option value="lecturer">👨‍🏫 Giảng viên</option>
                      <option value="admin">⚙️ Quản trị</option>
                    </select>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Tiến độ</span>
                        <b>{l.progress}%</b>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(l.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </QueryState>
      <EnrollDialog
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        learners={q.data ?? []}
        courses={c.data ?? []}
      />
    </div>
  );
}
