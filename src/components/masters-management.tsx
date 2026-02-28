'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, FilterSection } from '@/components/shared';
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
      <div className="h-full flex items-center justify-center bg-shiro">
        <p className="text-hai">読み込み中...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full bg-shiro p-6">
        <div className="bg-beni-50 border border-beni-200 rounded-elegant-lg p-4">
          <p className="text-beni">{loadError}</p>
          <Button onClick={fetchData} className="mt-2" variant="outline" size="sm">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-shiro">
      <PageHeader
        color="cha"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.929-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title="マスタ管理"
        subtitle="マスタデータの管理"
        actions={isAdmin ? (
          <Button onClick={handleOpenCreate} variant="cha">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規追加
          </Button>
        ) : undefined}
      />

      {/* Master type tabs */}
      <FilterSection resultCount={currentItems.length}>
        <div className="flex flex-wrap gap-2">
          {MASTER_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-elegant text-sm font-medium transition-all duration-200 ${selectedType.key === type.key
                ? 'bg-cha text-white shadow-elegant-sm'
                : 'bg-white text-sumi border border-gin hover:bg-kinari'
                }`}
            >
              {type.label}
              <span className="ml-1 text-xs opacity-70">
                ({mastersData ? (mastersData[type.dataKey] as MasterItem[]).length : 0})
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-kinari border-b border-gin">
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">コード</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">名称</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">説明</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">並び順</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">状態</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">操作</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gin">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-hai">
                    データがありません
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-cha-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-shiro'}`}>
                    <td className="px-4 py-3 text-sm text-hai">{item.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-sumi">{item.code}</td>
                    <td className="px-4 py-3 text-sm font-medium text-sumi">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-hai">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-hai">{item.sortOrder ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.isActive
                          ? 'bg-matsu-50 text-matsu-dark'
                          : 'bg-kinari text-hai'
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
                            className="text-beni hover:text-beni-dark hover:bg-beni-50"
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
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cha-50 to-kinari px-6 py-4 border-b border-gin">
              <h3 className="font-mincho text-lg font-semibold text-sumi">
                {editingItem ? `${selectedType.label}を編集` : `${selectedType.label}を追加`}
              </h3>
            </div>

            <div className="px-6 py-5">
              {formError && (
                <div className="bg-beni-50 border border-beni-200 rounded-elegant p-3 mb-4">
                  <p className="text-beni text-sm">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code" className="block mb-1.5 text-sm font-medium text-sumi">コード <span className="text-beni">*</span></Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例: GENERAL"
                    maxLength={10}
                    className="border-gin"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="block mb-1.5 text-sm font-medium text-sumi">名称 <span className="text-beni">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 一般墓地"
                    maxLength={50}
                    className="border-gin"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="block mb-1.5 text-sm font-medium text-sumi">説明</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="任意の説明"
                    maxLength={200}
                    className="border-gin"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder" className="block mb-1.5 text-sm font-medium text-sumi">並び順</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    placeholder="数値"
                    className="border-gin"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button onClick={handleSubmit} variant="cha" disabled={isSaving}>
                {isSaving ? '保存中...' : editingItem ? '更新' : '作成'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-beni-50 to-kinari px-6 py-4 border-b border-gin">
              <h3 className="font-mincho text-lg font-semibold text-beni">削除確認</h3>
              <p className="text-sm text-hai mt-0.5">この操作は取り消せません</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-sumi">
                <span className="font-medium">{itemToDelete.name}</span>（{itemToDelete.code}）を削除しますか？
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
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
                className="bg-beni hover:bg-beni-dark text-white"
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
