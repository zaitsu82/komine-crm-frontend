'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImportantNote } from '@/types/plot-detail';

interface NoteDialogProps {
  isOpen: boolean;
  editingNoteId: string | null;
  newNote: Omit<ImportantNote, 'id'>;
  onNoteChange: (note: Omit<ImportantNote, 'id'>) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function NoteDialog({
  isOpen,
  editingNoteId,
  newNote,
  onNoteChange,
  onSave,
  onClose,
}: NoteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            {editingNoteId ? '連絡事項を編集' : '重要な連絡事項・注意事項を追加'}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">登録日</Label>
              <Input
                value={newNote.date}
                onChange={(e) => onNoteChange({ ...newNote, date: e.target.value })}
                placeholder="2024年1月15日"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">重要度</Label>
              <select
                value={newNote.priority}
                onChange={(e) => onNoteChange({ ...newNote, priority: e.target.value as '要注意' | '注意' | '参考' })}
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
              onChange={(e) => onNoteChange({ ...newNote, content: e.target.value })}
              placeholder="重要な連絡事項や注意事項を入力してください..."
              className="mt-1 w-full border rounded-md px-3 py-2 h-32 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onSave}>
            {editingNoteId ? '更新' : '追加'}
          </Button>
        </div>
      </div>
    </div>
  );
}
