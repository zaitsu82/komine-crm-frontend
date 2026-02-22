'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllMasters,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  MasterItem,
  AllMastersData,
  MasterType,
} from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

interface MasterTypeConfig {
  key: MasterType;
  label: string;
  dataKey: keyof AllMastersData;
}

const MASTER_TYPES: MasterTypeConfig[] = [
  { key: 'cemetery-type', label: '墓地タイプ', dataKey: 'cemeteryType' },
  { key: 'payment-method', label: '支払方法', dataKey: 'paymentMethod' },
  { key: 'tax-type', label: '税タイプ', dataKey: 'taxType' },
  { key: 'calc-type', label: '計算タイプ', dataKey: 'calcType' },
  { key: 'billing-type', label: '請求タイプ', dataKey: 'billingType' },
  { key: 'account-type', label: '口座タイプ', dataKey: 'accountType' },
  { key: 'recipient-type', label: '受取人タイプ', dataKey: 'recipientType' },
  { key: 'construction-type', label: '工事タイプ', dataKey: 'constructionType' },
];

export default function MastersManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [mastersData, setMastersData] = useState<AllMastersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<MasterTypeConfig>(MASTER_TYPES[0]);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '', sortOrder: '' });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const response = await getAllMasters();
    if (response.success) {
      setMastersData(response.data);
    } else {
      setLoadError(response.error?.message || 'マスタデータの取得に失敗しました');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentItems = mastersData ? (mastersData[selectedType.dataKey] as MasterItem[]) : [];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', description: '', sortOrder: '' });
    setFormError('');
    setShowDialog(true);
  };

  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      sortOrder: item.sortOrder?.toString() || '',
    });
    setFormError('');
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      setFormError('コードを入力してください');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('名称を入力してください');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      sortOrder: formData.sortOrder ? parseInt(formData.sortOrder, 10) : null,
    };

    if (editingItem) {
      const response = await updateMasterItem(selectedType.key, editingItem.id, payload);
      if (response.success) {
        await fetchData();
        setShowDialog(false);
        showSuccess(`${selectedType.label}を更新しました`);
      } else {
        setFormError(response.error?.message || '更新に失敗しました');
      }
    } else {
      const response = await createMasterItem(selectedType.key, payload);
      if (response.success) {
        await fetchData();
        setShowDialog(false);
        showSuccess(`${selectedType.label}を作成しました`);
      } else {
        setFormError(response.error?.message || '作成に失敗しました');
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    const response = await deleteMasterItem(selectedType.key, itemToDelete.id);
    if (response.success) {
      await fetchData();
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      showSuccess(`${selectedType.label}を削除しました`);
    } else {
      showError(response.error?.message || '削除に失敗しました');
    }

    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{loadError}</p>
          <Button onClick={fetchData} className="mt-2" variant="outline" size="sm">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">マスタ管理</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            + 新規追加
          </Button>
        )}
      </div>

      {/* Master type tabs */}
      <div className="flex flex-wrap gap-2">
        {MASTER_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType.key === type.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
            <span className="ml-1 text-xs opacity-70">
              ({mastersData ? (mastersData[type.dataKey] as MasterItem[]).length : 0})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">コード</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">説明</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">並び順</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{item.id}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.sortOrder ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenEdit(item)}
                          variant="outline"
                          size="sm"
                        >
                          編集
                        </Button>
                        <Button
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteConfirm(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? `${selectedType.label}を編集` : `${selectedType.label}を追加`}
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="code">コード *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例: GENERAL"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="name">名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 一般墓地"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="任意の説明"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">並び順</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  placeholder="数値"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? '保存中...' : editingItem ? '更新' : '作成'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">削除確認</h2>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">{itemToDelete.name}</span>（{itemToDelete.code}）を削除しますか？
            </p>
            <p className="text-sm text-red-600 mb-4">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                variant="outline"
                disabled={isDeleting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
