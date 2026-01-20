'use client';

import { useState } from 'react';
import { Customer, OwnedPlot, PLOT_SIZE_LABELS, CONSTRUCTION_TYPE_LABELS, ConstructionType, HISTORY_REASON_LABELS, HistoryReasonType, TerminationProcessType, TERMINATION_PROCESS_TYPE_LABELS } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateWithEra, calculateOwnedPlotsInfo } from '@/lib/utils';
import { createCustomer, updateCustomer, formDataToCustomer, addCustomerDocument, terminateCustomer, TerminationInput } from '@/lib/data';
import { CustomerFormData } from '@/lib/validations';
import CustomerSearch from '@/components/customer-search';
import CustomerForm from '@/components/customer-form';
import CustomerRegistry from '@/components/customer-registry';
import CollectiveBurialList from '@/components/collective-burial-list';
import PlotAvailabilityManagement from '@/components/plot-availability-management';

import InvoiceTemplate from '@/components/invoice-template';
import PostcardTemplate from '@/components/postcard-template';
import InvoiceEditor from '@/components/invoice-editor';
import PostcardEditor from '@/components/postcard-editor';
import { exportInvoiceToExcel, exportPostcardToExcel } from '@/lib/excel-exporter';

const menuItems = [
  '台帳問い合わせ',
  '台帳編集',
  '新規登録',
  '合祀管理',
  '区画残数管理',
  '契約訂正'
];

type ViewType = 'registry' | 'search' | 'details' | 'register' | 'edit' | 'collective-burial' | 'plot-availability' | 'invoice' | 'document-select' | 'document-history';

interface CustomerManagementProps {
  onNavigateToMenu?: () => void;
  initialView?: ViewType;
}

// 対応履歴の型定義
interface HistoryEntry {
  id: string;
  date: string;
  staff: string;
  type: string;
  priority: '通常' | '重要' | '緊急';
  content: string;
}

