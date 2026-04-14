'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePlotDetail } from '@/hooks/usePlots';
import { DocumentManagement } from '@/components/document-management';

export default function PlotDocumentCreatePage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  // plotDetail は書類テンプレートへの自動挿入に使用
  // usePlotDetail は in-memory キャッシュ (2分TTL) を持つため、
  // 区画詳細ページから遷移した場合はキャッシュヒットで再フェッチしない
  const { plot } = usePlotDetail(plotId);

  return (
    <DocumentManagement
      customerId={plotId}
      customerName={plot?.roles?.[0]?.customer?.name}
      plotDetail={plot || undefined}
      initialMode="templates"
      onBack={() => router.push(`/plots/${plotId}`)}
    />
  );
}
