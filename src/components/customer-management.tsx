'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateWithEra } from '@/lib/utils';
import { createCustomer, updateCustomer, formDataToCustomer, addCustomerDocument } from '@/lib/data';
import { CustomerFormData } from '@/lib/validations';
import CustomerSearch from '@/components/customer-search';
import CustomerForm from '@/components/customer-form';
import CustomerRegistry from '@/components/customer-registry';
import CemeteryManagementList from '@/components/cemetery-management-list';

import InvoiceTemplate from '@/components/invoice-template';
import PostcardTemplate from '@/components/postcard-template';
import { exportInvoiceToExcel, exportPostcardToExcel } from '@/lib/excel-exporter';

const menuItems = [
  '台帳問い合わせ',
  '台帳編集',
  '新規登録',
  '区画管理',
  '合祀管理',
  '契約訂正'
];

interface CustomerManagementProps {
  onNavigateToMenu?: () => void;
}

export default function CustomerManagement({ onNavigateToMenu }: CustomerManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentView, setCurrentView] = useState<'registry' | 'search' | 'details' | 'register' | 'edit' | 'collective-burial' | 'invoice' | 'document-select' | 'document-history'>('registry');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);

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
            {currentView === 'collective-burial' ? '合祀管理メニュー' : '台帳管理メニュー'}
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
            </div>
          ) : (
            <div className="space-y-1 mb-4">
              {(currentView === 'collective-burial' ? ['合祀管理', '台帳問い合わせ'] : menuItems).map((item, index) => (
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
                    } else if (item === '区画管理') {
                      alert('区画管理機能は準備中です');
                    } else if (item === '合祀管理') {
                      setCurrentView('collective-burial');
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
                    (item === '合祀管理' && currentView === 'collective-burial') ? 'bg-blue-100 border-blue-300' : ''
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
            <CemeteryManagementList />
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
                <TabsList className="grid w-full grid-cols-7 h-auto">
                  <TabsTrigger value="basic-info-1" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報①</TabsTrigger>
                  <TabsTrigger value="basic-info-2" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報②</TabsTrigger>
                  <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">連絡先/家族</TabsTrigger>
                  <TabsTrigger value="burial-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">埋葬情報</TabsTrigger>
                  <TabsTrigger value="collective-burial" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">合祀</TabsTrigger>
                  <TabsTrigger value="construction" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">工事情報</TabsTrigger>
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
                          <Label className="text-sm font-medium">顧客コード *</Label>
                          <Input
                            value={editingTab === 'basic-info-1' ? (editFormData.customerCode || selectedCustomer.customerCode) : selectedCustomer.customerCode}
                            className={editingTab === 'basic-info-1' ? 'bg-white' : 'bg-yellow-50'}
                            readOnly={editingTab !== 'basic-info-1'}
                            placeholder="例: A-56"
                            onChange={(e) => editingTab === 'basic-info-1' && setEditFormData({ ...editFormData, customerCode: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">区画番号</Label>
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
                            <Label className="text-sm font-medium">銀行名称</Label>
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.bankName || selectedCustomer.billingInfo?.bankName || '') : selectedCustomer.billingInfo?.bankName || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="○○銀行"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, bankName: e.target.value })}
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
                            <Input
                              value={editingTab === 'basic-info-2' ? (editFormData.accountNumber || selectedCustomer.billingInfo?.accountNumber || '') : selectedCustomer.billingInfo?.accountNumber || ''}
                              className={editingTab === 'basic-info-2' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'basic-info-2'}
                              placeholder="1234567"
                              onChange={(e) => editingTab === 'basic-info-2' && setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                            />
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
                                  <div className="grid grid-cols-4 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">氏名</Label>
                                      <Input
                                        value={contact.name}
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
                              <div key={person.id} className="grid grid-cols-6 gap-4 bg-white p-3 rounded border">
                                <div>
                                  <Label className="text-sm font-medium">氏名</Label>
                                  <Input
                                    value={person.name}
                                    className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                    readOnly={editingTab !== 'burial-info'}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">氏名カナ</Label>
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
                                  <Label className="text-sm font-medium">死亡日</Label>
                                  <Input
                                    value={person.deathDate ? formatDateWithEra(person.deathDate) : ''}
                                    className={editingTab === 'burial-info' ? 'bg-white' : 'bg-yellow-50'}
                                    readOnly={editingTab !== 'burial-info'}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">年齢</Label>
                                  <Input
                                    value={person.age ? `${person.age}歳` : ''}
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

                <TabsContent value="collective-burial" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">合祀</h3>
                      {editingTab === 'collective-burial' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('合祀')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('collective-burial')}>編集</Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 合祀概要情報 */}
                      <div className="bg-orange-50 p-4 rounded border">
                        <h4 className="font-semibold border-b pb-2 mb-3">合祀概要</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">合祀種別</Label>
                            <Input
                              value={selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ?
                                (selectedCustomer.collectiveBurialInfo[0].type === 'family' ? '家族合祀' :
                                  selectedCustomer.collectiveBurialInfo[0].type === 'relative' ? '親族合祀' : 'その他') : ''
                              }
                              className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'collective-burial'}
                              placeholder="例: 家族合祀"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">主たる代表者</Label>
                            <Input
                              value={selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ?
                                selectedCustomer.collectiveBurialInfo[0].mainRepresentative : ''
                              }
                              className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'collective-burial'}
                              placeholder="例: 長男、配偶者"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">合祀料金総額</Label>
                            <Input
                              value={selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 && selectedCustomer.collectiveBurialInfo[0].totalFee ?
                                `${selectedCustomer.collectiveBurialInfo[0].totalFee.toLocaleString()}円` : ''
                              }
                              className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                              readOnly={editingTab !== 'collective-burial'}
                              placeholder="例: 500000円"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="text-sm font-medium">特別な要望・配慮事項（宗教的配慮含む）</Label>
                          <textarea
                            rows={3}
                            value={selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ?
                              selectedCustomer.collectiveBurialInfo[0].specialRequests || '' : ''
                            }
                            className={`w-full px-3 py-2 border rounded ${editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}`}
                            readOnly={editingTab !== 'collective-burial'}
                            placeholder="宗教的配慮、特別な要望事項などを記載してください"
                          />
                        </div>
                      </div>

                      {/* 合祀対象者一覧 */}
                      <div className="bg-purple-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">合祀対象者一覧</h4>
                          <Button size="sm" variant="outline">+ 対象者追加</Button>
                        </div>

                        {selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.collectiveBurialInfo.map((burialInfo) =>
                              burialInfo.persons.map((person) => (
                                <div key={person.id} className="grid grid-cols-8 gap-2 bg-white p-3 rounded border">
                                  <div>
                                    <Label className="text-sm font-medium">故人氏名</Label>
                                    <Input
                                      value={person.name}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="故人氏名"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">氏名カナ</Label>
                                    <Input
                                      value={person.nameKana}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="ふりがな"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">続柄</Label>
                                    <Input
                                      value={person.relationship}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="続柄"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">死亡日</Label>
                                    <Input
                                      value={person.deathDate ? formatDateWithEra(person.deathDate) : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="令和○年○月○日"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">享年</Label>
                                    <Input
                                      value={person.age ? `${person.age}歳` : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="○○歳"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">元の墓所</Label>
                                    <Input
                                      value={person.originalPlotNumber || ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="区画番号"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">移転日</Label>
                                    <Input
                                      value={person.transferDate ? formatDateWithEra(person.transferDate) : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="令和○年○月○日"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">改葬許可証</Label>
                                    <Input
                                      value={person.certificateNumber || ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="許可証番号"
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">合祀対象者が登録されていません</p>
                        )}
                      </div>

                      {/* 合祀実施記録 */}
                      <div className="bg-green-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">合祀実施記録</h4>
                          <Button size="sm" variant="outline">+ 実施記録追加</Button>
                        </div>

                        {selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.collectiveBurialInfo.map((burialInfo) =>
                              burialInfo.ceremonies.map((ceremony) => (
                                <div key={ceremony.id} className="grid grid-cols-6 gap-4 bg-white p-3 rounded border">
                                  <div>
                                    <Label className="text-sm font-medium">実施日</Label>
                                    <Input
                                      value={ceremony.date ? formatDateWithEra(ceremony.date) : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="令和○年○月○日"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">導師・執行者</Label>
                                    <Input
                                      value={ceremony.officiant}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="僧侶・神職名"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">宗派</Label>
                                    <Input
                                      value={ceremony.religion}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="宗派"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">参列者数</Label>
                                    <Input
                                      value={`${ceremony.participants}名`}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="○名"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">実施場所</Label>
                                    <Input
                                      value={ceremony.location}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="実施場所"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">実施状況</Label>
                                    <Input
                                      value={burialInfo.status === 'completed' ? '完了' : burialInfo.status === 'planned' ? '予定' : '中止'}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="実施状況"
                                    />
                                  </div>
                                  {ceremony.memo && (
                                    <div className="col-span-6">
                                      <Label className="text-sm font-medium">備考</Label>
                                      <Input
                                        value={ceremony.memo}
                                        className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                        readOnly={editingTab !== 'collective-burial'}
                                        placeholder="備考"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">合祀実施記録が登録されていません</p>
                        )}
                      </div>

                      {/* 関連書類管理 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">関連書類管理</h4>
                          <Button size="sm" variant="outline">+ 書類追加</Button>
                        </div>

                        {selectedCustomer.collectiveBurialInfo && selectedCustomer.collectiveBurialInfo.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.collectiveBurialInfo.map((burialInfo) =>
                              burialInfo.documents && burialInfo.documents.map((document) => (
                                <div key={document.id} className="grid grid-cols-5 gap-4 bg-white p-3 rounded border">
                                  <div>
                                    <Label className="text-sm font-medium">書類種別</Label>
                                    <Input
                                      value={
                                        document.type === 'permit' ? '改葬許可証' :
                                          document.type === 'certificate' ? '証明書' :
                                            document.type === 'agreement' ? '同意書' : 'その他'
                                      }
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="書類種別"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">書類名</Label>
                                    <Input
                                      value={document.name}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="書類名"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">発行日</Label>
                                    <Input
                                      value={document.issuedDate ? formatDateWithEra(document.issuedDate) : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="令和○年○月○日"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">有効期限</Label>
                                    <Input
                                      value={document.expiryDate ? formatDateWithEra(document.expiryDate) : ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="令和○年○月○日"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">備考</Label>
                                    <Input
                                      value={document.memo || ''}
                                      className={editingTab === 'collective-burial' ? 'bg-white' : 'bg-yellow-50'}
                                      readOnly={editingTab !== 'collective-burial'}
                                      placeholder="備考"
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">関連書類が登録されていません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="construction" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">工事情報</h3>
                      {editingTab === 'construction' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('工事情報')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('construction')}>編集</Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 工事進捗 */}
                      <div className="bg-green-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">工事進捗状況</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">工事区分</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.constructionType || '新設工事') : '新設工事'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, constructionType: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">着工予定日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.startDate || (selectedCustomer.constructionInfo?.startDate ? formatDateWithEra(selectedCustomer.constructionInfo.startDate) : '')) : (selectedCustomer.constructionInfo?.startDate ? formatDateWithEra(selectedCustomer.constructionInfo.startDate) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, startDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">完工予定日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.completionDate || (selectedCustomer.constructionInfo?.completionDate ? formatDateWithEra(selectedCustomer.constructionInfo.completionDate) : '')) : (selectedCustomer.constructionInfo?.completionDate ? formatDateWithEra(selectedCustomer.constructionInfo.completionDate) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, completionDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">工事業者</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.contractor || '北九石材工業株式会社') : '北九石材工業株式会社'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, contractor: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">工事担当者</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.supervisor || '石田 工太郎') : '石田 工太郎'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, supervisor: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">進捗状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.progress || '基礎工事完了') : '基礎工事完了'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, progress: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 工事詳細 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">工事詳細</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">工事項目</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workItem1 || '基礎工事') : '基礎工事'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workItem1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">実施日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workDate1 || (selectedCustomer.constructionInfo?.workDate1 ? formatDateWithEra(selectedCustomer.constructionInfo.workDate1) : '')) : (selectedCustomer.constructionInfo?.workDate1 ? formatDateWithEra(selectedCustomer.constructionInfo.workDate1) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workDate1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workAmount1 || (selectedCustomer.constructionInfo?.workAmount1 ? `¥${selectedCustomer.constructionInfo.workAmount1.toLocaleString()}` : '')) : (selectedCustomer.constructionInfo?.workAmount1 ? `¥${selectedCustomer.constructionInfo.workAmount1.toLocaleString()}` : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workAmount1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workStatus1 || '完了') : '完了'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workStatus1: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">工事項目</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workItem2 || '墓石設置') : '墓石設置'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workItem2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">予定日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workDate2 || (selectedCustomer.constructionInfo?.workDate2 ? formatDateWithEra(selectedCustomer.constructionInfo.workDate2) : '')) : (selectedCustomer.constructionInfo?.workDate2 ? formatDateWithEra(selectedCustomer.constructionInfo.workDate2) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workDate2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workAmount2 || (selectedCustomer.constructionInfo?.workAmount2 ? `¥${selectedCustomer.constructionInfo.workAmount2.toLocaleString()}` : '')) : (selectedCustomer.constructionInfo?.workAmount2 ? `¥${selectedCustomer.constructionInfo.workAmount2.toLocaleString()}` : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workAmount2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.workStatus2 || '予定') : '予定'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, workStatus2: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="mt-3">+ 工事項目追加</Button>
                      </div>

                      {/* 許可・申請 */}
                      <div className="bg-yellow-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">許可・申請状況</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">工事許可番号</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.permitNumber || '北九-工-2024-0156') : '北九-工-2024-0156'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-white'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, permitNumber: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">申請日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.applicationDate || (selectedCustomer.constructionInfo?.applicationDate ? formatDateWithEra(selectedCustomer.constructionInfo.applicationDate) : '')) : (selectedCustomer.constructionInfo?.applicationDate ? formatDateWithEra(selectedCustomer.constructionInfo.applicationDate) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-white'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, applicationDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">許可日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.permitDate || (selectedCustomer.constructionInfo?.permitDate ? formatDateWithEra(selectedCustomer.constructionInfo.permitDate) : '')) : (selectedCustomer.constructionInfo?.permitDate ? formatDateWithEra(selectedCustomer.constructionInfo.permitDate) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-white'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, permitDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">許可状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.permitStatus || '許可済み') : '許可済み'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, permitStatus: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 支払状況 */}
                      <div className="bg-orange-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">工事代金支払状況</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">支払区分</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentType1 || '着手金') : '着手金'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentType1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentAmount1 || (selectedCustomer.constructionInfo?.paymentAmount1 ? `¥${selectedCustomer.constructionInfo.paymentAmount1.toLocaleString()}` : '')) : (selectedCustomer.constructionInfo?.paymentAmount1 ? `¥${selectedCustomer.constructionInfo.paymentAmount1.toLocaleString()}` : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentAmount1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">支払日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentDate1 || (selectedCustomer.constructionInfo?.paymentDate1 ? formatDateWithEra(selectedCustomer.constructionInfo.paymentDate1) : '')) : (selectedCustomer.constructionInfo?.paymentDate1 ? formatDateWithEra(selectedCustomer.constructionInfo.paymentDate1) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentDate1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentStatus1 || '支払済み') : '支払済み'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-green-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentStatus1: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded border">
                            <div>
                              <Label className="text-sm font-medium">支払区分</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentType2 || '完工時') : '完工時'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentType2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">金額</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentAmount2 || (selectedCustomer.constructionInfo?.paymentAmount2 ? `¥${selectedCustomer.constructionInfo.paymentAmount2.toLocaleString()}` : '')) : (selectedCustomer.constructionInfo?.paymentAmount2 ? `¥${selectedCustomer.constructionInfo.paymentAmount2.toLocaleString()}` : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentAmount2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">支払予定日</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentScheduledDate2 || (selectedCustomer.constructionInfo?.paymentScheduledDate2 ? formatDateWithEra(selectedCustomer.constructionInfo.paymentScheduledDate2) : '')) : (selectedCustomer.constructionInfo?.paymentScheduledDate2 ? formatDateWithEra(selectedCustomer.constructionInfo.paymentScheduledDate2) : '')}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentScheduledDate2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">状況</Label>
                              <Input
                                value={editingTab === 'construction' ? (editFormData.paymentStatus2 || '未払い') : '未払い'}
                                className={editingTab === 'construction' ? 'bg-white' : 'bg-yellow-100'}
                                readOnly={editingTab !== 'construction'}
                                onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, paymentStatus2: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 工事備考 */}
                      <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2">工事備考</h4>
                        <textarea
                          className={`w-full p-3 border rounded resize-none h-24 ${editingTab === 'construction' ? 'bg-white' : 'bg-yellow-50'}`}
                          value={editingTab === 'construction' ? (editFormData.constructionNotes || "墓石は御影石（黒御影）を使用。家紋の彫刻あり。雨天時は作業中止となる場合があります。") : "墓石は御影石（黒御影）を使用。家紋の彫刻あり。雨天時は作業中止となる場合があります。"}
                          readOnly={editingTab !== 'construction'}
                          onChange={(e) => editingTab === 'construction' && setEditFormData({ ...editFormData, constructionNotes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">履歴情報</h3>
                      {editingTab === 'history' ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={handleTabCancel}>キャンセル</Button>
                          <Button size="sm" onClick={() => handleTabSave('履歴情報')}>保存</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleTabEdit('history')}>編集</Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* 最近の対応履歴 */}
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <h4 className="font-semibold">対応履歴</h4>
                          <Button size="sm" variant="outline">+ 履歴追加</Button>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded border">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-sm font-medium">日時</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyDate1 || '2024年1月15日 14:30') : '2024年1月15日 14:30'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyDate1: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">担当者</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyStaff1 || '山田 太郎') : '山田 太郎'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyStaff1: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">対応種別</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyType1 || '電話対応') : '電話対応'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyType1: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">重要度</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyPriority1 || '通常') : '通常'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-green-100'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyPriority1: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">対応内容</Label>
                              <textarea
                                className={`w-full p-2 border rounded resize-none h-16 ${editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}`}
                                value={editingTab === 'history' ? (editFormData.historyContent1 || "工事進捗についてお問い合わせ。基礎工事が完了し、墓石設置は3月予定であることをご説明。") : "工事進捗についてお問い合わせ。基礎工事が完了し、墓石設置は3月予定であることをご説明。"}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyContent1: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded border">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-sm font-medium">日時</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyDate2 || '2023年12月20日 10:15') : '2023年12月20日 10:15'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyDate2: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">担当者</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyStaff2 || '佐藤 花子') : '佐藤 花子'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyStaff2: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">対応種別</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyType2 || '来所相談') : '来所相談'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyType2: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">重要度</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.historyPriority2 || '重要') : '重要'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-orange-100'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyPriority2: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">対応内容</Label>
                              <textarea
                                className={`w-full p-2 border rounded resize-none h-16 ${editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}`}
                                value={editingTab === 'history' ? (editFormData.historyContent2 || "契約内容の変更について相談。墓石の種類変更を希望。見積もりを作成し後日回答予定。") : "契約内容の変更について相談。墓石の種類変更を希望。見積もりを作成し後日回答予定。"}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, historyContent2: e.target.value })}
                              />
                            </div>
                          </div>
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
                      <div className="bg-red-50 p-4 rounded border">
                        <h4 className="font-semibold mb-3 border-b pb-2 text-red-700">重要な連絡事項・注意事項</h4>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded border border-red-200">
                            <div className="grid grid-cols-2 gap-4 mb-2">
                              <div>
                                <Label className="text-sm font-medium">登録日</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.importantNoteDate || '2023年12月22日') : '2023年12月22日'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, importantNoteDate: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">重要度</Label>
                                <Input
                                  value={editingTab === 'history' ? (editFormData.importantNotePriority || '要注意') : '要注意'}
                                  className={editingTab === 'history' ? 'bg-white' : 'bg-red-100'}
                                  readOnly={editingTab !== 'history'}
                                  onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, importantNotePriority: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">内容</Label>
                              <textarea
                                className={`w-full p-2 border rounded resize-none h-12 ${editingTab === 'history' ? 'bg-white' : 'bg-yellow-50'}`}
                                value={editingTab === 'history' ? (editFormData.importantNoteContent || "ご高齢のため、重要な説明は家族同席の上で行うこと。") : "ご高齢のため、重要な説明は家族同席の上で行うこと。"}
                                readOnly={editingTab !== 'history'}
                                onChange={(e) => editingTab === 'history' && setEditFormData({ ...editFormData, importantNoteContent: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
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
              <p className="text-gray-600 mb-8">作成したい書類のテンプレートを選択してください。</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 請求書テンプレート */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 cursor-pointer transition-all hover:shadow-md"
                  onClick={handleExportInvoice}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">請求書</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    標準的な請求書フォーマットです。宛名、件名、金額、振込先などが記載されます。
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    作成する
                  </Button>
                </div>

                {/* はがきテンプレート */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 cursor-pointer transition-all hover:shadow-md"
                  onClick={handleExportPostcard}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">はがき（合祀案内など）</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    官製はがきサイズのレイアウトです。宛名面と通信面（文面）の2シートが出力されます。
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    作成する
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
    </div>
  );
}