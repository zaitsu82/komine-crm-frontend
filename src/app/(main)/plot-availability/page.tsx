'use client';

import { Suspense } from 'react';
import PlotAvailabilityManagement from '@/components/plot-availability-management';

export default function PlotAvailabilityPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-gradient-warm" />}>
      <PlotAvailabilityManagement />
    </Suspense>
  );
}
