'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HistoryEntry } from '@/types/plot-detail';

interface HistoryDialogProps {
  isOpen: boolean;
  newHistory: Omit<HistoryEntry, 'id'>;
  onHistoryChange: (history: Omit<HistoryEntry, 'id'>) => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function HistoryDialog({
  isOpen,
  newHistory,
  onHistoryChange,
  onAdd,
  onClose,
}: HistoryDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-ai text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">対応履歴を追加</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">日時 <span className="text-beni">*</span></Label>
              <Input
                value={newHistory.date}
                onChange={(e) => onHistoryChange({ ...newHistory, date: e.target.value })}
                placeholder="2024年1月15日 14:30"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">担当者 <span className="text-beni">*</span></Label>
              <Input
                value={newHistory.staff}
                onChange={(e) => onHistoryChange({ ...newHistory, staff: e.target.value })}
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
                onChange={(e) => onHistoryChange({ ...newHistory, type: e.target.value })}
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
                onChange={(e) => onHistoryChange({ ...newHistory, priority: e.target.value as '通常' | '重要' | '緊急' })}
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
              >
                <option value="通常">通常</option>
                <option value="重要">重要</option>
                <option value="緊急">緊急</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">対応内容 <span className="text-beni">*</span></Label>
            <textarea
              value={newHistory.content}
              onChange={(e) => onHistoryChange({ ...newHistory, content: e.target.value })}
              placeholder="対応内容を入力してください..."
              className="mt-1 w-full border rounded-md px-3 py-2 h-32 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-shiro rounded-b-lg flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button className="bg-ai hover:bg-ai-dark text-white" onClick={onAdd}>
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
