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
} from 'lucide-react';

export type TemplateId = 'invoice' | 'postcard' | 'contract' | 'permit' | 'other';

export interface TemplateOption {
  id: TemplateId;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  hasTemplate: boolean;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'invoice',
    label: '請求書',
    description:
      '管理費・使用料などの請求書を作成します。明細行の追加・編集が可能です。',
    icon: <FileText className="h-8 w-8" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    hasTemplate: true,
  },
  {
    id: 'postcard',
    label: 'はがき',
    description:
      '案内状・お知らせ等のはがきを作成します。宛先・差出人情報を入力できます。',
    icon: <Mail className="h-8 w-8" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-400',
    hasTemplate: true,
  },
  {
    id: 'contract',
    label: '契約書',
    description: '区画の使用契約書を作成します。契約条件を入力して出力できます。',
    icon: <FileCheck className="h-8 w-8" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200 hover:border-amber-400',
    hasTemplate: false,
  },
  {
    id: 'permit',
    label: '許可証',
    description: '改葬許可証などの各種許可書類を作成します。',
    icon: <FileBadge className="h-8 w-8" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    hasTemplate: false,
  },
  {
    id: 'other',
    label: 'その他',
    description: '上記に当てはまらないその他の書類を作成します。自由に入力できます。',
    icon: <File className="h-8 w-8" />,
    color: 'text-sumi-700',
    bgColor: 'bg-sumi-50',
    borderColor: 'border-sumi-200 hover:border-sumi-400',
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
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-sumi-900">書類管理</h2>
          <p className="text-sumi-500 mt-1">
            テンプレートを選択して書類を作成できます
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onViewHistory}
          className="border-sumi-300"
        >
          <History className="mr-2 h-4 w-4" />
          作成済み書類一覧
        </Button>
      </div>

      {/* テンプレートカード */}
      <div>
        <h3 className="text-lg font-semibold text-sumi-800 mb-4">
          テンプレートから作成
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`text-left p-6 rounded-lg border-2 transition-all duration-200 ${tmpl.borderColor} ${tmpl.bgColor} hover:shadow-md group`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${tmpl.color} p-3 rounded-lg bg-white shadow-sm group-hover:scale-105 transition-transform`}
                >
                  {tmpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-lg font-bold ${tmpl.color}`}>
                      {tmpl.label}
                    </h4>
                    {tmpl.hasTemplate && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-sumi-600 border border-sumi-200">
                        PDF対応
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-sumi-600 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className={`h-4 w-4 ${tmpl.color}`} />
                <span className={tmpl.color}>作成する</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