export default function CustomerManagement({ onNavigateToMenu, initialView = 'registry' }: CustomerManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
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
  interface ImportantNote {
    id: string;
    date: string;
    priority: '要注意' | '注意' | '参考';
    content: string;
  }
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
  const [terminationForm, setTerminationForm] = useState<{
    terminationDate: string;
    reason: string;
    processType: TerminationProcessType;
    processDetail: string;
    refundAmount: string;
    handledBy: string;
    notes: string;
  }>({
    terminationDate: new Date().toISOString().split('T')[0],
    reason: '',
    processType: 'return',
    processDetail: '',
    refundAmount: '',
    handledBy: '',
    notes: ''
  });

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

  // 顧客ごとの注意事項を取得するヘルパー関数
  const getCustomerAttentionNotes = (customerId: string): string => {
    const notes = customerNotes[customerId] || [];
    if (notes.length === 0) return '';
    // 要注意を優先して最初の1件を返す
    const priorityOrder = ['要注意', '注意', '参考'];
    const sorted = [...notes].sort((a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );
    return sorted[0].content;
  };

  // 顧客ごとの注意事項の重要度を取得
  const getCustomerAttentionPriority = (customerId: string): string | null => {
    const notes = customerNotes[customerId] || [];
    if (notes.length === 0) return null;
    const priorityOrder = ['要注意', '注意', '参考'];
    const sorted = [...notes].sort((a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );
    return sorted[0].priority;
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('details');
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
      const customerData = formDataToCustomer(data);

      if (currentView === 'register') {
        // 新規登録
        const newCustomer = createCustomer(customerData);
        setSelectedCustomer(newCustomer);
        setCurrentView('details');
        alert('顧客を登録しました');
      } else if (currentView === 'edit' && selectedCustomer) {
        // 更新
        const updatedCustomer = updateCustomer(selectedCustomer.id, customerData);
        if (updatedCustomer) {
          setSelectedCustomer(updatedCustomer);
          setCurrentView('details');
          alert('顧客情報を更新しました');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
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
      alert('日時、担当者、対応内容は必須です');
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
      alert('内容は必須です');
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
      alert('この顧客は既に解約済みです。');
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
  const handleTerminate = () => {
    if (!selectedCustomer) return;

    // バリデーション
    if (!terminationForm.reason.trim()) {
      alert('解約理由を入力してください。');
      return;
    }
    if (!terminationForm.handledBy.trim()) {
      alert('担当者を入力してください。');
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

    const result = terminateCustomer(selectedCustomer.id, terminationInput);

    if (result) {
      setSelectedCustomer(result);
      setShowTerminationDialog(false);
      alert('解約処理が完了しました。');
    } else {
      alert('解約処理に失敗しました。');
    }
  };

  const handleExportInvoice = async () => {
    if (!selectedCustomer) return;
    await exportInvoiceToExcel(selectedCustomer);
    addCustomerDocument(selectedCustomer.id, {
      type: 'invoice',
      name: `請求書_${formatDateWithEra(new Date())}`,
      status: 'generated'
    });
    alert('請求書をエクセル出力し、書類履歴に記録しました');
    // Force re-render to show new document (in a real app, useSWR or similar would handle this)
    setSelectedCustomer({ ...selectedCustomer });
  };

  const handleExportPostcard = async () => {
    if (!selectedCustomer) return;
    await exportPostcardToExcel(selectedCustomer);
    addCustomerDocument(selectedCustomer.id, {
      type: 'postcard',
      name: `はがきデータ_${formatDateWithEra(new Date())}`,
      status: 'generated'
    });
    alert('はがきデータをエクセル出力し、書類履歴に記録しました');
    setSelectedCustomer({ ...selectedCustomer });
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
  };

  const handleClosePostcard = () => {
    setShowPostcard(false);
  };

  const handleTabEdit = (tabName: string) => {
    setEditingTab(tabName);
    // Initialize form data with current customer data
    if (selectedCustomer) {
      setEditFormData({
        ...selectedCustomer,
        emergencyContact: selectedCustomer.emergencyContact || { name: '', relationship: '', phoneNumber: '' },
        plotInfo: selectedCustomer.plotInfo || { plotNumber: '', section: '', usage: 'available', size: '', price: '', contractDate: null }
      });
    }
  };

  const handleTabSave = (tabName: string) => {
    if (selectedCustomer) {
      // Update the selected customer with the edited data
      setSelectedCustomer({ ...selectedCustomer, ...editFormData });
      setEditingTab(null);
      setEditFormData({});
      // Here you would normally save to database
      alert(`${tabName}の情報を更新しました`);
    }
  };

  const handleTabCancel = () => {
    setEditingTab(null);
    setEditFormData({});
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Menu */}
      <div className="w-64 bg-gray-200 border-r border-gray-300 fixed top-0 left-0 h-screen overflow-y-auto z-10">
        <div className="p-4 pb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {currentView === 'collective-burial' ? '合祀管理メニュー' :
              currentView === 'plot-availability' ? '区画残数管理メニュー' : '台帳管理メニュー'}
          </h2>

          {/* メインメニューに戻るボタン */}
          {onNavigateToMenu && (
            <div className="mb-3">
              <Button
                onClick={onNavigateToMenu}
                className="w-full btn-senior"
                variant="outline"
                size="lg"
              >
                ← メインメニューに戻る
              </Button>
            </div>
          )}

          {/* 台帳一覧に戻るボタン（詳細画面の時のみ表示） */}
          {/* Customer Context Menu (Visible when a customer is selected and in relevant views) */}
          {(currentView === 'details' || currentView === 'document-select' || currentView === 'document-history') && selectedCustomer ? (
            <div className="space-y-1 mb-4">
              <Button
                onClick={handleBackToRegistry}
                className="w-full btn-senior mb-4"
                variant="default"
                size="lg"
              >
                台帳一覧に戻る
              </Button>

              <div className="border-t border-gray-300 my-4"></div>

              <Button
                onClick={() => setCurrentView('details')}
                className={`w-full btn-senior mt-2 border-none ${currentView === 'details' ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'}`}
                variant={currentView === 'details' ? 'default' : 'outline'}
                size="lg"
              >
                顧客詳細
              </Button>
              <Button
                onClick={() => setCurrentView('document-select')}
                className={`w-full btn-senior mt-2 border-none ${currentView === 'document-select' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-green-600 hover:bg-green-50 border-green-600'}`}
                variant={currentView === 'document-select' ? 'default' : 'outline'}
                size="lg"
              >
                書類作成
              </Button>
              <Button
                onClick={() => setCurrentView('document-history')}
                className={`w-full btn-senior mt-2 border-none ${currentView === 'document-history' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-600'}`}
                variant={currentView === 'document-history' ? 'default' : 'outline'}
                size="lg"
              >
                書類履歴
              </Button>

              <div className="border-t border-gray-300 my-4"></div>

              <Button
                onClick={handleOpenTerminationDialog}
                className={`w-full btn-senior mt-2 border-none ${selectedCustomer.status === 'inactive' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-white text-red-600 hover:bg-red-50 border-red-600'}`}
                variant="outline"
                size="lg"
                disabled={selectedCustomer.status === 'inactive'}
              >
                {selectedCustomer.status === 'inactive' ? '解約済み' : '解約入力'}
              </Button>
            </div>
          ) : (
            <div className="space-y-1 mb-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item === '台帳問い合わせ') {
                      setCurrentView('registry');
                      setSelectedCustomer(null);
                    } else if (item === '台帳編集') {
                      if (selectedCustomer) {
                        setCurrentView('edit');
                      } else {
                        alert('編集する顧客を選択してください');
                      }
                    } else if (item === '新規登録') {
                      handleNewCustomer();
                    } else if (item === '合祀管理') {
                      setCurrentView('collective-burial');
                      setSelectedCustomer(null);
                    } else if (item === '区画残数管理') {
                      setCurrentView('plot-availability');
                      setSelectedCustomer(null);
                    } else if (item === '契約訂正') {
                      if (selectedCustomer) {
                        setCurrentView('edit');
                      } else {
                        alert('編集する顧客を選択してください');
                      }
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-senior-sm rounded border border-gray-400 bg-gray-100 hover:bg-blue-100 hover:border-blue-300 transition-colors btn-senior ${(item === '台帳問い合わせ' && (currentView === 'registry' || currentView === 'search')) ||
                    (item === '台帳編集' && currentView === 'edit') ||
                    (item === '契約訂正' && currentView === 'edit') ||
                    (item === '合祀管理' && currentView === 'collective-burial') ||
                    (item === '区画残数管理' && currentView === 'plot-availability') ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
          <div className="flex-1 overflow-auto">
            <CollectiveBurialList />
          </div>
        ) : currentView === 'plot-availability' ? (
          <div className="flex-1 overflow-auto">
            <PlotAvailabilityManagement />
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

            {/* Customer Details Tabs Interface */}
            <div className="flex-1 p-6">
              <Tabs defaultValue="basic-info-1" className="w-full">
                <TabsList className="grid w-full grid-cols-6 h-auto">
                  <TabsTrigger value="basic-info-1" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報①</TabsTrigger>
                  <TabsTrigger value="basic-info-2" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報②</TabsTrigger>
                  <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">連絡先/家族</TabsTrigger>
                  <TabsTrigger value="burial-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">埋葬情報</TabsTrigger>
                  <TabsTrigger value="construction-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">工事情報</TabsTrigger>
                  <TabsTrigger value="history" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">履歴情報</TabsTrigger>
                </TabsList>

                <TabsContent value="basic-info-1" className="mt-6">
                  <div className="space-y-6 overflow-y-auto pr-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">基本情報①</h3>
                      {editingTab === 'basic-info-1' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('基本情報①')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('basic-info-1')}>編集</Button>
                      )}
                    </div>

                    {/* 顧客基本情報 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">顧客基本情報</h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">墓石コード *</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.customerCode || selectedCustomer.customerCode) : selectedCustomer.customerCode}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: A-56"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, customerCode: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">許可番号</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.plotNumber || selectedCustomer.plotNumber || '') : selectedCustomer.plotNumber || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: A-56"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, plotNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">区域</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.section || selectedCustomer.section || '') : selectedCustomer.section || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="東区、西区など"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, section: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 所有区画情報（複数区画対応） */}
                    {selectedCustomer.ownedPlots && selectedCustomer.ownedPlots.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">所有区画情報</h4>

                        {/* 合計情報 */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-green-700">合計面積</Label>
                              <div className="text-lg font-bold text-green-800">
                                {calculateOwnedPlotsInfo(selectedCustomer.ownedPlots).totalAreaSqm}㎡
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-green-700">区画数</Label>
                              <div className="text-lg font-bold text-green-800">
                                {calculateOwnedPlotsInfo(selectedCustomer.ownedPlots).plotCount}区画
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-green-700">区画番号</Label>
                              <div className="text-lg font-bold text-green-800">
                                {calculateOwnedPlotsInfo(selectedCustomer.ownedPlots).plotNumbers.join('／')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 個別区画一覧 */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">区画詳細</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium">区画番号</th>
                                  <th className="px-4 py-2 text-left font-medium">期</th>
                                  <th className="px-4 py-2 text-left font-medium">区画詳細</th>
                                  <th className="px-4 py-2 text-left font-medium">サイズ</th>
                                  <th className="px-4 py-2 text-left font-medium">面積</th>
                                  <th className="px-4 py-2 text-left font-medium">利用状況</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedCustomer.ownedPlots.map((plot, index) => (
                                  <tr key={plot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-medium">{plot.plotNumber}</td>
                                    <td className="px-4 py-2">{plot.plotPeriod || '-'}</td>
                                    <td className="px-4 py-2">{plot.section || '-'}</td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-1 rounded text-xs ${plot.sizeType === 'full'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {PLOT_SIZE_LABELS[plot.sizeType]}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">{plot.areaSqm}㎡</td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-1 rounded text-xs ${plot.status === 'in_use'
                                        ? 'bg-green-100 text-green-800'
                                        : plot.status === 'reserved'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {plot.status === 'in_use' ? '利用中' :
                                          plot.status === 'reserved' ? '予約済み' : '空き'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 申込者情報 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">申込者情報</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">申込日</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.applicationDate ? formatDateWithEra(selectedCustomer.applicantInfo.applicationDate) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">担当者氏名</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.staffName || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">氏名</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.name || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">振り仮名</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.nameKana || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="ひらがなで入力"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">郵便番号</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.postalCode || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 123-4567"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">電話番号</Label>
                          <Input
                            value={selectedCustomer.applicantInfo?.phoneNumber || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 090-1234-5678"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">住所</Label>
                        <Input
                          value={selectedCustomer.applicantInfo?.address || ''}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                        />
                      </div>
                    </div>

                    {/* 契約者情報 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">契約者情報</h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">予約日</Label>
                          <Input
                            value={selectedCustomer.reservationDate ? formatDateWithEra(selectedCustomer.reservationDate) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">承諾書番号</Label>
                          <Input
                            value={selectedCustomer.acceptanceNumber || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">許可日</Label>
                          <Input
                            value={selectedCustomer.permitDate ? formatDateWithEra(selectedCustomer.permitDate) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">開始年月日</Label>
                        <Input
                          value={selectedCustomer.startDate ? formatDateWithEra(selectedCustomer.startDate) : ''}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                          placeholder="年/月/日"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">氏名 *</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.name || selectedCustomer.name) : selectedCustomer.name}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">振り仮名 *</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.nameKana || selectedCustomer.nameKana) : selectedCustomer.nameKana}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="ひらがなで入力"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, nameKana: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">生年月日</Label>
                          <Input
                            value={selectedCustomer.birthDate ? formatDateWithEra(selectedCustomer.birthDate) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">性別 *</Label>
                          <Input
                            value={selectedCustomer.gender === 'male' ? '男性' : selectedCustomer.gender === 'female' ? '女性' : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">電話番号 *</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.phoneNumber || selectedCustomer.phoneNumber) : selectedCustomer.phoneNumber}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 090-1234-5678"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">ファックス</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.faxNumber || selectedCustomer.faxNumber || '') : selectedCustomer.faxNumber || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 03-1234-5678"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, faxNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">メール</Label>
                        <Input
                          value={editingTab === 'basic-info-1' ? (editFormData.email || selectedCustomer.email || '') : selectedCustomer.email || ''}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                          placeholder="例: example@email.com"
                          onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">住所 *</Label>
                        <Input
                          value={editingTab === 'basic-info-1' ? (editFormData.address || selectedCustomer.address) : selectedCustomer.address}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                          onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, address: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">本籍地住所</Label>
                        <Input
                          value={editingTab === 'basic-info-1' ? (editFormData.registeredAddress || selectedCustomer.registeredAddress || '') : selectedCustomer.registeredAddress || ''}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                          onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, registeredAddress: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* 使用料 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">使用料</h4>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">計算区分</Label>
                          <Input
                            value={selectedCustomer.usageFee?.calculationType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">税区分</Label>
                          <Input
                            value={selectedCustomer.usageFee?.taxType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">請求区分</Label>
                          <Input
                            value={selectedCustomer.usageFee?.billingType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">請求年数</Label>
                          <Input
                            value={selectedCustomer.usageFee?.billingYears?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">面積</Label>
                          <Input
                            value={selectedCustomer.usageFee?.area || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 10㎡"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">単価</Label>
                          <Input
                            value={selectedCustomer.usageFee?.unitPrice?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 10000"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">使用料</Label>
                          <Input
                            value={selectedCustomer.usageFee?.usageFee?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 200000"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">支払い方法</Label>
                          <Input
                            value={selectedCustomer.usageFee?.paymentMethod || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 管理料 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">管理料</h4>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">計算区分</Label>
                          <Input
                            value={selectedCustomer.managementFee?.calculationType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">税区分</Label>
                          <Input
                            value={selectedCustomer.managementFee?.taxType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">請求区分</Label>
                          <Input
                            value={selectedCustomer.managementFee?.billingType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">請求年数</Label>
                          <Input
                            value={selectedCustomer.managementFee?.billingYears?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <Label className="text-sm font-medium">面積</Label>
                          <Input
                            value={selectedCustomer.managementFee?.area || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 10㎡"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">請求月</Label>
                          <Input
                            value={selectedCustomer.managementFee?.billingMonth?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="1-12"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">管理料</Label>
                          <Input
                            value={selectedCustomer.managementFee?.managementFee?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 5000"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">単価</Label>
                          <Input
                            value={selectedCustomer.managementFee?.unitPrice?.toString() || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: 500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">最終請求月</Label>
                          <Input
                            value={selectedCustomer.managementFee?.lastBillingMonth || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="----年--月"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">支払方法</Label>
                        <Input
                          value={selectedCustomer.managementFee?.paymentMethod || ''}
                          className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                          readOnly={editingTab !== 'basic-info-1'}
                        />
                      </div>
                    </div>

                    {/* 墓石 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold border-b pb-2">墓石</h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">墓石台</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.gravestoneBase || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">包囲位置</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.enclosurePosition || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">墓石取扱い</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.gravestoneDealer || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">墓石タイプ</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.gravestoneType || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">周辺設備</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.surroundingArea || ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">設立期限</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.establishmentDeadline ? formatDateWithEra(selectedCustomer.gravestoneInfo.establishmentDeadline) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">設立日</Label>
                          <Input
                            value={selectedCustomer.gravestoneInfo?.establishmentDate ? formatDateWithEra(selectedCustomer.gravestoneInfo.establishmentDate) : ''}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="年/月/日"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="basic-info-2" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">基本情報②</h3>
                      {editingTab === 'basic-info-2' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('基本情報②')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('basic-info-2')}>編集</Button>
                      )}
                    </div>

                    <div className="space-y-8">
                      {/* 勤務先情報 */}
                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">勤務先情報</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">勤務先名称</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.workInfo?.companyName || selectedCustomer.workInfo?.companyName || '') : selectedCustomer.workInfo?.companyName || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="株式会社○○"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, workInfo: { ...(editFormData.workInfo || selectedCustomer.workInfo || {}), companyName: e.target.value } as any })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">勤務先仮名</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.workplaceKana || selectedCustomer.workInfo?.companyNameKana || '') : selectedCustomer.workInfo?.companyNameKana || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="かぶしきがいしゃまるまる"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, workplaceKana: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">郵便番号</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.workplaceZipCode || selectedCustomer.workInfo?.zipCode || '') : selectedCustomer.workInfo?.zipCode || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="123-4567"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, workplaceZipCode: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">電話番号</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.workplacePhone || selectedCustomer.workInfo?.phone || '') : selectedCustomer.workInfo?.phone || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="03-1234-5678"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, workplacePhone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">就職先住所</Label>
                          <Input
                            value={editingTab === 'basic-info-2' ? (editFormData.workplaceAddress || selectedCustomer.workInfo?.address || '') : selectedCustomer.workInfo?.address || ''}
                            className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-2'}
                            placeholder="東京都○○区○○町1-2-3"
                            onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, workplaceAddress: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* DM・宛先情報 */}
                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">DM・宛先情報</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">DM設定</Label>
                            {editingTab === 'basic-info-2' ? (
                              <select
                                className="w-full p-2 border rounded bg-white"
                                value={editFormData.dmSetting || selectedCustomer.dmInfo?.setting || '送付する'}
                                onChange={(e) => setEditFormData({ ...editFormData, dmSetting: e.target.value })}
                              >
                                <option value="送付する">送付する</option>
                                <option value="送付しない">送付しない</option>
                              </select>
                            ) : (
                              <Input
                                value={selectedCustomer.dmInfo?.setting || '送付する'}
                                className="bg-yellow-50"
                                readOnly
                              />
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">宛先区分</Label>
                            {editingTab === 'basic-info-2' ? (
                              <select
                                className="w-full p-2 border rounded bg-white"
                                value={editFormData.addressType || selectedCustomer.dmInfo?.addressType || '自宅'}
                                onChange={(e) => setEditFormData({ ...editFormData, addressType: e.target.value })}
                              >
                                <option value="自宅">自宅</option>
                                <option value="勤務先">勤務先</option>
                                <option value="その他">その他</option>
                              </select>
                            ) : (
                              <Input
                                value={selectedCustomer.dmInfo?.addressType || '自宅'}
                                className="bg-yellow-50"
                                readOnly
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">備考</Label>
                          <textarea
                            className={`w-full p-2 border rounded resize-none h-20 ${editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}`}
                            value={editingTab === 'basic-info-2' ? (editFormData.dmNotes || selectedCustomer.dmInfo?.notes || '') : selectedCustomer.dmInfo?.notes || ''}
                            readOnly={editingTab !== 'basic-info-2'}
                            placeholder="特記事項がある場合は入力してください"
                            onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, dmNotes: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* 請求情報 */}
                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">請求情報</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">請求種別</Label>
                            {editingTab === 'basic-info-2' ? (
                              <select
                                className="w-full p-2 border rounded bg-white"
                                value={editFormData.billingType || selectedCustomer.billingInfo?.type || '口座振替'}
                                onChange={(e) => setEditFormData({ ...editFormData, billingType: e.target.value })}
                              >
                                <option value="口座振替">口座振替</option>
                                <option value="銀行振込">銀行振込</option>
                                <option value="現金払い">現金払い</option>
                                <option value="クレジットカード">クレジットカード</option>
                              </select>
                            ) : (
                              <Input
                                value={selectedCustomer.billingInfo?.type || '口座振替'}
                                className="bg-yellow-50"
                                readOnly
                              />
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">機関名称</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.institutionName || selectedCustomer.billingInfo?.institutionName || selectedCustomer.billingInfo?.bankName || '') : selectedCustomer.billingInfo?.institutionName || selectedCustomer.billingInfo?.bankName || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="○○銀行 / ゆうちょ銀行"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, institutionName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">支店名称</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.branchName || selectedCustomer.billingInfo?.branchName || '') : selectedCustomer.billingInfo?.branchName || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="△△支店"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, branchName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">口座科目</Label>
                            {editingTab === 'basic-info-2' ? (
                              <select
                                className="w-full p-2 border rounded bg-white"
                                value={editFormData.accountType || selectedCustomer.billingInfo?.accountType || '普通'}
                                onChange={(e) => setEditFormData({ ...editFormData, accountType: e.target.value })}
                              >
                                <option value="普通">普通</option>
                                <option value="当座">当座</option>
                                <option value="貯蓄">貯蓄</option>
                              </select>
                            ) : (
                              <Input
                                value={selectedCustomer.billingInfo?.accountType || '普通'}
                                className="bg-yellow-50"
                                readOnly
                              />
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">記号番号</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingTab === 'basic-info-2' ? (editFormData.symbolNumber || selectedCustomer.billingInfo?.symbolNumber || '') : selectedCustomer.billingInfo?.symbolNumber || ''}
                                className={`w-24 ${editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}`}
                                readOnly={editingTab !== 'basic-info-2'}
                                placeholder="記号"
                                onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, symbolNumber: e.target.value })}
                              />
                              <span className="text-gray-500">-</span>
                              <Input
                                value={editingTab === 'basic-info-2' ? (editFormData.accountNumber || selectedCustomer.billingInfo?.accountNumber || '') : selectedCustomer.billingInfo?.accountNumber || ''}
                                className={`flex-1 ${editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}`}
                                readOnly={editingTab !== 'basic-info-2'}
                                placeholder="番号"
                                onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">口座名義</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.accountHolder || selectedCustomer.billingInfo?.accountHolder || '') : selectedCustomer.billingInfo?.accountHolder || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="口座名義人"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, accountHolder: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">連絡先/家族情報</h3>
                      {editingTab === 'contacts' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('連絡先/家族情報')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('contacts')}>編集</Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 緊急連絡先 */}
                      <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">緊急連絡先</h4>
                        {selectedCustomer.emergencyContact ? (
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">氏名</Label>
                              <Input
                                value={editingTab === 'contacts' ? (editFormData.emergencyContact?.name || selectedCustomer.emergencyContact.name) : selectedCustomer.emergencyContact.name}
                                className={editingTab === 'contacts' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'contacts'}
                                onChange={(e) => editingTab === 'contacts' && setEditFormData({
                                  ...editFormData,
                                  emergencyContact: { ...(editFormData.emergencyContact || {}), name: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">続柄</Label>
                              <Input
                                value={editingTab === 'contacts' ? (editFormData.emergencyContact?.relationship || selectedCustomer.emergencyContact.relationship) : selectedCustomer.emergencyContact.relationship}
                                className={editingTab === 'contacts' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'contacts'}
                                onChange={(e) => editingTab === 'contacts' && setEditFormData({
                                  ...editFormData,
                                  emergencyContact: { ...(editFormData.emergencyContact || {}), relationship: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">電話番号</Label>
                              <Input
                                value={editingTab === 'contacts' ? (editFormData.emergencyContact?.phoneNumber || selectedCustomer.emergencyContact.phoneNumber) : selectedCustomer.emergencyContact.phoneNumber}
                                className={editingTab === 'contacts' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'contacts'}
                                onChange={(e) => editingTab === 'contacts' && setEditFormData({
                                  ...editFormData,
                                  emergencyContact: { ...(editFormData.emergencyContact || {}), phoneNumber: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">緊急連絡先が登録されていません</p>
                        )}
                      </div>

                      {/* 家族・連絡先一覧 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">家族・連絡先一覧</h4>
                          <Button size="sm" variant="outline">+ 家族追加</Button>
                        </div>

                        {selectedCustomer.familyContacts && selectedCustomer.familyContacts.length > 0 ? (
                          <div className="space-y-4">
                            {selectedCustomer.familyContacts.map((contact) => (
                              <div key={contact.id} className="bg-white p-4 rounded border">
                                <div className="grid grid-cols-1 gap-4">
                                  {/* 基本情報行 */}
                                  <div className="grid grid-cols-6 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">氏名</Label>
                                      <Input
                                        value={contact.name}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ふりがな</Label>
                                      <Input
                                        value={contact.nameKana || ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">続柄</Label>
                                      <Input
                                        value={contact.relationship}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">性別</Label>
                                      <Input
                                        value={contact.gender === 'male' ? '男性' : contact.gender === 'female' ? '女性' : ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">生年月日</Label>
                                      <Input
                                        value={contact.birthDate ? formatDateWithEra(contact.birthDate) : ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">送付先区分</Label>
                                      <Input
                                        value={contact.mailingType === 'home' ? '自宅' : contact.mailingType === 'work' ? '勤務先' : 'その他'}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                  </div>

                                  {/* 連絡先情報行 */}
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">電話番号</Label>
                                      <Input
                                        value={contact.phoneNumber}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ファックス</Label>
                                      <Input
                                        value={contact.faxNumber || ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">イーメール</Label>
                                      <Input
                                        value={contact.email || ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                  </div>

                                  {/* 住所情報行 */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">住所</Label>
                                      <Input
                                        value={contact.address}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">本籍住所</Label>
                                      <Input
                                        value={contact.registeredAddress || ''}
                                        className="bg-yellow-50"
                                        readOnly
                                      />
                                    </div>
                                  </div>

                                  {/* 勤務先情報行 */}
                                  {(contact.companyName || contact.companyNameKana || contact.companyAddress || contact.companyPhone) && (
                                    <div className="border-t pt-3">
                                      <h5 className="text-sm font-medium mb-2 text-gray-700">勤務先情報</h5>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">勤務先名称</Label>
                                            <Input
                                              value={contact.companyName || ''}
                                              className="bg-gray-50 text-sm"
                                              readOnly
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">勤務先かな</Label>
                                            <Input
                                              value={contact.companyNameKana || ''}
                                              className="bg-gray-50 text-sm"
                                              readOnly
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">勤務先住所</Label>
                                            <Input
                                              value={contact.companyAddress || ''}
                                              className="bg-gray-50 text-sm"
                                              readOnly
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">勤務先電話番号</Label>
                                            <Input
                                              value={contact.companyPhone || ''}
                                              className="bg-gray-50 text-sm"
                                              readOnly
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 備考 */}
                                  {contact.notes && (
                                    <div>
                                      <Label className="text-sm font-medium">備考</Label>
                                      <textarea
                                        value={contact.notes}
                                        className="w-full p-2 bg-yellow-50 border rounded text-sm resize-none h-16"
                                        readOnly
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">家族・連絡先情報が登録されていません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="burial-info" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">埋葬情報</h3>
                      {editingTab === 'burial-info' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('埋葬情報')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('burial-info')}>編集</Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 埋葬者一覧 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">埋葬者一覧</h4>
                          <Button size="sm" variant="outline">+ 埋葬者追加</Button>
                        </div>

                        {selectedCustomer.buriedPersons && selectedCustomer.buriedPersons.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.buriedPersons.map((person) => (
                              <div key={person.id} className="bg-white p-4 rounded border">
                                {/* 基本情報行 */}
                                <div className="grid grid-cols-6 gap-4 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium">氏名</Label>
                                    <Input
                                      value={person.name}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">ふりがな</Label>
                                    <Input
                                      value={person.nameKana || ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">続柄</Label>
                                    <Input
                                      value={person.relationship || ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">性別</Label>
                                    <Input
                                      value={person.gender === 'male' ? '男性' : person.gender === 'female' ? '女性' : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">生年月日</Label>
                                    <Input
                                      value={person.birthDate ? formatDateWithEra(person.birthDate) : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">宗派</Label>
                                    <Input
                                      value={person.religion || ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                </div>

                                {/* 死亡・埋葬情報行 */}
                                <div className="grid grid-cols-5 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">命日</Label>
                                    <Input
                                      value={person.deathDate ? formatDateWithEra(person.deathDate) : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">享年</Label>
                                    <Input
                                      value={person.age ? `${person.age}歳` : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">届出日</Label>
                                    <Input
                                      value={person.reportDate ? formatDateWithEra(person.reportDate) : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">埋葬日</Label>
                                    <Input
                                      value={person.burialDate ? formatDateWithEra(person.burialDate) : ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">戒名</Label>
                                    <Input
                                      value={person.posthumousName || ''}
                                      className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'burial-info'}
                                    />
                                  </div>
                                </div>

                                {/* 備考行 */}
                                {person.memo && (
                                  <div className="mt-3">
                                    <Label className="text-sm font-medium">備考</Label>
                                    <textarea
                                      value={person.memo}
                                      className="w-full p-2 bg-yellow-50 border rounded text-sm resize-none h-12"
                                      readOnly
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">埋葬者情報が登録されていません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="construction-info" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">工事情報</h3>
                      <Button
                        size="sm"
                        onClick={() => setCurrentView('edit')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        編集
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 工事記録一覧 */}
                      <div className="bg-orange-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">工事記録一覧</h4>
                        </div>

                        {selectedCustomer.constructionRecords && selectedCustomer.constructionRecords.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.constructionRecords.map((record) => (
                              <div key={record.id} className="bg-white p-4 rounded border">
                                {/* 基本情報行 */}
                                <div className="grid grid-cols-5 gap-4 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium">業者名</Label>
                                    <Input
                                      value={record.contractorName}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">工事種別</Label>
                                    <Input
                                      value={CONSTRUCTION_TYPE_LABELS[record.constructionType as ConstructionType] || record.constructionType}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">工事開始日</Label>
                                    <Input
                                      value={record.startDate ? formatDateWithEra(record.startDate) : ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">終了予定日</Label>
                                    <Input
                                      value={record.scheduledEndDate ? formatDateWithEra(record.scheduledEndDate) : ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">工事終了日</Label>
                                    <Input
                                      value={record.endDate ? formatDateWithEra(record.endDate) : ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                </div>

                                {/* 工事内容 */}
                                <div className="mb-3">
                                  <Label className="text-sm font-medium">工事内容</Label>
                                  <textarea
                                    value={record.description}
                                    className="w-full p-2 bg-yellow-50 border rounded text-sm resize-none h-16"
                                    readOnly
                                  />
                                </div>

                                {/* 金額情報行 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">施工金額</Label>
                                    <Input
                                      value={record.constructionAmount ? `${record.constructionAmount.toLocaleString()}円` : ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">入金金額</Label>
                                    <Input
                                      value={record.paidAmount ? `${record.paidAmount.toLocaleString()}円` : ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">備考</Label>
                                    <Input
                                      value={record.notes || ''}
                                      className="bg-yellow-50"
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">工事記録が登録されていません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">履歴情報</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 最近の対応履歴 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">対応履歴（{historyEntries.length}件）</h4>
                          <Button size="sm" variant="outline" onClick={handleOpenHistoryDialog}>+ 履歴追加</Button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {historyEntries.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">対応履歴がありません</p>
                          ) : (
                            historyEntries.map((entry) => (
                              <div key={entry.id} className="grid grid-cols-1 gap-4 bg-white p-4 rounded border">
                                <div className="flex justify-between items-start">
                                  <div className="grid grid-cols-4 gap-4 flex-1">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">日時</Label>
                                      <p className="text-sm">{entry.date}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">担当者</Label>
                                      <p className="text-sm">{entry.staff}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">対応種別</Label>
                                      <p className="text-sm">{entry.type}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">重要度</Label>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${entry.priority === '緊急' ? 'bg-red-100 text-red-800' :
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
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                                    onClick={() => handleDeleteHistory(entry.id)}
                                  >
                                    削除
                                  </Button>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">対応内容</Label>
                                  <p className="text-sm bg-gray-50 p-2 rounded mt-1">{entry.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 支払履歴 */}
                      <div className="bg-green-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">支払履歴</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-5 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">支払日</Label>
                              <Input value={selectedCustomer.paymentHistory?.[0]?.date ? formatDateWithEra(selectedCustomer.paymentHistory[0].date) : ''} className="bg-yellow-50" readOnly />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">項目</Label>
                              <Input value={selectedCustomer.paymentHistory?.[0]?.item || ''} className="bg-yellow-50" readOnly />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input value={selectedCustomer.paymentHistory?.[0]?.amount ? `¥${selectedCustomer.paymentHistory[0].amount.toLocaleString()}` : ''} className="bg-yellow-50" readOnly />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">支払方法</Label>
                              <Input value={selectedCustomer.paymentHistory?.[0]?.method || ''} className="bg-yellow-50" readOnly />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryStatus1 || '入金確認済') : '入金確認済'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryStatus1: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">支払日</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryDate2 || '2023年11月30日') : '2023年11月30日'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryDate2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">項目</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryItem2 || '') : ''}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryItem2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryAmount2 || (selectedCustomer.paymentHistory?.[1]?.amount ? `¥${selectedCustomer.paymentHistory[1].amount.toLocaleString()}` : '')) : (selectedCustomer.paymentHistory?.[1]?.amount ? `¥${selectedCustomer.paymentHistory[1].amount.toLocaleString()}` : '')}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryAmount2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">支払方法</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryMethod2 || '現金') : '現金'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryMethod2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.paymentHistoryStatus2 || '入金確認済') : '入金確認済'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, paymentHistoryStatus2: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 書類発行履歴 */}
                      <div className="bg-yellow-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">書類発行履歴</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">発行日</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentDate1 || '2023年12月1日') : '2023年12月1日'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentDate1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">書類種別</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentType1 || '契約書') : '契約書'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentType1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">発行者</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentIssuer1 || '田中 係長') : '田中 係長'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentIssuer1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">備考</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentNote1 || '郵送にて送付') : '郵送にて送付'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentNote1: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">発行日</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentDate2 || '2023年11月30日') : '2023年11月30日'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentDate2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">書類種別</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentType2 || '領収書') : '領収書'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentType2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">発行者</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentIssuer2 || '鈴木 主任') : '鈴木 主任'}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentIssuer2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">備考</Label>
                              <Input
                                value={editingTab === 'history' ? (editFormData.documentNote2 || '') : ''}
                                className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, documentNote2: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 重要な連絡事項 */}
                      <div className="bg-red-50 p-4 rounded border border-red-200">
                        <div className="flex justify-between items-center border-b border-red-200 pb-2 mb-3">
                          <h4 className="font-semibold text-red-700">重要な連絡事項・注意事項（{importantNotes.length}件）</h4>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={handleOpenNoteDialog}>+ 追加</Button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {importantNotes.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">登録された連絡事項・注意事項はありません</p>
                          ) : (
                            importantNotes.map((note) => (
                              <div key={note.id} className="bg-white p-3 rounded border border-red-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">{note.date}</span>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${note.priority === '要注意' ? 'bg-red-100 text-red-800' :
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

                      {/* 更新履歴（契約者情報スナップショット） */}
                      <div className="bg-purple-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">更新履歴（{selectedCustomer.historyRecords?.length || 0}件）</h4>
                        </div>

                        {selectedCustomer.historyRecords && selectedCustomer.historyRecords.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedCustomer.historyRecords.map((record) => (
                              <div key={record.id} className="bg-white p-4 rounded border">
                                {/* 履歴ヘッダー */}
                                <div className="grid grid-cols-4 gap-4 mb-3 pb-3 border-b">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">更新日時</Label>
                                    <p className="text-sm">{record.updatedAt ? formatDateWithEra(record.updatedAt) : ''}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">更新者</Label>
                                    <p className="text-sm">{record.updatedBy}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">更新事由</Label>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${record.reasonType === 'termination' ? 'bg-red-100 text-red-800' :
                                      record.reasonType === 'new_registration' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                      {HISTORY_REASON_LABELS[record.reasonType as HistoryReasonType] || record.reasonType}
                                    </span>
                                  </div>
                                  {record.reasonDetail && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">詳細</Label>
                                      <p className="text-sm">{record.reasonDetail}</p>
                                    </div>
                                  )}
                                </div>

                                {/* 契約者スナップショット */}
                                {record.contractorSnapshot && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">更新時点の契約者情報</Label>
                                    <div className="grid grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded">
                                      <div>
                                        <span className="text-gray-500">氏名:</span>
                                        <span className="ml-1">{record.contractorSnapshot.name}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">かな:</span>
                                        <span className="ml-1">{record.contractorSnapshot.nameKana}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">電話:</span>
                                        <span className="ml-1">{record.contractorSnapshot.phoneNumber}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">性別:</span>
                                        <span className="ml-1">{record.contractorSnapshot.gender === 'male' ? '男性' : record.contractorSnapshot.gender === 'female' ? '女性' : ''}</span>
                                      </div>
                                      <div className="col-span-4">
                                        <span className="text-gray-500">住所:</span>
                                        <span className="ml-1">{record.contractorSnapshot.address}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">更新履歴はありません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {currentView === 'document-history' && selectedCustomer && (
          <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">書類履歴一覧</h2>
                <Button
                  onClick={() => setCurrentView('document-select')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + 新規書類作成
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {!selectedCustomer.documents || selectedCustomer.documents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">書類履歴はありません</p>
                    <p className="text-sm">「新規書類作成」ボタンから書類を作成してください</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">作成日時</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">種類</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">ファイル名</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">ステータス</th>
                          <th className="py-3 px-4 text-center font-semibold text-gray-700">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-800">
                              {formatDateWithEra(new Date(doc.createdAt))}
                            </td>
                            <td className="py-3 px-4 text-gray-800">
                              {doc.type === 'invoice' ? '請求書' : doc.type === 'postcard' ? 'はがき' : 'その他'}
                            </td>
                            <td className="py-3 px-4 text-gray-800">{doc.name}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {doc.status === 'sent' ? '発送済み' : '未発送'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {doc.status === 'generated' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Mock send
                                    doc.status = 'sent';
                                    alert('ステータスを発送済みに変更しました');
                                    setSelectedCustomer({ ...selectedCustomer });
                                  }}
                                >
                                  発送済みにする
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'document-select' && selectedCustomer && (
          <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">書類作成テンプレート選択</h2>
              <p className="text-gray-600 mb-8">作成したい書類のテンプレートを選択してください。クリックするとプレビュー・編集画面が開き、その場で編集・印刷ができます。</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 請求書テンプレート */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
                  onClick={() => setShowInvoiceEditor(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-1 rounded">編集可</span>
                      <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">印刷</span>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">請求書</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    標準的な請求書フォーマットです。プレビュー画面で内容を編集し、そのまま印刷またはExcel出力ができます。
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    🖨️ 作成・編集・印刷
                  </Button>
                </div>

                {/* はがきテンプレート */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group"
                  onClick={() => setShowPostcardEditor(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-1 rounded">編集可</span>
                      <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">印刷</span>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">はがき（合祀案内など）</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    官製はがきサイズのレイアウトです。宛名面と文面を編集し、そのまま印刷またはExcel出力ができます。
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    🖨️ 作成・編集・印刷
                  </Button>
                </div>

                {/* 今後の拡張用プレースホルダー */}
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center opacity-60">
                  <div className="p-3 bg-gray-200 rounded-lg text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">新しいテンプレート</h3>
                  <p className="text-gray-400 text-sm">
                    今後追加される書類はこちらに表示されます
                  </p>
                </div>
              </div>
            </div>
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
      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">{editingNoteId ? '連絡事項を編集' : '重要な連絡事項・注意事項を追加'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">登録日</Label>
                  <Input
                    value={newNote.date}
                    onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                    placeholder="2024年1月15日"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">重要度</Label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as '要注意' | '注意' | '参考' })}
                    className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                  >
                    <option value="要注意">要注意</option>
                    <option value="注意">注意</option>
                    <option value="参考">参考</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">内容 <span className="text-red-500">*</span></Label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="重要な連絡事項や注意事項を入力してください..."
                  className="mt-1 w-full border rounded-md px-3 py-2 h-32 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <Button variant="outline" onClick={() => { setShowNoteDialog(false); setEditingNoteId(null); }}>
                キャンセル
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveNote}>
                {editingNoteId ? '更新' : '追加'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 履歴追加ダイアログ */}
      {showHistoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">対応履歴を追加</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">日時 <span className="text-red-500">*</span></Label>
                  <Input
                    value={newHistory.date}
                    onChange={(e) => setNewHistory({ ...newHistory, date: e.target.value })}
                    placeholder="2024年1月15日 14:30"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">担当者 <span className="text-red-500">*</span></Label>
                  <Input
                    value={newHistory.staff}
                    onChange={(e) => setNewHistory({ ...newHistory, staff: e.target.value })}
                    placeholder="山田 太郎"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">対応種別</Label>
                  <select
                    value={newHistory.type}
                    onChange={(e) => setNewHistory({ ...newHistory, type: e.target.value })}
                    className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                  >
                    <option value="電話対応">電話対応</option>
                    <option value="来所相談">来所相談</option>
                    <option value="訪問対応">訪問対応</option>
                    <option value="メール対応">メール対応</option>
                    <option value="書類送付">書類送付</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">重要度</Label>
                  <select
                    value={newHistory.priority}
                    onChange={(e) => setNewHistory({ ...newHistory, priority: e.target.value as '通常' | '重要' | '緊急' })}
                    className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                  >
                    <option value="通常">通常</option>
                    <option value="重要">重要</option>
                    <option value="緊急">緊急</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">対応内容 <span className="text-red-500">*</span></Label>
                <textarea
                  value={newHistory.content}
                  onChange={(e) => setNewHistory({ ...newHistory, content: e.target.value })}
                  placeholder="対応内容を入力してください..."
                  className="mt-1 w-full border rounded-md px-3 py-2 h-32 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                キャンセル
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddHistory}>
                追加
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 解約入力ダイアログ */}
      {showTerminationDialog && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">解約入力</h3>
              <p className="text-sm text-red-100 mt-1">{selectedCustomer.name} 様（{selectedCustomer.customerCode}）</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm font-medium">⚠️ 解約処理を行うと、契約ステータスが「解約済み」に変更されます。この操作は取り消せません。</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">解約日 <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={terminationForm.terminationDate}
                    onChange={(e) => setTerminationForm({ ...terminationForm, terminationDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">担当者 <span className="text-red-500">*</span></Label>
                  <Input
                    value={terminationForm.handledBy}
                    onChange={(e) => setTerminationForm({ ...terminationForm, handledBy: e.target.value })}
                    placeholder="担当者名を入力"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">処理種別 <span className="text-red-500">*</span></Label>
                  <select
                    value={terminationForm.processType}
                    onChange={(e) => setTerminationForm({ ...terminationForm, processType: e.target.value as TerminationProcessType })}
                    className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                  >
                    {Object.entries(TERMINATION_PROCESS_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">返金額</Label>
                  <Input
                    type="number"
                    value={terminationForm.refundAmount}
                    onChange={(e) => setTerminationForm({ ...terminationForm, refundAmount: e.target.value })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">解約理由 <span className="text-red-500">*</span></Label>
                <select
                  value={terminationForm.reason}
                  onChange={(e) => setTerminationForm({ ...terminationForm, reason: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="転居のため">転居のため</option>
                  <option value="他の墓所へ移転">他の墓所へ移転</option>
                  <option value="永代供養へ変更">永代供養へ変更</option>
                  <option value="墓じまい">墓じまい</option>
                  <option value="経済的理由">経済的理由</option>
                  <option value="承継者不在">承継者不在</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">処理詳細</Label>
                <Input
                  value={terminationForm.processDetail}
                  onChange={(e) => setTerminationForm({ ...terminationForm, processDetail: e.target.value })}
                  placeholder="処理の詳細（移転先など）"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">備考</Label>
                <textarea
                  value={terminationForm.notes}
                  onChange={(e) => setTerminationForm({ ...terminationForm, notes: e.target.value })}
                  placeholder="特記事項があれば入力"
                  className="mt-1 w-full border rounded-md px-3 py-2 bg-white resize-none h-20"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowTerminationDialog(false)}>
                キャンセル
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleTerminate}>
                解約処理を実行
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}