'use client';

import { ReactNode } from 'react';

type ColorTheme = 'matsu' | 'cha' | 'ai' | 'sumi' | 'kohaku';

const themeStyles: Record<ColorTheme, { bg: string; border: string; iconBg: string }> = {
  matsu: {
    bg: 'bg-gradient-to-r from-matsu-50 to-kinari',
    border: 'border-matsu-100',
    iconBg: 'bg-gradient-to-br from-matsu to-matsu-dark shadow-elegant-sm',
  },
  cha: {
    bg: 'bg-gradient-to-r from-cha-50 to-kinari',
    border: 'border-cha-200',
    iconBg: 'bg-gradient-cha shadow-cha',
  },
  ai: {
    bg: 'bg-gradient-to-r from-ai-50 to-kinari',
    border: 'border-ai-100',
    iconBg: 'bg-gradient-to-br from-ai to-ai-dark shadow-elegant-sm',
  },
  sumi: {
    bg: 'bg-gradient-to-r from-sumi-50 to-kinari',
    border: 'border-gin',
    iconBg: 'bg-gradient-to-br from-sumi to-sumi-light shadow-elegant-sm',
  },
  kohaku: {
    bg: 'bg-gradient-to-r from-kohaku-50 to-kinari',
    border: 'border-kohaku-100',
    iconBg: 'bg-gradient-to-br from-kohaku to-kohaku-dark shadow-elegant-sm',
  },
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  theme: ColorTheme;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, theme, actions }: PageHeaderProps) {
  const styles = themeStyles[theme];

  return (
    <div className={`${styles.bg} border-b ${styles.border} px-6 py-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">{title}</h2>
            {subtitle && (
              <p className="text-sm text-hai mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
