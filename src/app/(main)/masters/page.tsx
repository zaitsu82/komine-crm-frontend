'use client';

import { RoleGuard } from '@/components/auth-guard';
import MastersManagement from '@/components/masters-management';

export default function MastersPage() {
  return (
    <RoleGuard requiredRoles={['admin']}>
      <MastersManagement />
    </RoleGuard>
  );
}
