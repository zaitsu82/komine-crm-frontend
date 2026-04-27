'use client';

import { RoleGuard } from '@/components/auth-guard';
import BulkImportPage from '@/components/bulk-import';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';

export default function BulkImportRoute() {
  return (
    <RoleGuard requiredRoles={['manager', 'admin']}>
      <DesktopOnlyGate description="一括登録・編集はCSVアップロードと列マッピング操作を伴うため、画面幅 768px 以上のPCでの利用をお願いします。">
        <BulkImportPage />
      </DesktopOnlyGate>
    </RoleGuard>
  );
}
