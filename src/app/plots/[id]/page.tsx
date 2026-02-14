'use client';

import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import PlotDetailView from '@/components/plot-detail-view';

export default function PlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // 将来的に編集ページに遷移
    router.push(`/plots/${plotId}/edit`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-shiro">
        <div className="max-w-7xl mx-auto p-4">
          <PlotDetailView
            plotId={plotId}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
