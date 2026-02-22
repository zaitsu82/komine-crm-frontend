'use client';

import { useState } from 'react';
import { PlotListItem } from '@komine/types';
import { ViewType } from '@/types/plot-detail';
import { Button } from '@/components/ui/button';
import { createPlot, updatePlot, deletePlot } from '@/lib/api/plots';
import { PlotFormData, plotFormDataToCreateRequest, plotFormDataToUpdateRequest } from '@/lib/validations/plot-form';
import { showError, showApiSuccess, showApiError } from '@/lib/toast';
import PlotForm from '@/components/plot-form';
import PlotRegistry from '@/components/plot-registry';
import PlotDetailView from '@/components/plot-detail-view';
import CollectiveBurialManagement from '@/components/collective-burial';
import PlotAvailabilityManagement from '@/components/plot-availability-management';
import StaffManagement from '@/components/staff-management';
import MastersManagement from '@/components/masters-management';
import { DocumentManagement } from '@/components/document-management';
import BulkImportPage from '@/components/bulk-import';
import { usePlotDetail } from '@/hooks/usePlots';

import {
  PlotDetailSidebar,
  DeleteConfirmDialog,
} from '@/components/plot-detail-sidebar';

interface PlotManagementProps {
  initialView?: ViewType;
}

export default function PlotManagement({ initialView = 'registry' }: PlotManagementProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedPlotName, setSelectedPlotName] = useState<string>('');
  const [selectedPlotCode, setSelectedPlotCode] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isLoading, setIsLoading] = useState(false);

  // 選択中の区画詳細を取得（編集モードで使用）
  const { plot: selectedPlotDetail } = usePlotDetail(selectedPlotId || '');

  // 削除ダイアログ用のstate
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 区画選択 → 区画詳細ビューへ遷移
  const handlePlotSelect = (plot: PlotListItem) => {
    setSelectedPlotId(plot.id);
    setSelectedPlotName(plot.customerName || '');
    setSelectedPlotCode(plot.plotNumber);
    setCurrentView('plot-details');
  };

  const handleBackToRegistry = () => {
    if (currentView === 'document-select' || currentView === 'document-history') {
      setCurrentView('plot-details');
      return;
    }
    setCurrentView('registry');
    setSelectedPlotId(null);
    setSelectedPlotName('');
    setSelectedPlotCode('');
  };


  const handleNewCustomer = () => {
    setCurrentView('register');
  };


  const handleSavePlot = async (data: PlotFormData) => {
    setIsLoading(true);
    try {
      if (currentView === 'register') {
        const request = plotFormDataToCreateRequest(data);
        const response = await createPlot(request);
        if (response.success) {
          setCurrentView('registry');
          showApiSuccess('作成', '区画');
        } else {
          showApiError('区画登録', response.error?.message);
        }
      } else if (currentView === 'edit' && selectedPlotId) {
        const request = plotFormDataToUpdateRequest(data);
        const response = await updatePlot(selectedPlotId, request);
        if (response.success) {
          setCurrentView('plot-details');
          showApiSuccess('更新', '区画情報');
        } else {
          showApiError('区画情報更新', response.error?.message);
        }
      }
    } catch {
      showError('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    if (selectedPlotId) {
      setCurrentView('plot-details');
    } else {
      setCurrentView('registry');
    }
  };

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = () => {
    if (!selectedPlotId) return;
    setShowDeleteDialog(true);
  };

  // 削除処理を実行
  const handleDelete = async () => {
    if (!selectedPlotId) return;

    setIsDeleting(true);

    try {
      const response = await deletePlot(selectedPlotId);

      if (response.success) {
        setShowDeleteDialog(false);
        setSelectedPlotId(null);
        setSelectedPlotName('');
        setSelectedPlotCode('');
        setCurrentView('registry');
        showApiSuccess('削除', '区画データ');
      } else {
        showApiError('データ削除', response.error?.message);
      }
    } catch {
      showError('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // サイドバーのビュー切り替えハンドラー
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // メインメニュー項目の場合は選択をクリア
    if (['registry', 'collective-burial', 'plot-availability', 'documents', 'staff-management', 'masters', 'bulk-import'].includes(view)) {
      setSelectedPlotId(null);
      setSelectedPlotName('');
      setSelectedPlotCode('');
    }
  };

  return (
    <div className="flex h-screen bg-shiro">
      {/* Left Sidebar Menu */}
      <PlotDetailSidebar
        currentView={currentView}
        selectedPlotId={selectedPlotId}
        onBackToRegistry={handleBackToRegistry}
        onViewChange={handleViewChange}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Conditional Content Based on Current View */}
        {currentView === 'registry' ? (
          <div className="flex-1 p-6">
            <PlotRegistry
              onPlotSelect={handlePlotSelect}
              selectedPlotId={selectedPlotId || undefined}
              onNewPlot={handleNewCustomer}
            />
          </div>
        ) : currentView === 'plot-details' && selectedPlotId ? (
          <div className="flex-1 p-6 overflow-auto">
            <PlotDetailView
              plotId={selectedPlotId}
              onBack={() => {
                setSelectedPlotId(null);
                setSelectedPlotName('');
                setSelectedPlotCode('');
                setCurrentView('registry');
              }}
              onEdit={() => {
                setCurrentView('edit');
              }}
            />
          </div>
        ) : currentView === 'register' || (currentView === 'edit' && selectedPlotId) ? (
          <>
            <div className="bg-kohaku-50 border-b border-gin px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">
                    {currentView === 'register' ? '新規区画登録' : '区画情報編集'}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelForm}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <PlotForm
                plotDetail={currentView === 'edit' ? selectedPlotDetail || undefined : undefined}
                onSave={handleSavePlot}
                onCancel={handleCancelForm}
                isLoading={isLoading}
              />
            </div>
          </>
        ) : currentView === 'collective-burial' ? (
          <CollectiveBurialManagement
            onBack={() => handleViewChange('registry')}
          />
        ) : currentView === 'plot-availability' ? (
          <div className="flex-1 overflow-auto">
            <PlotAvailabilityManagement />
          </div>
        ) : currentView === 'staff-management' ? (
          <div className="flex-1 overflow-auto">
            <StaffManagement />
          </div>
        ) : currentView === 'masters' ? (
          <div className="flex-1 overflow-auto">
            <MastersManagement />
          </div>
        ) : currentView === 'documents' ? (
          <div className="flex-1 overflow-auto">
            <DocumentManagement />
          </div>
        ) : currentView === 'bulk-import' ? (
          <div className="flex-1 overflow-auto">
            <BulkImportPage />
          </div>
        ) : null}

        {/* 書類履歴（区画コンテキスト） */}
        {currentView === 'document-history' && selectedPlotId && (
          <div className="flex-1 overflow-auto">
            <DocumentManagement
              customerId={selectedPlotId}
              customerName={selectedPlotName || selectedPlotCode}
              initialMode="list"
              onBack={() => setCurrentView('plot-details')}
            />
          </div>
        )}

        {/* 書類作成（区画コンテキスト） */}
        {currentView === 'document-select' && selectedPlotId && (
          <div className="flex-1 overflow-auto">
            <DocumentManagement
              customerId={selectedPlotId}
              customerName={selectedPlotName || selectedPlotCode}
              initialMode="create"
              onBack={() => setCurrentView('plot-details')}
            />
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {selectedPlotId && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          targetName={selectedPlotName || selectedPlotCode}
          targetCode={selectedPlotCode}
          isLoading={isDeleting}
          onDelete={handleDelete}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
