'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
        }}
      />
    </AuthProvider>
  );
}
