'use client';

import { RoleGuard } from '@/components/auth-guard';
import CollectiveBurialManagement from '@/components/collective-burial';

export default function CollectiveBurialsPage() {
  return (
    <RoleGuard requiredRoles={['manager', 'admin']}>
      <CollectiveBurialManagement />
    </RoleGuard>
  );
}
