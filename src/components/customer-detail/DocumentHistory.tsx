'use client';

import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { formatDateWithEra } from '@/lib/utils';

interface DocumentHistoryProps {
  customer: Customer;
  onNewDocument: () => void;
  onMarkAsSent: (docId: string) => void;
}

export default function DocumentHistory({
  customer,
  onNewDocument,
  onMarkAsSent,
}: DocumentHistoryProps) {
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">書類履歴一覧</h2>
          <Button
            onClick={onNewDocument}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            + 新規書類作成
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {!customer.documents || customer.documents.length === 0 ? (
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
                  {customer.documents.map((doc) => (
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
                            onClick={() => onMarkAsSent(doc.id)}
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
  );
}
