'use client';

import { useParams, useRouter } from 'next/navigation';
import { DocumentManagement } from '@/components/document-management';

export default function PlotDocumentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  return (
    <DocumentManagement
      customerId={plotId}
      initialMode="list"
      onBack={() => router.push(`/plots/${plotId}`)}
    />
  );
}
