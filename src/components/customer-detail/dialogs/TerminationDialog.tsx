'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TerminationProcessType, TERMINATION_PROCESS_TYPE_LABELS } from '@/types/plot-constants';
import { TerminationFormData } from '@/types/customer-detail';

interface TerminationDialogProps {
  isOpen: boolean;
  targetName: string;
  targetCode: string;
  formData: TerminationFormData;
  onFormChange: (data: TerminationFormData) => void;
  onTerminate: () => void;
  onClose: () => void;
}

export default function TerminationDialog({
  isOpen,
  targetName,
  targetCode,
  formData,
  onFormChange,
  onTerminate,
  onClose,
}: TerminationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">解約入力</h3>
          <p className="text-sm text-red-100 mt-1">{targetName} 様（{targetCode}）</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ 解約処理を行うと、契約ステータスが「解約済み」に変更されます。この操作は取り消せません。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">解約日 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.terminationDate}
                onChange={(e) => onFormChange({ ...formData, terminationDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">担当者 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.handledBy}
                onChange={(e) => onFormChange({ ...formData, handledBy: e.target.value })}
                placeholder="担当者名を入力"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">処理種別 <span className="text-red-500">*</span></Label>
              <select
                value={formData.processType}
                onChange={(e) => onFormChange({ ...formData, processType: e.target.value as TerminationProcessType })}
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
                value={formData.refundAmount}
                onChange={(e) => onFormChange({ ...formData, refundAmount: e.target.value })}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">解約理由 <span className="text-red-500">*</span></Label>
            <select
              value={formData.reason}
              onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
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
              value={formData.processDetail}
              onChange={(e) => onFormChange({ ...formData, processDetail: e.target.value })}
              placeholder="処理の詳細（移転先など）"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">備考</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
              placeholder="特記事項があれば入力"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white resize-none h-20"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onTerminate}>
            解約処理を実行
          </Button>
        </div>
      </div>
    </div>
  );
}
