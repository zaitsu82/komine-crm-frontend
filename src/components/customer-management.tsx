'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import { ViewType, HistoryEntry, ImportantNote, TerminationFormData } from '@/types/customer-detail';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatDateWithEra, calculateOwnedPlotsInfo } from '@/lib/utils';
import { formDataToCustomer, addCustomerDocument, TerminationInput } from '@/lib/data';
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
  DocumentHistory,
  DocumentSelect,
  NoteDialog,
  HistoryDialog,
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

  // 履歴追加用のstate
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([
    {
      id: 'history-1',
      date: '2024年1月15日 14:30',
      staff: '山田 太郎',
      type: '電話対応',
      priority: '通常',
      content: '工事進捗についてお問い合わせ。基礎工事が完了し、墓石設置は3月予定であることをご説明。'
    },
    {
      id: 'history-2',
      date: '2023年12月20日 10:15',
      staff: '佐藤 花子',
      type: '来所相談',
      priority: '重要',
      content: '契約内容の変更について相談。墓石の種類変更を希望。見積もりを作成し後日回答予定。'
    }
  ]);
  const [newHistory, setNewHistory] = useState<Omit<HistoryEntry, 'id'>>({
    date: '',
    staff: '',
    type: '電話対応',
    priority: '通常',
    content: ''
  });

  // 重要な連絡事項・注意事項用のstate（顧客IDごとに管理）
  const [customerNotes, setCustomerNotes] = useState<Record<string, ImportantNote[]>>({
    'DEMO001': [
      {
        id: 'note-1',
        date: '2023年12月22日',
        priority: '要注意',
        content: 'ご高齢のため、重要な説明は家族同席の上で行うこと。'
      }
    ]
  });

  // 現在選択中の顧客の注意事項を取得
  const importantNotes = selectedCustomer ? (customerNotes[selectedCustomer.id] || []) : [];

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

  // 注意事項を更新する関数
  const setImportantNotes = (notes: ImportantNote[]) => {
    if (selectedCustomer) {
      setCustomerNotes(prev => ({
        ...prev,
        [selectedCustomer.id]: notes
      }));
    }
  };

  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState<Omit<ImportantNote, 'id'>>({
    date: '',
    priority: '注意',
    content: ''
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

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

  // 履歴追加ダイアログを開く
  const handleOpenHistoryDialog = () => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setNewHistory({
      date: formattedDate,
      staff: '',
      type: '電話対応',
      priority: '通常',
      content: ''
    });
    setShowHistoryDialog(true);
  };

  // 履歴を追加
  const handleAddHistory = () => {
    if (!newHistory.date || !newHistory.staff || !newHistory.content) {
      showValidationError('日時、担当者、対応内容は必須です');
      return;
    }
    const newEntry: HistoryEntry = {
      id: `history-${Date.now()}`,
      ...newHistory
    };
    setHistoryEntries([newEntry, ...historyEntries]);
    setShowHistoryDialog(false);
    setNewHistory({
      date: '',
      staff: '',
      type: '電話対応',
      priority: '通常',
      content: ''
    });
  };

  // 履歴を削除
  const handleDeleteHistory = (id: string) => {
    if (confirm('この履歴を削除しますか？')) {
      setHistoryEntries(historyEntries.filter(entry => entry.id !== id));
    }
  };

  // 重要な連絡事項ダイアログを開く（新規）
  const handleOpenNoteDialog = () => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    setNewNote({
      date: formattedDate,
      priority: '注意',
      content: ''
    });
    setEditingNoteId(null);
    setShowNoteDialog(true);
  };

  // 重要な連絡事項ダイアログを開く（編集）
  const handleEditNote = (note: typeof importantNotes[0]) => {
    setNewNote({
      date: note.date,
      priority: note.priority,
      content: note.content
    });
    setEditingNoteId(note.id);
    setShowNoteDialog(true);
  };

  // 重要な連絡事項を追加・更新
  const handleSaveNote = () => {
    if (!newNote.content) {
      showValidationError('内容は必須です');
      return;
    }

    if (editingNoteId) {
      // 編集モード
      setImportantNotes(importantNotes.map(note =>
        note.id === editingNoteId
          ? { ...note, ...newNote }
          : note
      ));
    } else {
      // 新規追加
      const newEntry: typeof importantNotes[0] = {
        id: `note-${Date.now()}`,
        ...newNote
      };
      setImportantNotes([newEntry, ...importantNotes]);
    }
    setShowNoteDialog(false);
    setEditingNoteId(null);
  };

  // 重要な連絡事項を削除
  const handleDeleteNote = (id: string) => {
    if (confirm('この連絡事項を削除しますか？')) {
      setImportantNotes(importantNotes.filter(note => note.id !== id));
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

  // 書類を発送済みにマークするハンドラー
  const handleMarkAsSent = (docId: string) => {
    if (!selectedCustomer?.documents) return;
    const doc = selectedCustomer.documents.find(d => d.id === docId);
    if (doc) {
      doc.status = 'sent';
      showSuccess('ステータスを発送済みに変更しました');
      setSelectedCustomer({ ...selectedCustomer });
    }
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
              customerAttentionNotes={Object.fromEntries(
                Object.entries(customerNotes).map(([customerId, notes]) => {
                  if (notes.length === 0) return [customerId, null];
                  const priorityOrder = ['要注意', '注意', '参考'];
                  const sorted = [...notes].sort((a, b) =>
                    priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
                  );
                  return [customerId, { content: sorted[0].content, priority: sorted[0].priority }];
                }).filter(([, v]) => v !== null)
              )}
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

              {/* 追加セクション: 対応履歴・重要な連絡事項 */}
              <div className="mt-8 space-y-6">
                {/* 対応履歴 */}
                <div className="bg-blue-50 p-4 rounded border">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <h4 className="font-semibold">対応履歴（{historyEntries.length}件）</h4>
                    <Button size="sm" variant="outline" onClick={handleOpenHistoryDialog}>+ 履歴追加</Button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {historyEntries.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">対応履歴がありません</p>
                    ) : (
                      historyEntries.map((entry) => (
                        <div key={entry.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-4 gap-4 flex-1 text-sm">
                              <div>
                                <Label className="text-xs text-gray-600">日時</Label>
                                <p>{entry.date}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">担当者</Label>
                                <p>{entry.staff}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">対応種別</Label>
                                <p>{entry.type}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">重要度</Label>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${entry.priority === '緊急' ? 'bg-red-100 text-red-800' :
                                  entry.priority === '重要' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {entry.priority}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDeleteHistory(entry.id)}
                            >
                              削除
                            </Button>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm bg-gray-50 p-2 rounded">{entry.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 重要な連絡事項 */}
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <div className="flex justify-between items-center border-b border-red-200 pb-2 mb-3">
                    <h4 className="font-semibold text-red-700">重要な連絡事項・注意事項（{importantNotes.length}件）</h4>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={handleOpenNoteDialog}>+ 追加</Button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {importantNotes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">登録された連絡事項・注意事項はありません</p>
                    ) : (
                      importantNotes.map((note) => (
                        <div key={note.id} className="bg-white p-3 rounded border border-red-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">{note.date}</span>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${note.priority === '要注意' ? 'bg-red-100 text-red-800' :
                                note.priority === '注意' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {note.priority}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 px-2"
                                onClick={() => handleEditNote(note)}
                              >
                                編集
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 h-7 px-2"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                削除
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm bg-red-50 p-2 rounded">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
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

      {/* 重要な連絡事項追加・編集ダイアログ */}
      <NoteDialog
        isOpen={showNoteDialog}
        editingNoteId={editingNoteId}
        newNote={newNote}
        onNoteChange={setNewNote}
        onSave={handleSaveNote}
        onClose={() => { setShowNoteDialog(false); setEditingNoteId(null); }}
      />

      {/* 履歴追加ダイアログ */}
      <HistoryDialog
        isOpen={showHistoryDialog}
        newHistory={newHistory}
        onHistoryChange={setNewHistory}
        onAdd={handleAddHistory}
        onClose={() => setShowHistoryDialog(false)}
      />

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