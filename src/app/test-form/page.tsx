'use client';

import { useState } from 'react';
import CustomerForm, { CustomerDetailView } from '@/components/customer-form';
import { CustomerFormData } from '@/lib/validations';
import { formDataToCustomer } from '@/lib/data';
import { Customer } from '@/types/customer';

// テスト用のダミー顧客データ
const dummyCustomer: Customer = {
  id: 'test-001',
  customerCode: 'A-56',
  name: '山田 太郎',
  nameKana: 'やまだ たろう',
  gender: 'male',
  phoneNumber: '090-1234-5678',
  address: '東京都新宿区西新宿1-1-1',
  plotNumber: 'A-56',
  plotPeriod: '1期',
  section: 'A区',
  birthDate: new Date('1960-05-15'),
  email: 'yamada@example.com',
  faxNumber: '03-1234-5678',
  registeredAddress: '東京都渋谷区渋谷1-1-1',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  applicantInfo: {
    applicationDate: new Date('2024-01-15'),
    staffName: '佐藤 花子',
    name: '山田 太郎',
    nameKana: 'やまだ たろう',
    postalCode: '160-0023',
    phoneNumber: '090-1234-5678',
    address: '東京都新宿区西新宿1-1-1',
  },
  usageFee: {
    calculationType: '固定',
    taxType: '税込',
    billingType: '一括',
    billingYears: 10,
    area: '3.0平方メートル',
    unitPrice: 50000,
    usageFee: 150000,
    paymentMethod: '銀行振込',
  },
  managementFee: {
    calculationType: '固定',
    taxType: '税込',
    billingType: '年払い',
    billingYears: 1,
    area: '3.0平方メートル',
    billingMonth: 4,
    managementFee: 12000,
    unitPrice: 4000,
    lastBillingMonth: '2024年4月',
    paymentMethod: '口座振替',
  },
  gravestoneInfo: {
    gravestoneBase: '御影石',
    enclosurePosition: '北側',
    gravestoneDealer: '石材店ABC',
    gravestoneType: '和型',
    surroundingArea: '植栽あり',
    establishmentDeadline: new Date('2024-12-31'),
    establishmentDate: new Date('2024-06-15'),
  },
  familyContacts: [
    {
      id: 'contact-1',
      name: '山田 花子',
      nameKana: 'やまだ はなこ',
      relationship: '配偶者',
      phoneNumber: '090-9876-5432',
      address: '東京都新宿区西新宿1-1-1',
      gender: 'female',
      birthDate: new Date('1965-03-20'),
    },
  ],
  buriedPersons: [
    {
      id: 'buried-1',
      name: '山田 一郎',
      nameKana: 'やまだ いちろう',
      gender: 'male',
      birthDate: new Date('1930-01-01'),
      deathDate: new Date('2023-06-15'),
      burialDate: new Date('2023-07-01'),
      age: 93,
      relationship: '父',
      posthumousName: '慈光院釋一郎大居士',
    },
  ],
  constructionRecords: [
    {
      id: 'construction-1',
      contractorName: '石材工事ABC',
      constructionType: 'gravestone',
      startDate: new Date('2024-03-01'),
      scheduledEndDate: new Date('2024-05-31'),
      endDate: new Date('2024-05-15'),
      description: '墓石新設工事',
      constructionAmount: 500000,
      paidAmount: 500000,
    },
  ],
};

export default function TestFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showData, setShowData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  const handleSave = async (data: CustomerFormData) => {
    setIsLoading(true);
    console.log('受信したフォームデータ:', data);

    // フォームデータを顧客データに変換
    const customerData = formDataToCustomer(data);
    console.log('変換された顧客データ:', customerData);

    setShowData({ formData: data, customerData });

    // 2秒後に完了をシミュレート
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log('キャンセルされました');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">顧客フォームテスト</h1>
        <p className="text-gray-600 mt-2">閲覧モードと編集モードの切り替えテストページです</p>

        {/* モード切り替えボタン */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setViewMode('view')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'view'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            閲覧モード（CustomerDetailView）
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'edit'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            編集モード（CustomerForm）
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">
            {viewMode === 'view' ? '閲覧モードの特徴:' : '編集モードの特徴:'}
          </h2>
          {viewMode === 'view' ? (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• フィールドは黄色背景で読み取り専用表示</li>
              <li>• 入力フィールドは表示されない</li>
              <li>• 追加/削除ボタンは非表示</li>
              <li>• 「編集」ボタンで編集モードに切り替え可能</li>
            </ul>
          ) : (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>顧客基本情報</strong>: 顧客コード（必須）、区画番号、区域（セレクトボックス）</li>
              <li>• <strong>申込者情報</strong>: 申込日、担当者氏名、氏名、振り仮名、郵便番号、電話番号、住所</li>
              <li>• <strong>契約者情報</strong>: 予約日、承諾書番号、許可日、開始年月日、氏名（必須）など</li>
              <li>• <strong>使用料・管理料</strong>: 各種料金設定</li>
              <li>• <strong>墓石</strong>: 墓石情報</li>
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {viewMode === 'view' ? (
          <CustomerDetailView
            customer={dummyCustomer}
            onEdit={() => setViewMode('edit')}
          />
        ) : (
          <CustomerForm
            customer={dummyCustomer}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>

      {showData && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">送信されたデータ:</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-gray-700">フォームデータ:</h3>
              <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(showData.formData, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-3 text-gray-700">変換された顧客データ:</h3>
              <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(showData.customerData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}