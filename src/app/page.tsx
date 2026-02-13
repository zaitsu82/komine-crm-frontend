'use client';

import PlotManagement from '@/components/plot-management';
import { AuthGuard } from '@/components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <PlotManagement initialView="registry" />
    </AuthGuard>
  );
}
