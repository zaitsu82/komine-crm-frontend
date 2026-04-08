'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type ThemeOption = {
  value: 'system' | 'light' | 'dark';
  label: string;
  description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'system',
    label: 'システム設定に従う',
    description: 'OSのライト/ダーク設定を自動的に反映します',
  },
  {
    value: 'light',
    label: 'ライト',
    description: '常にライトテーマで表示します',
  },
  {
    value: 'dark',
    label: 'ダーク',
    description: '常にダークテーマで表示します',
  },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes はクライアント側で初期化されるため、
  // SSR とのミスマッチ（FOUC）を防ぐためにマウント後にのみUIを描画する
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme ?? 'system' : 'system';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">表示テーマ</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-hai mb-4">
          画面の表示テーマを選択できます。「システム設定に従う」を選ぶと、OSのライト/ダーク設定が変更されたときに自動的に追従します。
        </p>
        <fieldset className="space-y-2" aria-label="テーマ選択">
          {THEME_OPTIONS.map((option) => {
            const inputId = `theme-option-${option.value}`;
            const isSelected = currentTheme === option.value;
            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={`flex items-start gap-3 p-3 rounded-elegant border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-matsu bg-matsu-50'
                    : 'border-gin hover:bg-kinari'
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setTheme(option.value)}
                  className="mt-1 cursor-pointer"
                  disabled={!mounted}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={inputId}
                    className="font-medium text-sumi cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-hai mt-0.5">{option.description}</p>
                </div>
              </label>
            );
          })}
        </fieldset>
      </CardContent>
    </Card>
  );
}
