'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deletePlot } from '@/lib/api/plots';
import { usePlotDetail } from '@/hooks/usePlots';
import { showError, showApiSuccess, showApiError } from '@/lib/toast';
import PlotDetailView from '@/components/plot-detail-view';
import { DeleteConfirmDialog } from '@/components/plot-detail-sidebar';

export default function PlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;

  const { plot } = usePlotDetail(plotId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const plotCode = plot?.physicalPlot?.plotNumber || '';
  const customerName = plot?.roles?.[0]?.customer?.name || plotCode;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deletePlot(plotId);
      if (response.success) {
        setShowDeleteDialog(false);
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
        onDelete={() => setShowDeleteDialog(true)}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        targetName={customerName}
        targetCode={plotCode}
        isLoading={isDeleting}
        onDelete={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
