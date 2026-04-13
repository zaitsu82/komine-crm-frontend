'use client';

import { ReactNode } from 'react';
import UserMenu from '@/components/user-menu';
import { ViewType } from '@/types/plot-detail';

type ColorTheme = 'matsu' | 'cha' | 'ai' | 'sumi' | 'kohaku';

const themeStyles: Record<ColorTheme, { iconBg: string }> = {
  matsu: {
    iconBg: 'bg-gradient-to-br from-matsu to-matsu-dark shadow-elegant-sm',
  },
  cha: {
    iconBg: 'bg-gradient-cha shadow-cha',
  },
  ai: {
    iconBg: 'bg-gradient-to-br from-ai to-ai-dark shadow-elegant-sm',
  },
  sumi: {
    iconBg: 'bg-gradient-to-br from-sumi to-sumi-light shadow-elegant-sm',
  },
  kohaku: {
    iconBg: 'bg-gradient-to-br from-kohaku to-kohaku-dark shadow-elegant-sm',
  },
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  theme: ColorTheme;
  onViewChange?: (view: ViewType) => void;
}

export default function PageHeader({ title, subtitle, icon, theme, onViewChange }: PageHeaderProps) {
  const styles = themeStyles[theme];

  return (
    <div className="h-14 md:h-16 border-b border-gin bg-white flex items-center px-3 md:px-5 flex-shrink-0">
      <div className="flex items-center min-w-0 flex-1">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="ml-2 md:ml-3 min-w-0">
          <h2 className="font-mincho text-base md:text-xl font-semibold text-sumi truncate">{title}</h2>
          {subtitle && (
            <p className="text-[10px] md:text-xs text-hai truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {onViewChange && (
        <div className="flex-shrink-0">
          <UserMenu onViewChange={onViewChange} />
        </div>
      )}
    </div>
  );
}
