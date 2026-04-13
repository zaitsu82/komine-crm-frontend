'use client';

import { useState } from 'react';
import { PlotListItem } from '@komine/types';
import { ViewType, MENU_ITEMS } from '@/types/plot-detail';
import { useAuth } from '@/contexts/auth-context';
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
import ProfilePage from '@/components/profile-page';
import PageHeader from '@/components/page-header';
import { usePlotDetail } from '@/hooks/usePlots';

import {
  PlotDetailSidebar,
  DeleteConfirmDialog,
} from '@/components/plot-detail-sidebar';

interface PlotManagementProps {
  initialView?: ViewType;
}

export default function PlotManagement({ initialView = 'registry' }: PlotManagementProps) {
  const { user } = useAuth();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedPlotName, setSelectedPlotName] = useState<string>('');
  const [selectedPlotCode, setSelectedPlotCode] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 選択中の区画詳細を取得（編集モードで使用）
  const { plot: selectedPlotDetail, isLoading: isPlotDetailLoading, refresh: refreshPlotDetail } = usePlotDetail(selectedPlotId || '');

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
          showApiError('区画登録', response.error?.message, response.error?.details);
        }
      } else if (currentView === 'edit' && selectedPlotId) {
        const request = plotFormDataToUpdateRequest(data);
        const response = await updatePlot(selectedPlotId, request);
        if (response.success) {
          // 更新APIレスポンスは histories を含まないため、詳細を再取得して
          // 履歴タブに最新エントリが反映されるようにする
          await refreshPlotDetail();
          setCurrentView('plot-details');
          showApiSuccess('更新', '区画情報');
        } else {
          showApiError('区画情報更新', response.error?.message, response.error?.details);
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
        showApiError('データ削除', response.error?.message, response.error?.details);
      }
    } catch {
      showError('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // サイドバーのビュー切り替えハンドラー（権限チェック付き）
  const handleViewChange = (view: ViewType) => {
    // メニュー項目に対応するビューの場合、権限チェック
    const menuItem = MENU_ITEMS.find(item => item.view === view);
    if (menuItem && user && !menuItem.requiredRoles.includes(user.role)) {
      return;
    }

    setCurrentView(view);
    // メインメニュー項目の場合は選択をクリア
    if (['registry', 'collective-burial', 'plot-availability', 'documents', 'staff-management', 'masters', 'bulk-import', 'profile'].includes(view)) {
      setSelectedPlotId(null);
      setSelectedPlotName('');
      setSelectedPlotCode('');
    }
  };

  const sidebarWidth = sidebarCollapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="flex h-screen bg-shiro">
      {/* Left Sidebar Menu */}
      <PlotDetailSidebar
        currentView={currentView}
        selectedPlotId={selectedPlotId}
        onBackToRegistry={handleBackToRegistry}
        onViewChange={(view) => { handleViewChange(view); setMobileSidebarOpen(false); }}
        onDelete={handleOpenDeleteDialog}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ml-0 ${sidebarWidth} transition-all duration-300`}>
        {/* モバイルヘッダー（ハンバーガーメニュー） */}
        <div className="md:hidden flex items-center h-14 px-4 border-b border-gin bg-white flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-sumi hover:bg-kinari"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-mincho text-base font-semibold text-sumi truncate">小嶺霊園CRM</span>
        </div>

        {/* Conditional Content Based on Current View */}
        {currentView === 'registry' ? (
          <PlotRegistry
            onPlotSelect={handlePlotSelect}
            selectedPlotId={selectedPlotId || undefined}
            onNewPlot={handleNewCustomer}
            onViewChange={handleViewChange}
          />
        ) : currentView === 'plot-details' && selectedPlotId ? (
          <div className="flex-1 p-3 md:p-6 overflow-auto">
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
            <PageHeader
              title={currentView === 'register' ? '新規区画登録' : '区画情報編集'}
              theme="kohaku"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              onViewChange={handleViewChange}
            />

            <div className="flex-1 p-3 md:p-6 overflow-auto">
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelForm}
                  className="cursor-pointer"
                >
                  キャンセル
                </Button>
              </div>
              {currentView === 'edit' && isPlotDetailLoading && !selectedPlotDetail ? (
                <div className="flex items-center justify-center h-64 text-hai">
                  区画情報を読み込み中...
                </div>
              ) : (
                <PlotForm
                  plotDetail={currentView === 'edit' ? selectedPlotDetail || undefined : undefined}
                  onSave={handleSavePlot}
                  onCancel={handleCancelForm}
                  isLoading={isLoading}
                />
              )}
            </div>
          </>
        ) : currentView === 'collective-burial' ? (
          <CollectiveBurialManagement
            onBack={() => handleViewChange('registry')}
            onViewChange={handleViewChange}
          />
        ) : currentView === 'plot-availability' ? (
          <PlotAvailabilityManagement onViewChange={handleViewChange} />
        ) : currentView === 'staff-management' ? (
          <StaffManagement onViewChange={handleViewChange} />
        ) : currentView === 'masters' ? (
          <MastersManagement onViewChange={handleViewChange} />
        ) : currentView === 'documents' ? (
          <DocumentManagement onViewChange={handleViewChange} />
        ) : currentView === 'bulk-import' ? (
          <BulkImportPage onViewChange={handleViewChange} />
        ) : currentView === 'profile' ? (
          <ProfilePage onBack={() => setCurrentView('registry')} onViewChange={handleViewChange} />
        ) : null}

        {/* 書類履歴（区画コンテキスト） */}
        {currentView === 'document-history' && selectedPlotId && (
          <DocumentManagement
            customerId={selectedPlotId}
            customerName={selectedPlotName || selectedPlotCode}
            initialMode="list"
            onBack={() => setCurrentView('plot-details')}
            onViewChange={handleViewChange}
          />
        )}

        {/* 書類作成（区画コンテキスト：テンプレート選択→自動挿入） */}
        {currentView === 'document-select' && selectedPlotId && (
          <DocumentManagement
            customerId={selectedPlotId}
            customerName={selectedPlotName || selectedPlotCode}
            plotDetail={selectedPlotDetail || undefined}
            initialMode="templates"
            onBack={() => setCurrentView('plot-details')}
            onViewChange={handleViewChange}
          />
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
