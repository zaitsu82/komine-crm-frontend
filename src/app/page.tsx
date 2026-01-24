'use client';

import CustomerManagement from '@/components/customer-management';
import { AuthGuard } from '@/components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <CustomerManagement initialView="registry" />
    </AuthGuard>
  );
}
