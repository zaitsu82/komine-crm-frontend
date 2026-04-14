'use client';

import { RoleGuard } from '@/components/auth-guard';
import BulkImportPage from '@/components/bulk-import';

export default function BulkImportRoute() {
  return (
    <RoleGuard requiredRoles={['manager', 'admin']}>
      <BulkImportPage />
    </RoleGuard>
  );
}
