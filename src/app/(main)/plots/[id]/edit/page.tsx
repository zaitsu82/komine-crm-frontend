'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updatePlot } from '@/lib/api/plots';
import { PlotFormData, plotFormDataToUpdateRequest } from '@/lib/validations/plot-form';
import { showError, showApiSuccess, showApiError } from '@/lib/toast';
import PlotForm from '@/components/plot-form';
import PageHeader from '@/components/page-header';
import { usePlotDetail } from '@/hooks/usePlots';

export default function EditPlotPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  const { plot: plotDetail, isLoading: isPlotDetailLoading } = usePlotDetail(plotId);

  const handleSave = async (data: PlotFormData) => {
    setIsLoading(true);
    try {
      const request = plotFormDataToUpdateRequest(data);
      const response = await updatePlot(plotId, request);
      if (response.success) {
        showApiSuccess('更新', '区画情報');
        router.push(`/plots/${plotId}`);
      } else {
        showApiError('区画情報更新', response.error?.message, response.error?.details);
      }
    } catch {
      showError('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/plots/${plotId}`);
  };

  return (
    <>
      <PageHeader
        title="区画情報編集"
        theme="kohaku"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      />
      <div className="flex-1 p-3 md:p-6 overflow-auto">
        <div className="mb-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={handleCancel} className="cursor-pointer">
            キャンセル
          </Button>
        </div>
        {isPlotDetailLoading && !plotDetail ? (
          <div className="flex items-center justify-center h-64 text-hai">
            区画情報を読み込み中...
          </div>
        ) : (
          <PlotForm
            plotDetail={plotDetail || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
}
