'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import { ViewType, TerminationFormData } from '@/types/customer-detail';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatDateWithEra, calculateOwnedPlotsInfo } from '@/lib/utils';
import { addCustomerDocument, TerminationInput } from '@/lib/data';
import { createCustomer, updateCustomer, getCustomerById, deleteCustomer, terminateCustomer } from '@/lib/api';
import { CustomerFormData } from '@/lib/validations';
import { showSuccess, showError, showWarning, showValidationError, showApiSuccess, showApiError } from '@/lib/toast';
import CustomerSearch from '@/components/customer-search';
import CustomerForm, { CustomerDetailView } from '@/components/customer-form';
import CustomerRegistry from '@/components/customer-registry';
import CollectiveBurialManagement from '@/components/collective-burial-management';
import PlotAvailabilityManagement from '@/components/plot-availability-management';
import StaffManagement from '@/components/staff-management';
import { DocumentManagement } from '@/components/document-management';

import InvoiceTemplate from '@/components/invoice-template';
import PostcardTemplate from '@/components/postcard-template';
import InvoiceEditor from '@/components/invoice-editor';
import PostcardEditor from '@/components/postcard-editor';

import {
  CustomerDetailSidebar,
  TerminationDialog,
  DeleteConfirmDialog,
} from '@/components/customer-detail';

interface CustomerManagementProps {
  initialView?: ViewType;
}

