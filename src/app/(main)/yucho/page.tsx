'use client';

import { RoleGuard } from '@/components/auth-guard';
import YuchoManagement from '@/components/yucho/YuchoManagement';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';

export default function YuchoPage() {
  return (
    <RoleGuard requiredRoles={['manager', 'admin']}>
      <DesktopOnlyGate description="ゆうちょ連携は抽出条件指定とCSVダウンロードを伴うため、画面幅 768px 以上のPCでの利用をお願いします。">
        <YuchoManagement />
      </DesktopOnlyGate>
    </RoleGuard>
  );
}
