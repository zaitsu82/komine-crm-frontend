'use client';

import { RoleGuard } from '@/components/auth-guard';
import MastersManagement from '@/components/masters-management';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';

export default function MastersPage() {
  return (
    <RoleGuard requiredRoles={['admin']}>
      <DesktopOnlyGate description="マスタ管理は表編集の管理画面のため、画面幅 768px 以上のPCでの利用をお願いします。">
        <MastersManagement />
      </DesktopOnlyGate>
    </RoleGuard>
  );
}
