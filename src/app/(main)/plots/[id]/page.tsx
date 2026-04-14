'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deletePlot } from '@/lib/api/plots';
import { showError, showApiSuccess, showApiError } from '@/lib/toast';
import PlotDetailView from '@/components/plot-detail-view';
import { DeleteConfirmDialog } from '@/components/plot-detail-sidebar';

export default function PlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  const [deleteTarget, setDeleteTarget] = useState<{ code: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await deletePlot(plotId);
      if (response.success) {
        setDeleteTarget(null);
        showApiSuccess('削除', '区画データ');
        router.push('/plots');
      } else {
        showApiError('データ削除', response.error?.message, response.error?.details);
      }
    } catch {
      showError('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      <PlotDetailView
        plotId={plotId}
        onBack={() => router.push('/plots')}
        onEdit={() => router.push(`/plots/${plotId}/edit`)}
        onDelete={(code, name) => setDeleteTarget({ code, name })}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        targetName={deleteTarget?.name || ''}
        targetCode={deleteTarget?.code || ''}
        isLoading={isDeleting}
        onDelete={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
