'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePlotDetail } from '@/hooks/usePlots';
import { DocumentManagement } from '@/components/document-management';

export default function PlotDocumentCreatePage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  const { plot } = usePlotDetail(plotId);

  const plotCode = plot?.physicalPlot?.plotNumber || '';
  const customerName = plot?.roles?.[0]?.customer?.name || plotCode;

  return (
    <DocumentManagement
      customerId={plotId}
      customerName={customerName}
      plotDetail={plot || undefined}
      initialMode="templates"
      onBack={() => router.push(`/plots/${plotId}`)}
    />
  );
}
