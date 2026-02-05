'use client';

import { useState } from 'react';
import { PlotListItem, ContractStatus } from '@komine/types';
import { ViewType, TerminationFormData } from '@/types/customer-detail';
import { Button } from '@/components/ui/button';
import { createPlot, updatePlot, deletePlot, terminatePlot } from '@/lib/api/plots';
import type { TerminationInput } from '@/lib/api/plots';
import { formDataToCreateRequest, formDataToUpdateRequest } from '@/lib/adapters/plot-customer-bridge';
import { CustomerFormData } from '@/lib/validations';
import { showSuccess, showError, showWarning, showValidationError, showApiSuccess, showApiError } from '@/lib/toast';
import CustomerForm from '@/components/customer-form';
import PlotRegistry from '@/components/plot-registry';
import PlotDetailView from '@/components/plot-detail-view';
import CollectiveBurialManagement from '@/components/collective-burial-management';
import PlotAvailabilityManagement from '@/components/plot-availability-management';
import StaffManagement from '@/components/staff-management';
import { DocumentManagement } from '@/components/document-management';
import { usePlotDetail } from '@/hooks/usePlots';

import {
  CustomerDetailSidebar,
  TerminationDialog,
  DeleteConfirmDialog,
} from '@/components/customer-detail';

interface CustomerManagementProps {
  initialView?: ViewType;
}

export default function CustomerManagement({ initialView = 'registry' }: CustomerManagementProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedPlotName, setSelectedPlotName] = useState<string>('');
  const [selectedPlotCode, setSelectedPlotCode] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isLoading, setIsLoading] = useState(false);

  // 選択中の区画詳細を取得（解約状態の判定等に使用）
  const { plot: selectedPlotDetail } = usePlotDetail(selectedPlotId || '');
  const isTerminated = selectedPlotDetail?.contractStatus === ContractStatus.Terminated
    || selectedPlotDetail?.contractStatus === ContractStatus.Cancelled;

  // 解約ダイアログ用のstate
  const [showTerminationDialog, setShowTerminationDialog] = useState(false);
  const [terminationForm, setTerminationForm] = useState<TerminationFormData>({
    terminationDate: new Date().toISOString().split('T')[0],
    reason: '',
    processType: 'return',
    processDetail: '',
    refundAmount: '',
    handledBy: '',
    notes: ''
  });

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


  const handleSaveCustomer = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      if (currentView === 'register') {
        // 新規登録 - Plot API を使用
        const request = formDataToCreateRequest(data);
        const response = await createPlot(request);
        if (response.success) {
          setCurrentView('registry');
          showApiSuccess('作成', '区画');
        } else {
          showApiError('区画登録', response.error?.message);
        }
      } else if (currentView === 'edit' && selectedPlotId) {
        // 更新 - Plot API を使用
        const request = formDataToUpdateRequest(data);
        const response = await updatePlot(selectedPlotId, request);
        if (response.success) {
          setCurrentView('plot-details');
          showApiSuccess('更新', '区画情報');
        } else {
          showApiError('区画情報更新', response.error?.message);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
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

  // 解約ダイアログを開く
  const handleOpenTerminationDialog = () => {
    if (!selectedPlotId) return;
    if (isTerminated) {
      showWarning('この区画は既に解約済みです');
      return;
    }
    setTerminationForm({
      terminationDate: new Date().toISOString().split('T')[0],
      reason: '',
      processType: 'return',
      processDetail: '',
      refundAmount: '',
      handledBy: '',
      notes: ''
    });
    setShowTerminationDialog(true);
  };

  // 解約処理を実行
  const handleTerminate = async () => {
    if (!selectedPlotId) return;

    // バリデーション
    if (!terminationForm.reason.trim()) {
      showValidationError('解約理由を入力してください');
      return;
    }
    if (!terminationForm.handledBy.trim()) {
      showValidationError('担当者を入力してください');
      return;
    }

    // 確認ダイアログ
    if (!confirm(`${selectedPlotName || selectedPlotCode} の契約を解約処理します。\nこの操作は取り消せません。よろしいですか？`)) {
      return;
    }

    const terminationInput: TerminationInput = {
      terminationDate: new Date(terminationForm.terminationDate),
      reason: terminationForm.reason,
      processType: terminationForm.processType,
      processDetail: terminationForm.processDetail || undefined,
      refundAmount: terminationForm.refundAmount ? parseInt(terminationForm.refundAmount, 10) : undefined,
      handledBy: terminationForm.handledBy,
      notes: terminationForm.notes || undefined,
    };

    try {
      const response = await terminatePlot(selectedPlotId, terminationInput);

      if (response.success) {
        setShowTerminationDialog(false);
        showSuccess('解約処理が完了しました');
      } else {
        showApiError('解約処理', response.error?.message);
      }
    } catch {
      showError('解約処理中にエラーが発生しました');
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
    if (['registry', 'collective-burial', 'plot-availability', 'documents', 'staff-management'].includes(view)) {
      setSelectedPlotId(null);
      setSelectedPlotName('');
      setSelectedPlotCode('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Menu */}
      <CustomerDetailSidebar
        currentView={currentView}
        selectedPlotId={selectedPlotId}
        isTerminated={isTerminated}
        onBackToRegistry={handleBackToRegistry}
        onViewChange={handleViewChange}
        onTermination={handleOpenTerminationDialog}
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
            {/* Customer Info Header for Register/Edit */}
            <div className="bg-yellow-100 border-b border-gray-300 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">
                    {currentView === 'register' ? '新規顧客登録' : '顧客情報編集'}
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

            {/* Customer Form with Tab Layout */}
            <div className="flex-1 p-6">
              <CustomerForm
                customer={undefined}
                onSave={handleSaveCustomer}
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
        ) : currentView === 'documents' ? (
          <div className="flex-1 overflow-auto">
            <DocumentManagement />
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

      {/* 解約入力ダイアログ */}
      {selectedPlotId && (
        <TerminationDialog
          isOpen={showTerminationDialog}
          targetName={selectedPlotName || selectedPlotCode}
          targetCode={selectedPlotCode}
          formData={terminationForm}
          onFormChange={setTerminationForm}
          onTerminate={handleTerminate}
          onClose={() => setShowTerminationDialog(false)}
        />
      )}

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
