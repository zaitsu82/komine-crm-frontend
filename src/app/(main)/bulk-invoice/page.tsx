'use client';

import { RoleGuard } from '@/components/auth-guard';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';
import BulkInvoicePrint from '@/components/document/bulk-invoice-print';

export default function BulkInvoicePage() {
  return (
    <RoleGuard requiredRoles={['operator', 'manager', 'admin']}>
      <DesktopOnlyGate description="請求書一括印刷は対象一覧の確認とPDFの出力を伴うため、画面幅 768px 以上のPCでの利用をお願いします。">
        <BulkInvoicePrint />
      </DesktopOnlyGate>
    </RoleGuard>
  );
}
