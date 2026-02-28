'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, FilterSection } from '@/components/shared';
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

// Role badge color mapping
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-beni-50 text-beni-dark';
    case 'manager': return 'bg-kohaku-50 text-kohaku-dark';
    case 'operator': return 'bg-matsu-50 text-matsu-dark';
    case 'viewer': return 'bg-ai-50 text-ai-dark';
    default: return 'bg-hai-50 text-hai';
  }
};

export default function StaffManagement({ }: StaffManagementProps) {
  const { user } = useAuth();
  const isAdminUser = user?.role === 'admin';

  // 状態管理
  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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

  // Summary stats
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(s => s.isActive).length;
    const adminCount = staffList.filter(s => s.role === 'admin').length;
    const managerCount = staffList.filter(s => s.role === 'manager').length;
    const operatorCount = staffList.filter(s => s.role === 'operator').length;
    const viewerCount = staffList.filter(s => s.role === 'viewer').length;
    return { total, active, adminCount, managerCount, operatorCount, viewerCount };
  }, [staffList]);

  // ソート済み & フィルタ済みリスト（検索はサーバーサイドで実行済み）
  const sortedStaff = useMemo(() => {
    // Role filter
    let filtered = staffList;
    if (roleFilter !== 'all') {
      filtered = staffList.filter(s => s.role === roleFilter);
    }

    // ソート
    const result = [...filtered].sort((a, b) => {
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
  }, [staffList, roleFilter, sortKey, sortOrder]);

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
      return <span className="ml-1 text-gin">&#8645;</span>;
    }
    return <span className="ml-1 text-matsu">{sortOrder === 'asc' ? '\u2191' : '\u2193'}</span>;
  };

  return (
    <div className="min-h-screen bg-shiro">
      <PageHeader
        color="beni"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title="スタッフ管理"
        subtitle={isAdminUser
          ? 'スタッフの登録・編集・権限管理'
          : 'スタッフ情報を閲覧できます（編集は管理者のみ）'}
        actions={isAdminUser ? (
          <Button onClick={handleOpenCreateDialog} variant="default">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        ) : undefined}
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 py-4">
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <p className="text-sm text-hai">総スタッフ数</p>
          <p className="text-2xl font-bold text-sumi mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <p className="text-sm text-hai">有効</p>
          <p className="text-2xl font-bold text-matsu mt-1">{stats.active}</p>
        </div>
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-hai">管理者</p>
            <span className="w-2 h-2 rounded-full bg-beni"></span>
          </div>
          <p className="text-2xl font-bold text-sumi mt-1">{stats.adminCount}</p>
        </div>
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-hai">マネージャー</p>
            <span className="w-2 h-2 rounded-full bg-kohaku"></span>
          </div>
          <p className="text-2xl font-bold text-sumi mt-1">{stats.managerCount}</p>
        </div>
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-hai">オペレーター</p>
            <span className="w-2 h-2 rounded-full bg-matsu"></span>
          </div>
          <p className="text-2xl font-bold text-sumi mt-1">{stats.operatorCount}</p>
        </div>
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-hai">閲覧者</p>
            <span className="w-2 h-2 rounded-full bg-ai"></span>
          </div>
          <p className="text-2xl font-bold text-sumi mt-1">{stats.viewerCount}</p>
        </div>
      </div>

      <FilterSection resultCount={sortedStaff.length}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <Label className="text-sm font-medium text-sumi mb-2 block">検索</Label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hai" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="氏名・メールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gin"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">権限</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gin rounded-elegant text-sm text-sumi bg-white focus:outline-none focus:ring-2 focus:ring-matsu transition-all duration-200"
            >
              <option value="all">すべて</option>
              {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((role) => (
                <option key={role} value={role}>{STAFF_ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                size="default"
              >
                クリア
              </Button>
            )}
          </div>
        </div>
      </FilterSection>

      {/* Error display */}
      {loadError && (
        <div className="mx-6 mb-4 p-4 bg-beni-50 border border-beni-200 text-beni rounded-elegant-lg flex items-center justify-between">
          <span>{loadError}</span>
          <button
            onClick={() => fetchStaffList()}
            className="border border-beni text-beni hover:bg-beni-100 rounded-elegant px-3 py-1.5 transition-all duration-200 text-sm font-medium ml-4"
          >
            再試行
          </button>
        </div>
      )}

      {/* Staff Table */}
      <div className="mx-6 mb-6 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-hai">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matsu mx-auto mb-4"></div>
            <p className="text-sm">読み込み中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-kinari border-b border-gin">
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                    onClick={() => handleSort('id')}
                  >
                    ID <SortIcon columnKey="id" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                    onClick={() => handleSort('name')}
                  >
                    氏名 <SortIcon columnKey="name" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                    onClick={() => handleSort('email')}
                  >
                    メールアドレス <SortIcon columnKey="email" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                    onClick={() => handleSort('role')}
                  >
                    権限 <SortIcon columnKey="role" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                    onClick={() => handleSort('isActive')}
                  >
                    状態 <SortIcon columnKey="isActive" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
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
              <tbody>
                {sortedStaff.map((staff, index) => (
                  <tr
                    key={staff.id}
                    className={`border-b border-gin hover:bg-kinari transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-shiro'
                      } ${!staff.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-hai">{staff.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-sumi">{staff.name}</td>
                    <td className="px-4 py-3 text-sm text-sumi">{staff.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(staff.role)}`}>
                        {STAFF_ROLE_LABELS[staff.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {staff.isActive
                        ? <span className="px-3 py-1 rounded-full text-xs font-medium bg-matsu-50 text-matsu-dark">有効</span>
                        : <span className="px-3 py-1 rounded-full text-xs font-medium bg-hai-50 text-hai">無効</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-hai">
                      {formatDateTime(staff.lastLoginAt)}
                    </td>
                    {isAdminUser && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditDialog(staff)}
                            className="border border-gin text-sumi hover:bg-kinari rounded-elegant px-3 py-1.5 transition-all duration-200 text-xs font-medium"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleToggleActive(staff)}
                            className={`border rounded-elegant px-3 py-1.5 transition-all duration-200 text-xs font-medium ${staff.isActive
                              ? 'border-kohaku text-kohaku hover:bg-kohaku-50'
                              : 'border-matsu text-matsu hover:bg-matsu-50'
                              }`}
                          >
                            {staff.isActive ? '無効化' : '有効化'}
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(staff)}
                            className="border border-beni text-beni hover:bg-beni-50 rounded-elegant px-3 py-1.5 transition-all duration-200 text-xs font-medium"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {sortedStaff.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdminUser ? 7 : 6}
                      className="px-4 py-12 text-center text-hai"
                    >
                      <svg className="w-12 h-12 mx-auto mb-3 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm">
                        {searchQuery || roleFilter !== 'all'
                          ? '検索条件に一致するスタッフが見つかりません'
                          : 'スタッフが登録されていません'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 登録/編集ダイアログ */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md overflow-hidden">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-beni-50 to-kinari px-6 py-4 border-b border-gin">
              <h3 className="font-mincho text-lg font-semibold text-sumi">
                {editingStaff ? 'スタッフ編集' : 'スタッフ登録'}
              </h3>
              <p className="text-sm text-hai mt-0.5">
                {editingStaff ? 'スタッフ情報を編集します' : '新しいスタッフを登録します'}
              </p>
            </div>

            {/* Dialog Body */}
            <div className="px-6 py-5">
              {formError && (
                <div className="mb-4 p-3 bg-beni-50 border border-beni-200 text-beni text-sm rounded-elegant">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block mb-1.5 text-sm font-medium text-sumi">
                    氏名 <span className="text-beni">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 山田 太郎"
                    className="border-gin focus:ring-matsu focus:border-matsu"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="block mb-1.5 text-sm font-medium text-sumi">
                    メールアドレス <span className="text-beni">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="例: yamada@komine-cemetery.jp"
                    className="border-gin focus:ring-matsu focus:border-matsu"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="block mb-1.5 text-sm font-medium text-sumi">
                    権限 <span className="text-beni">*</span>
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border border-gin rounded-elegant bg-white text-sumi focus:outline-none focus:ring-2 focus:ring-matsu transition-all duration-200"
                  >
                    {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((role) => (
                      <option key={role} value={role}>
                        {STAFF_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-sm text-hai">
                    {STAFF_ROLE_DESCRIPTIONS[formData.role]}
                  </p>
                </div>

                {editingStaff && (
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-matsu border-gin rounded focus:ring-matsu"
                    />
                    <Label htmlFor="isActive" className="ml-2 text-sm text-sumi">
                      有効（ログイン可能）
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
              <button
                onClick={() => setShowDialog(false)}
                disabled={isSaving}
                className="border border-gin text-sumi hover:bg-white rounded-elegant px-4 py-2 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-matsu text-white hover:bg-matsu-dark rounded-elegant px-4 py-2 shadow-elegant-sm transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? '保存中...' : editingStaff ? '更新' : '登録'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md overflow-hidden">
            {/* Delete Dialog Header */}
            <div className="bg-gradient-to-r from-beni-50 to-kinari px-6 py-4 border-b border-gin">
              <h3 className="font-mincho text-lg font-semibold text-beni">スタッフ削除の確認</h3>
              <p className="text-sm text-hai mt-0.5">この操作は取り消せません</p>
            </div>

            {/* Delete Dialog Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-sumi mb-4">
                以下のスタッフを削除してもよろしいですか？
              </p>
              <div className="bg-kinari p-4 rounded-elegant-lg border border-gin">
                <p className="font-medium text-sumi">{staffToDelete.name}</p>
                <p className="text-sm text-hai mt-1">{staffToDelete.email}</p>
                <p className="text-sm text-hai mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(staffToDelete.role)} mt-1`}>
                    {STAFF_ROLE_LABELS[staffToDelete.role]}
                  </span>
                </p>
              </div>
            </div>

            {/* Delete Dialog Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="border border-gin text-sumi hover:bg-white rounded-elegant px-4 py-2 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-beni text-white hover:bg-beni-dark rounded-elegant px-4 py-2 shadow-elegant-sm transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
