/**
 * MasterFallbackSelectItem（#238）
 *
 * 無効化済みマスタや未 remap の旧コードを参照する既存データを編集すると
 * Select トリガーが空表示になる問題に対し、現在値を表す SelectItem を
 * 1件だけ補完描画することを保証する（保存値は元のまま）。
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MasterFallbackSelectItem } from '@/components/plot-form/ViewModeField';
import type { MasterItem } from '@/lib/api';

// Radix UI Select はJSDOMで動かないため最小モック
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="fallback-item" data-value={value}>
      {children}
    </div>
  ),
}));

// 無効を含む全件マスタ（useMasters().allMasters 相当）
const masters: MasterItem[] = [
  { id: 1, code: 'AREA', name: '面積×単価', description: null, sortOrder: 1, isActive: true },
  { id: 2, code: 'FIXED', name: '任意設定', description: null, sortOrder: 2, isActive: false },
];

describe('MasterFallbackSelectItem (#238)', () => {
  it('値が空なら何も描画しない', () => {
    const { container } = render(<MasterFallbackSelectItem value="" masters={masters} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('active マスタの code がそのまま現在値なら補完しない（通常の選択肢で表示される）', () => {
    const { container } = render(<MasterFallbackSelectItem value="AREA" masters={masters} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('無効化済みマスタの code は「名称（無効）」で補完する', () => {
    render(<MasterFallbackSelectItem value="FIXED" masters={masters} />);
    const item = screen.getByTestId('fallback-item');
    expect(item).toHaveTextContent('任意設定（無効）');
    // 保存値は元のまま（表示のみの補完）
    expect(item).toHaveAttribute('data-value', 'FIXED');
  });

  it('旧int値は legacyMap で active マスタへ解決し「名称（旧コード）」で補完する', () => {
    render(
      <MasterFallbackSelectItem value="0" masters={masters} legacyMap={{ '0': 'AREA' }} />,
    );
    const item = screen.getByTestId('fallback-item');
    expect(item).toHaveTextContent('面積×単価（旧コード）');
    expect(item).toHaveAttribute('data-value', '0');
  });

  it('旧int値が無効化済みマスタへ解決された場合は「名称（無効）」', () => {
    render(
      <MasterFallbackSelectItem value="9" masters={masters} legacyMap={{ '9': 'FIXED' }} />,
    );
    expect(screen.getByTestId('fallback-item')).toHaveTextContent('任意設定（無効）');
  });

  it('マスタに存在しない値は「値（既存値）」で補完する', () => {
    render(<MasterFallbackSelectItem value="UNKNOWN" masters={masters} />);
    expect(screen.getByTestId('fallback-item')).toHaveTextContent('UNKNOWN（既存値）');
  });

  it('matchBy=name: active マスタの名称なら補完しない（続柄は名称を保存）', () => {
    const { container } = render(
      <MasterFallbackSelectItem value="面積×単価" masters={masters} matchBy="name" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('matchBy=name: 無効化済みマスタの名称は「名称（無効）」で補完する', () => {
    render(<MasterFallbackSelectItem value="任意設定" masters={masters} matchBy="name" />);
    const item = screen.getByTestId('fallback-item');
    expect(item).toHaveTextContent('任意設定（無効）');
    expect(item).toHaveAttribute('data-value', '任意設定');
  });
});
