'use client';

import { ReactNode } from 'react';

interface FilterSectionProps {
  children: ReactNode;
  resultCount?: number;
  actions?: ReactNode;
}

export function FilterSection({ children, resultCount, actions }: FilterSectionProps) {
  return (
    <div className="bg-white border-b border-gin px-6 py-5">
      {children}

      {(resultCount !== undefined || actions) && (
        <div className="mt-4 pt-4 border-t border-gin flex items-center justify-between">
          {resultCount !== undefined && (
            <p className="text-sm text-hai">
              検索結果: <span className="font-semibold text-sumi">{resultCount}</span> 件
            </p>
          )}
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}
