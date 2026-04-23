'use client';

import { Button } from '@/components/ui/button';
import {
  FileText,
  Mail,
  FileCheck,
  FileBadge,
  File,
  Plus,
  History,
  Landmark,
} from 'lucide-react';

export type TemplateId =
  | 'invoice'
  | 'postcard'
  | 'contract'
  | 'permit'
  | 'payment-guide'
  | 'other';

type TemplateTheme = 'matsu' | 'cha' | 'ai' | 'kohaku' | 'sumi';

export interface TemplateOption {
  id: TemplateId;
  label: string;
  description: string;
  icon: React.ReactNode;
  theme: TemplateTheme;
  hasTemplate: boolean;
}

// ブランドカラーにマッピング（theme → Tailwind クラス）
const THEME_STYLES: Record<TemplateTheme, {
  iconBg: string;
  iconText: string;
  borderHover: string;
  titleText: string;
  linkText: string;
  accent: string;
}> = {
  matsu: {
    iconBg: 'bg-matsu/10',
    iconText: 'text-matsu',
    borderHover: 'hover:border-matsu/50',
    titleText: 'text-matsu-dark',
    linkText: 'text-matsu',
    accent: 'bg-gradient-matsu',
  },
  cha: {
    iconBg: 'bg-cha/10',
    iconText: 'text-cha',
    borderHover: 'hover:border-cha/50',
    titleText: 'text-cha-dark',
    linkText: 'text-cha',
    accent: 'bg-gradient-cha',
  },
  ai: {
    iconBg: 'bg-ai/10',
    iconText: 'text-ai',
    borderHover: 'hover:border-ai/50',
    titleText: 'text-ai-dark',
    linkText: 'text-ai',
    accent: 'bg-gradient-ai',
  },
  kohaku: {
    iconBg: 'bg-kohaku/10',
    iconText: 'text-kohaku',
    borderHover: 'hover:border-kohaku/50',
    titleText: 'text-kohaku-dark',
    linkText: 'text-kohaku',
    accent: 'bg-gradient-kohaku',
  },
  sumi: {
    iconBg: 'bg-sumi/10',
    iconText: 'text-sumi',
    borderHover: 'hover:border-sumi/50',
    titleText: 'text-sumi',
    linkText: 'text-sumi',
    accent: 'bg-gradient-sumi',
  },
};

const TEMPLATES: TemplateOption[] = [
  {
    id: 'invoice',
    label: '護持費のお知らせ',
    description:
      '護持費（管理費）の更新案内書を作成します。宛名・年数・金額などを入力してPDF出力できます。',
    icon: <FileText className="h-7 w-7" />,
    theme: 'ai',
    hasTemplate: true,
  },
  {
    id: 'postcard',
    label: 'はがき',
    description:
      '案内状・お知らせ等のはがきを作成します。宛先・差出人情報を入力できます。',
    icon: <Mail className="h-7 w-7" />,
    theme: 'matsu',
    hasTemplate: true,
  },
  {
    id: 'contract',
    label: '契約書',
    description: '区画の使用契約書を作成します。契約条件を入力して出力できます。',
    icon: <FileCheck className="h-7 w-7" />,
    theme: 'kohaku',
    hasTemplate: false,
  },
  {
    id: 'permit',
    label: '許可証',
    description:
      '永代使用許可証書と送付用封筒のテンプレートPDFに、必要項目を印字して作成します。',
    icon: <FileBadge className="h-7 w-7" />,
    theme: 'cha',
    hasTemplate: true,
  },
  {
    id: 'payment-guide',
    label: 'お支払い方法のご案内',
    description:
      '管理料のお支払い方法・振込先（信用金庫 / ゆうちょ）・注意事項などを印字した案内書を作成します。',
    icon: <Landmark className="h-7 w-7" />,
    theme: 'matsu',
    hasTemplate: true,
  },
  {
    id: 'other',
    label: 'その他',
    description: '上記に当てはまらないその他の書類を作成します。自由に入力できます。',
    icon: <File className="h-7 w-7" />,
    theme: 'sumi',
    hasTemplate: false,
  },
];

interface DocumentTemplateGalleryProps {
  onSelectTemplate: (templateId: TemplateId) => void;
  onViewHistory: () => void;
}

export function DocumentTemplateGallery({
  onSelectTemplate,
  onViewHistory,
}: DocumentTemplateGalleryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-mincho text-lg md:text-xl font-semibold text-sumi">
            テンプレートから作成
          </h3>
          <p className="text-xs md:text-sm text-hai mt-0.5">
            テンプレートを選択して書類を作成できます
          </p>
        </div>
        <Button variant="outline" onClick={onViewHistory}>
          <History className="mr-2 h-4 w-4" />
          作成済み書類一覧
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((tmpl) => {
          const s = THEME_STYLES[tmpl.theme];
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`relative text-left rounded-elegant-lg border border-gin bg-white p-5 transition-all duration-200 ${s.borderHover} hover:shadow-elegant-sm group overflow-hidden`}
            >
              <span
                aria-hidden
                className={`absolute top-0 left-0 h-1 w-full ${s.accent}`}
              />
              <div className="flex items-start gap-3">
                <div
                  className={`${s.iconBg} ${s.iconText} p-3 rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {tmpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`text-base font-semibold ${s.titleText}`}>
                      {tmpl.label}
                    </h4>
                    {tmpl.hasTemplate && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-kinari text-sumi border border-gin font-medium">
                        PDF対応
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-hai leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>
              <div
                className={`mt-4 flex items-center text-xs font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${s.linkText}`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>作成する</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
