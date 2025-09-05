'use client';

import { useState } from 'react';
import CustomerForm from '@/components/customer-form';
import { CustomerFormData } from '@/lib/validations';
import { formDataToCustomer } from '@/lib/data';

export default function TestFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showData, setShowData] = useState<any>(null);

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
        <h1 className="text-3xl font-bold text-gray-900">新規顧客登録フォーム</h1>
        <p className="text-gray-600 mt-2">新しい仕様に基づく顧客登録フォームのテストページです</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">新しい仕様のフィールド構成:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>顧客基本情報</strong>: 顧客コード（必須）、区画番号、区域（セレクトボックス）</li>
            <li>• <strong>申込者情報</strong>: 申込日、担当者氏名、氏名、振り仮名、郵便番号、電話番号、住所</li>
            <li>• <strong>契約者情報</strong>: 予約日、承諾書番号、許可日、開始年月日、氏名（必須）、振り仮名（必須）、生年月日、性別（必須）、電話番号（必須）、ファックス、メール、住所（必須）、本籍地住所</li>
            <li>• <strong>使用料</strong>: 計算区分、税区分、請求区分、請求年数、面積、単価、使用料、支払い方法（すべてセレクトボックス）</li>
            <li>• <strong>管理料</strong>: 計算区分、税区分、請求区分、請求年数、面積、請求月、管理料、単価、最終請求月、支払方法（すべてセレクトボックス）</li>
            <li>• <strong>墓石</strong>: 墓石台、包囲位置、墓石取扱い、墓石タイプ、周辺設備、設立期限、設立日</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg">
        <CustomerForm 
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
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