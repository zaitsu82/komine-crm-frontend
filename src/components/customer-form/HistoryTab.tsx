'use client';

import { HISTORY_REASON_LABELS } from '@/types/customer';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { HistoryTabProps } from './types';

export function HistoryTab({
  customer,
  selectedHistoryId,
  setSelectedHistoryId,
}: HistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* 履歴情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">履歴情報</h3>

        {!customer?.historyRecords || customer.historyRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            <p>履歴情報はありません</p>
            <p className="text-sm mt-2">変更が行われると履歴が記録されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 履歴一覧テーブル */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">氏名</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">更新履歴</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">更新事由</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.historyRecords.map((record) => {
                    const isSelected = selectedHistoryId === record.id;
                    return (
                      <tr
                        key={record.id}
                        className={`border-t cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedHistoryId(isSelected ? null : record.id)}
                      >
                        <td className="px-4 py-2 text-sm">
                          {record.contractorSnapshot.name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {record.updatedAt ? formatDate(record.updatedAt) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {HISTORY_REASON_LABELS[record.reasonType]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 選択された履歴の契約者情報スナップショット */}
            {selectedHistoryId && (() => {
              const selectedRecord = customer.historyRecords?.find(r => r.id === selectedHistoryId);
              if (!selectedRecord) return null;
              const snapshot = selectedRecord.contractorSnapshot;

              return (
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h4 className="text-md font-semibold mb-4 text-gray-800">
                    契約者情報（{formatDate(selectedRecord.updatedAt)}時点）
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">氏名</Label>
                        <span className="text-sm font-medium">{snapshot.name || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">ふりがな</Label>
                        <span className="text-sm">{snapshot.nameKana || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">生年月日</Label>
                        <span className="text-sm">{snapshot.birthDate ? formatDate(snapshot.birthDate) : '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">性別</Label>
                        <span className="text-sm">{snapshot.gender === 'male' ? '男' : snapshot.gender === 'female' ? '女' : '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">住所</Label>
                        <span className="text-sm">{snapshot.postalCode ? `${snapshot.postalCode} ` : ''}{snapshot.address || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">電話番号</Label>
                        <span className="text-sm">{snapshot.phoneNumber || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">FAX</Label>
                        <span className="text-sm">{snapshot.faxNumber || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">Eメール</Label>
                        <span className="text-sm">{snapshot.email || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">勤務先名称</Label>
                        <span className="text-sm">{snapshot.companyName || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">勤務先かな</Label>
                        <span className="text-sm">{snapshot.companyNameKana || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">勤務先住所</Label>
                        <span className="text-sm">{snapshot.companyAddress || '-'}</span>
                      </div>
                      <div className="flex">
                        <Label className="w-28 text-sm text-gray-600">電話番号</Label>
                        <span className="text-sm">{snapshot.companyPhone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
