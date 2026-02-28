'use client';

import { ReactNode } from 'react';

export type PageHeaderColor = 'matsu' | 'cha' | 'ai' | 'kohaku' | 'beni';

interface PageHeaderProps {
  color: PageHeaderColor;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
}

const COLOR_MAP: Record<
  PageHeaderColor,
  {
    gradient: string;
    border: string;
    circle: string;
    iconBox: string;
    iconShadow: string;
  }
> = {
  matsu: {
    gradient: 'from-matsu-50 to-kinari',
    border: 'border-matsu-100',
    circle: 'bg-matsu-100/30',
    iconBox: 'bg-gradient-matsu',
    iconShadow: 'shadow-matsu',
  },
  cha: {
    gradient: 'from-cha-50 to-kinari',
    border: 'border-cha-200',
    circle: 'bg-cha-100/30',
    iconBox: 'bg-gradient-cha',
    iconShadow: 'shadow-cha',
  },
  ai: {
    gradient: 'from-ai-50 to-kinari',
    border: 'border-ai-100',
    circle: 'bg-ai-100/30',
    iconBox: 'bg-gradient-ai',
    iconShadow: 'shadow-ai',
  },
  kohaku: {
    gradient: 'from-kohaku-50 to-kinari',
    border: 'border-kohaku-200',
    circle: 'bg-kohaku-100/30',
    iconBox: 'bg-gradient-kohaku',
    iconShadow: 'shadow-kohaku',
  },
  beni: {
    gradient: 'from-beni-50 to-kinari',
    border: 'border-beni-200',
    circle: 'bg-beni-100/30',
    iconBox: 'bg-gradient-beni',
    iconShadow: 'shadow-beni',
  },
};

export function PageHeader({
  color,
  icon,
  title,
  subtitle,
  badge,
  actions,
  legend,
}: PageHeaderProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      className={`bg-gradient-to-r ${c.gradient} border-b ${c.border} px-6 py-5 relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 ${c.circle} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl ${c.iconBox} flex items-center justify-center ${c.iconShadow}`}
          >
            {icon}
          </div>
          <div>
            <h2 className="font-mincho text-2xl font-semibold text-sumi tracking-wide">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-hai mt-0.5">{subtitle}</p>
            )}
            {badge}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>

      {legend && <div className="relative mt-4">{legend}</div>}
    </div>
  );
}
