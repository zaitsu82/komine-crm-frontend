'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import {
  StaffRole,
  STAFF_ROLE_LABELS,
  STAFF_ROLE_DESCRIPTIONS,
} from '@/types/staff';
import {
  getStaffList,
  createStaff as apiCreateStaff,
  updateStaff as apiUpdateStaff,
  deleteStaff as apiDeleteStaff,
  toggleStaffActive as apiToggleStaffActive,
  StaffListItem,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '@/lib/api';
import { showSuccess, showError, showApiError } from '@/lib/toast';

interface StaffManagementProps {
  // 将来的な拡張用
}

type SortKey = 'id' | 'name' | 'email' | 'role' | 'isActive' | 'lastLoginAt';
type SortOrder = 'asc' | 'desc';

export default function StaffManagement({ }: StaffManagementProps) {
  const { user } = useAuth();
  const isAdminUser = user?.role === 'admin';

  // 状態管理
  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ダイアログ関連
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as StaffRole,
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 削除確認ダイアログ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // スタッフ一覧を取得
  const fetchStaffList = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getStaffList({ search: searchQuery || undefined });

      if (response.success) {
        setStaffList(response.data.items);
      } else {
        setLoadError(response.error?.message || 'スタッフ一覧の取得に失敗しました');
      }
    } catch {
      setLoadError('スタッフ一覧の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 初回読み込みと検索クエリ変更時に再取得
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStaffList();
    }, 300); // デバウンス

    return () => clearTimeout(timeoutId);
  }, [fetchStaffList]);

  // ソート済みリスト（検索はサーバーサイドで実行済み）
  const sortedStaff = useMemo(() => {
    // ソート
    const result = [...staffList].sort((a, b) => {
      let aValue: string | number | boolean | null;
      let bValue: string | number | boolean | null;

      switch (sortKey) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [staffList, sortKey, sortOrder]);

  // ソートハンドラ
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // 新規作成ダイアログを開く
  const handleOpenCreateDialog = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      isActive: true,
    });
    setFormError('');
    setShowDialog(true);
  };

  // 編集ダイアログを開く
  const handleOpenEditDialog = (staff: StaffListItem) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
    });
    setFormError('');
    setShowDialog(true);
  };

  // フォーム送信
  const handleSubmit = async () => {
    // バリデーション
    if (!formData.name.trim()) {
      setFormError('氏名を入力してください');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('メールアドレスを入力してください');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('有効なメールアドレスを入力してください');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingStaff) {
        // 更新
        const updateData: UpdateStaffRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        const response = await apiUpdateStaff(editingStaff.id, updateData);

        if (response.success) {
          // リストを再取得
          await fetchStaffList();
          setShowDialog(false);
          showSuccess('スタッフ情報を更新しました');
        } else {
          setFormError(response.error?.message || 'スタッフの更新に失敗しました');
        }
      } else {
        // 新規作成
        const createData: CreateStaffRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        const response = await apiCreateStaff(createData);

        if (response.success) {
          // リストを再取得
          await fetchStaffList();
          setShowDialog(false);
          showSuccess('スタッフを作成しました');
        } else {
          setFormError(response.error?.message || 'スタッフの作成に失敗しました');
        }
      }
    } catch {
      setFormError('エラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 有効/無効切り替え
  const handleToggleActive = async (staff: StaffListItem) => {
    try {
      const response = await apiToggleStaffActive(staff.id);

      if (response.success) {
        // リストを再取得
        await fetchStaffList();
        showSuccess(`${staff.name}を${staff.isActive ? '無効' : '有効'}にしました`);
      } else {
        showApiError('状態の変更', response.error?.message);
      }
    } catch {
      showError('状態の変更中にエラーが発生しました');
    }
  };

  // 削除確認ダイアログを開く
  const handleOpenDeleteConfirm = (staff: StaffListItem) => {
    setStaffToDelete(staff);
    setShowDeleteConfirm(true);
  };

  // 削除実行
  const handleDelete = async () => {
    if (!staffToDelete) return;

    setIsDeleting(true);

    try {
      const response = await apiDeleteStaff(staffToDelete.id);

      if (response.success) {
        // リストを再取得
        await fetchStaffList();
        setShowDeleteConfirm(false);
        showSuccess(`${staffToDelete.name}を削除しました`);
        setStaffToDelete(null);
      } else {
        showApiError('スタッフの削除', response.error?.message);
      }
    } catch {
      showError('スタッフの削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // 日時フォーマット
  const formatDateTime = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // ソートアイコン
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <span className="ml-1 text-gin">⇅</span>;
    }
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sumi mb-2">スタッフ管理</h1>
        <p className="text-hai">
          {isAdminUser
            ? 'スタッフの登録・編集・削除ができます'
            : 'スタッフ情報を閲覧できます（編集は管理者のみ）'}
        </p>
      </div>

      {/* 検索・操作バー */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="text"
            placeholder="氏名・メールアドレスで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
            disabled={!searchQuery}
          >
            クリア
          </Button>
        </div>
        {isAdminUser && (
          <Button onClick={handleOpenCreateDialog}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        )}
      </div>

      {/* エラー表示 */}
      {loadError && (
        <div className="mb-4 p-4 bg-beni-50 border border-beni-200 text-beni rounded-elegant">
          {loadError}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStaffList()}
            className="ml-4"
          >
            再試行
          </Button>
        </div>
      )}

      {/* スタッフ一覧テーブル */}
      <div className="bg-white rounded-elegant-lg border border-gin overflow-hidden shadow-elegant">
        {isLoading ? (
          <div className="p-8 text-center text-hai">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matsu mx-auto mb-4"></div>
            読み込み中...
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-kinari">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  ID <SortIcon columnKey="id" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  氏名 <SortIcon columnKey="name" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  メールアドレス <SortIcon columnKey="email" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  権限 <SortIcon columnKey="role" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('isActive')}
                >
                  状態 <SortIcon columnKey="isActive" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  最終ログイン <SortIcon columnKey="lastLoginAt" />
                </th>
                {isAdminUser && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-sumi">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gin">
              {sortedStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className={`hover:bg-matsu-50 transition-colors ${!staff.isActive ? 'bg-kinari text-hai' : ''}`}
                >
                  <td className="px-4 py-3 text-sm">{staff.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{staff.name}</td>
                  <td className="px-4 py-3 text-sm">{staff.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${staff.role === 'admin'
                        ? 'bg-cha-50 text-cha-dark'
                        : staff.role === 'manager'
                          ? 'bg-ai-50 text-ai-dark'
                          : staff.role === 'operator'
                            ? 'bg-matsu-50 text-matsu-dark'
                            : 'bg-kinari text-sumi'
                        }`}
                    >
                      {STAFF_ROLE_LABELS[staff.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${staff.isActive
                        ? 'bg-matsu-50 text-matsu-dark'
                        : 'bg-beni-50 text-beni'
                        }`}
                    >
                      {staff.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-hai">
                    {formatDateTime(staff.lastLoginAt)}
                  </td>
                  {isAdminUser && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditDialog(staff)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(staff)}
                          className={staff.isActive ? 'text-kohaku' : 'text-matsu'}
                        >
                          {staff.isActive ? '無効化' : '有効化'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDeleteConfirm(staff)}
                          className="text-beni hover:bg-beni-50"
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {sortedStaff.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdminUser ? 7 : 6}
                    className="px-4 py-8 text-center text-hai"
                  >
                    {searchQuery
                      ? '検索条件に一致するスタッフが見つかりません'
                      : 'スタッフが登録されていません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 登録/編集ダイアログ */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'スタッフ編集' : 'スタッフ新規登録'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-beni-50 border border-beni-200 text-beni rounded-elegant">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="block mb-1">
                  氏名 <span className="text-beni">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div>
                <Label htmlFor="email" className="block mb-1">
                  メールアドレス <span className="text-beni">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="例: yamada@komine-cemetery.jp"
                />
              </div>

              <div>
                <Label htmlFor="role" className="block mb-1">
                  権限 <span className="text-beni">*</span>
                </Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full px-3 py-2 border border-gin rounded-elegant focus:outline-none focus:ring-2 focus:ring-matsu transition-all duration-250"
                >
                  {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((role) => (
                    <option key={role} value={role}>
                      {STAFF_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-hai">
                  {STAFF_ROLE_DESCRIPTIONS[formData.role]}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-matsu border-gin rounded focus:ring-matsu"
                />
                <Label htmlFor="isActive" className="ml-2">
                  有効（ログイン可能）
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isSaving}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? '保存中...' : editingStaff ? '更新' : '登録'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-beni">スタッフ削除の確認</h2>
            <p className="mb-4">
              以下のスタッフを削除してもよろしいですか？
            </p>
            <div className="bg-kinari p-4 rounded-elegant border border-gin mb-4">
              <p className="font-medium text-sumi">{staffToDelete.name}</p>
              <p className="text-sm text-hai">{staffToDelete.email}</p>
              <p className="text-sm text-hai">{STAFF_ROLE_LABELS[staffToDelete.role]}</p>
            </div>
            <p className="text-sm text-beni mb-4">
              ※ この操作は取り消せません
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-beni hover:bg-beni-dark text-white"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
