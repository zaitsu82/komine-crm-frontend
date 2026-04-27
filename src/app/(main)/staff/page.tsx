'use client';

import StaffManagement from '@/components/staff-management';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';

export default function StaffPage() {
  return (
    <DesktopOnlyGate description="スタッフ管理はユーザー一覧と権限編集を伴う管理画面のため、画面幅 768px 以上のPCでの利用をお願いします。">
      <StaffManagement />
    </DesktopOnlyGate>
  );
}
