import { useMemo, useState } from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { getListLmsCertificatesQueryKey, useListLmsCertificates } from '@/api';
import type { Certificate } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading, QueryState } from '@/components/common';
import { CertificateModal } from '@/components/dialogs';
import { useRole } from '@/contexts/RoleContext';

export default function Certificates() {
  const { role, user } = useRole();
  const q = useListLmsCertificates({ query: { queryKey: getListLmsCertificatesQueryKey() } });
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Nếu là học viên -> chỉ lọc ra chứng chỉ của chính mình hoặc Ngann
  const certs = useMemo(() => {
    if (role === 'student') {
      return (q.data ?? []).filter(c => c.learner.toLowerCase() === user.name.toLowerCase() || c.learner === 'Ngann');
    }
    return q.data ?? [];
  }, [q.data, role, user.name]);

  return (
    <div className="page-enter">
      <Heading
        eyebrow="Ghi nhận thành tựu"
        title={role === 'student' ? 'Chứng chỉ của tôi' : 'Sổ cấp Chứng chỉ số'}
        description={
          role === 'student'
            ? 'Ghi nhận những nỗ lực học tập và bài thi hoàn tất của bạn.'
            : 'Danh sách chứng chỉ điện tử tự động cấp cho học viên kèm mã số tra cứu.'
        }
        action={
          <div className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck size={14} className="mr-1.5 inline text-primary" />
            Cấp tự động 100%
          </div>
        }
      />
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()} empty={certs.length === 0}>
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xs">
          <div className="hidden grid-cols-[1.3fr_1.3fr_1fr_100px_90px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Học viên nhận bằng</span>
            <span>Khóa học hoàn tất</span>
            <span>Mã định danh (Serial)</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>
          {certs.map(c => (
            <div
              key={c.id}
              className="grid gap-2 border-b border-border px-5 py-3.5 last:border-0 md:grid-cols-[1.3fr_1.3fr_1fr_100px_90px] md:items-center md:gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f3e8c9] text-[#9b7627]">
                  <Award size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold">{c.learner}</p>
                  <p className="text-[10px] text-muted-foreground">{c.issuedAt}</p>
                </div>
              </div>
              <div className="text-xs font-medium">{c.course}</div>
              <code className="font-mono text-[10px] text-muted-foreground">{c.serial}</code>
              <Badge variant="default" className="w-fit text-[10px]">
                {c.status}
              </Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedCert(c)}>
                Xem bằng
              </Button>
            </div>
          ))}
        </div>
      </QueryState>

      {/* Modal Giấy chứng nhận điện tử */}
      <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
