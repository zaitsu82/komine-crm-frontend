'use client';

import { ReactNode } from 'react';
import UserMenu from '@/components/user-menu';

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
}

export default function PageHeader({ title, subtitle, icon, theme }: PageHeaderProps) {
  const styles = themeStyles[theme];

  return (
    <div className="h-14 md:h-16 border-b border-gin bg-white flex items-center px-3 md:px-5 flex-shrink-0">
      <button
        onClick={() => window.dispatchEvent(new Event('open-mobile-sidebar'))}
        className="md:hidden p-2 -ml-1 mr-1 rounded-md text-sumi hover:bg-kinari flex-shrink-0"
        aria-label="メニューを開く"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
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
      <div className="flex-shrink-0 ml-4">
        <UserMenu />
      </div>
    </div>
  );
}