export default function CustomerManagement({ initialView = 'registry' }: CustomerManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
  const [showPostcardEditor, setShowPostcardEditor] = useState(false);

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

  const handleCustomerSelect = async (customer: Customer) => {
    setIsLoading(true);
    setCurrentView('details');

    try {
      // APIを呼び出して顧客の詳細情報を取得
      const response = await getCustomerById(customer.id);

      if (response.success) {
        setSelectedCustomer(response.data);
      } else {
        // API呼び出しが失敗した場合は一覧から渡されたデータを使用
        console.warn('顧客詳細の取得に失敗しました。一覧データを使用します。', response.error);
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error('顧客詳細の取得中にエラーが発生しました:', error);
      // エラー時も一覧から渡されたデータを使用
      setSelectedCustomer(customer);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegistry = () => {
    if (currentView === 'document-select' || currentView === 'document-history') {
      setCurrentView('details');
      return;
    }
    setCurrentView('registry');
    setSelectedCustomer(null);
  };


  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setCurrentView('register');
  };


  const handleSaveCustomer = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      if (currentView === 'register') {
        // 新規登録 - APIを使用
        const response = await createCustomer(data);
        if (response.success) {
          setSelectedCustomer(response.data);
          setCurrentView('details');
          showApiSuccess('作成', '顧客');
        } else {
          showApiError('顧客登録', response.error?.message);
        }
      } else if (currentView === 'edit' && selectedCustomer) {
        // 更新 - APIを使用
        const response = await updateCustomer(selectedCustomer.id, data);
        if (response.success) {
          setSelectedCustomer(response.data);
          setCurrentView('details');
          showApiSuccess('更新', '顧客情報');
        } else {
          showApiError('顧客情報更新', response.error?.message);
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
    if (selectedCustomer) {
      setCurrentView('details');
    } else {
      setCurrentView('search');
    }
  };

  // 解約ダイアログを開く
  const handleOpenTerminationDialog = () => {
    if (!selectedCustomer) return;
    if (selectedCustomer.status === 'inactive') {
      showWarning('この顧客は既に解約済みです');
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
    if (!selectedCustomer) return;

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
    if (!confirm(`${selectedCustomer.name} 様の契約を解約処理します。\nこの操作は取り消せません。よろしいですか？`)) {
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
      const response = await terminateCustomer(selectedCustomer.id, terminationInput);

      if (response.success && response.data) {
        setSelectedCustomer(response.data);
        setShowTerminationDialog(false);
        showSuccess('解約処理が完了しました');
      } else if (!response.success) {
        showApiError('解約処理', response.error?.message);
      }
    } catch {
      showError('解約処理中にエラーが発生しました');
    }
  };

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = () => {
    if (!selectedCustomer) return;
    setShowDeleteDialog(true);
  };

  // 削除処理を実行
  const handleDelete = async () => {
    if (!selectedCustomer) return;

    setIsDeleting(true);

    try {
      const response = await deleteCustomer(selectedCustomer.id);

      if (response.success) {
        setShowDeleteDialog(false);
        setSelectedCustomer(null);
        setCurrentView('registry');
        showApiSuccess('削除', '顧客データ');
      } else {
        showApiError('顧客データ削除', response.error?.message);
      }
    } catch {
      showError('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
  };

  const handleClosePostcard = () => {
    setShowPostcard(false);
  };

  // サイドバーのビュー切り替えハンドラー
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // メインメニュー項目の場合は顧客選択をクリア
    if (['registry', 'collective-burial', 'plot-availability', 'documents', 'staff-management'].includes(view)) {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Menu */}
      <CustomerDetailSidebar
        currentView={currentView}
        selectedCustomer={selectedCustomer}
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
            <CustomerRegistry
              onCustomerSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer || undefined}
              onNewCustomer={handleNewCustomer}
            />
          </div>
        ) : currentView === 'search' ? (
          <div className="flex-1 p-6">
            <CustomerSearch
              onCustomerSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer || undefined}
              onNewCustomer={handleNewCustomer}
            />
          </div>
        ) : currentView === 'register' || (currentView === 'edit' && selectedCustomer) ? (
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
                customer={currentView === 'edit' ? selectedCustomer || undefined : undefined}
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
        ) : currentView === 'details' && isLoading && !selectedCustomer ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">顧客情報を読み込み中...</p>
            </div>
          </div>
        ) : currentView === 'details' && selectedCustomer && (
          <>
            {/* Customer Info Header */}
            <div className="bg-yellow-100 border-b border-gray-300 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">墓園</Label>
                    <div className="px-2 py-1 bg-white border rounded text-sm">{selectedCustomer.plotInfo?.section || '小霊園区'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">区石</Label>
                    <div className="px-2 py-1 bg-white border rounded text-sm font-medium">{selectedCustomer.customerCode}</div>
                  </div>
                  {/* 複数区画情報の表示 */}
                  {selectedCustomer.ownedPlots && selectedCustomer.ownedPlots.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-medium">所有区画</Label>
                      <div className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm font-medium text-green-800">
                        {calculateOwnedPlotsInfo(selectedCustomer.ownedPlots).displayText}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">管理区分</Label>
                    <div className="px-2 py-1 bg-white border rounded text-sm">基地</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">利用状況</Label>
                    <div className="px-2 py-1 bg-white border rounded text-sm">
                      {selectedCustomer.plotInfo?.usage === 'in_use' ? '利用中' :
                        selectedCustomer.plotInfo?.usage === 'reserved' ? '予約済み' : '利用可能'}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">表示</Button>
                </div>
              </div>
            </div>

            {/* Customer Details - Using CustomerDetailView */}
            <div className="flex-1 p-6 overflow-auto">
              <CustomerDetailView
                customer={selectedCustomer}
                onEdit={() => setCurrentView('edit')}
              />
            </div>
          </>
        )}

        {/* 書類履歴（顧客コンテキスト） */}
        {currentView === 'document-history' && selectedCustomer && (
          <div className="flex-1 overflow-auto">
            <DocumentManagement
              customerId={selectedCustomer.id}
              customerName={selectedCustomer.name}
              initialMode="list"
              onBack={() => setCurrentView('details')}
            />
          </div>
        )}

        {/* 書類作成（顧客コンテキスト） */}
        {currentView === 'document-select' && selectedCustomer && (
          <div className="flex-1 overflow-auto">
            <DocumentManagement
              customerId={selectedCustomer.id}
              customerName={selectedCustomer.name}
              initialMode="create"
              onBack={() => setCurrentView('details')}
            />
          </div>
        )}
      </div>

      {/* 請求書モーダル */}
      {/* Hidden Invoice Template for Printing */}
      {showInvoice && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="p-4 no-print flex justify-end">
            <Button onClick={handleCloseInvoice} variant="outline">閉じる</Button>
          </div>
          <InvoiceTemplate
            customer={selectedCustomer}
            invoiceDate={new Date()}
            invoiceNumber={`INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${selectedCustomer.customerCode}`}
          />
        </div>
      )}

      {/* Hidden Postcard Template for Printing */}
      {showPostcard && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="p-4 no-print flex justify-end">
            <Button onClick={handleClosePostcard} variant="outline">閉じる</Button>
          </div>
          <div className="flex justify-center gap-8 p-8 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-lg">
              <PostcardTemplate customer={selectedCustomer} />
            </div>
          </div>
        </div>
      )}

      {/* 請求書エディタ（プレビュー・編集・印刷） */}
      {showInvoiceEditor && selectedCustomer && (
        <InvoiceEditor
          customer={selectedCustomer}
          onClose={() => setShowInvoiceEditor(false)}
          onSave={() => {
            addCustomerDocument(selectedCustomer.id, {
              type: 'invoice',
              name: `請求書_${formatDateWithEra(new Date())}`,
              status: 'generated'
            });
            setSelectedCustomer({ ...selectedCustomer });
          }}
        />
      )}

      {/* はがきエディタ（プレビュー・編集・印刷） */}
      {showPostcardEditor && selectedCustomer && (
        <PostcardEditor
          customer={selectedCustomer}
          onClose={() => setShowPostcardEditor(false)}
          onSave={() => {
            addCustomerDocument(selectedCustomer.id, {
              type: 'postcard',
              name: `はがきデータ_${formatDateWithEra(new Date())}`,
              status: 'generated'
            });
            setSelectedCustomer({ ...selectedCustomer });
          }}
        />
      )}

      {/* 解約入力ダイアログ */}
      {selectedCustomer && (
        <TerminationDialog
          isOpen={showTerminationDialog}
          customer={selectedCustomer}
          formData={terminationForm}
          onFormChange={setTerminationForm}
          onTerminate={handleTerminate}
          onClose={() => setShowTerminationDialog(false)}
        />
      )}

      {/* 削除確認ダイアログ */}
      {selectedCustomer && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          customer={selectedCustomer}
          isLoading={isDeleting}
          onDelete={handleDelete}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}