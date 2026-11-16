import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { getListLmsPluginsQueryKey, useListLmsPlugins } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, QueryState } from '@/components/common';
import { useRole } from '@/contexts/RoleContext';

export default function Plugins() {
  const { role } = useRole();
  const q = useListLmsPlugins({ query: { queryKey: getListLmsPluginsQueryKey() } });

  if (role !== 'admin') {
    return (
      <div className="page-enter py-12 text-center">
        <ShieldCheck className="mx-auto mb-3 text-muted-foreground" size={32} />
        <h2 className="font-display text-xl font-bold">Khu vực cấu hình Quản trị viên</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Trang này dành riêng cho Ban Giám Hiệu và chuyên viên kỹ thuật để cấu hình SCORM, H5P và xAPI.
        </p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          Về trang chính <ArrowUpRight size={13} />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Heading
        eyebrow="Hệ sinh thái kỹ thuật"
        title="Tích hợp chuẩn e-Learning mở"
        description="Quản lý và kích hoạt các chuẩn giáo dục quốc tế (H5P, SCORM 1.2, xAPI) trên hệ thống Nếp học."
      />
      <QueryState loading={q.isLoading} error={q.error} refetch={() => q.refetch()}>
        <div className="grid gap-4 md:grid-cols-3">
          {(q.data ?? []).map(plugin => (
            <Card key={plugin.id} className="border-card-border shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-[10px]">
                    {plugin.standard}
                  </Badge>
                  <span className="text-[10px] font-semibold text-emerald-600">Đang bật</span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold">{plugin.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{plugin.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
