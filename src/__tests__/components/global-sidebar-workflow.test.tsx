/**
 * GlobalSidebar 業務の流れステッパーのテスト（#191 改善）
 *
 * - WORKFLOW_STEPS の各ステップがリンクとして描画される
 * - 現在のページに対応するステップが aria-current="page" になる
 * - 権限のないステップ（viewer の ゆうちょ連携）はリンクにならない
 * - collapsed 時はステッパー自体を表示しない
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalSidebar from '@/components/layout/GlobalSidebar';
import { WORKFLOW_STEPS } from '@/config/navigation';

let mockPathname = '/plots';
let mockRole = 'admin';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'staff-1',
      email: 'test@example.com',
      name: 'テスト太郎',
      role: mockRole,
    },
  }),
}));

function renderSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>> = {}) {
  return render(
    <GlobalSidebar collapsed={false} onToggleCollapse={() => {}} {...props} />
  );
}

describe('GlobalSidebar 業務の流れステッパー', () => {
  beforeEach(() => {
    mockPathname = '/plots';
    mockRole = 'admin';
  });

  it('WORKFLOW_STEPS が業務フロー4画面を順番どおり指す', () => {
    expect(WORKFLOW_STEPS.map(s => s.path)).toEqual([
      '/plots',
      '/plot-availability',
      '/yucho',
      '/collective-burials',
    ]);
  });

  it('admin では全ステップがリンクとして描画される', () => {
    renderSidebar();
    for (const [index, step] of WORKFLOW_STEPS.entries()) {
      const link = screen.getByRole('link', {
        name: new RegExp(`業務の流れ ${index + 1}\\. ${step.label}`),
      });
      expect(link).toHaveAttribute('href', step.path);
    }
  });

  it('現在のページのステップに aria-current="page" が付く', () => {
    mockPathname = '/plot-availability';
    renderSidebar();
    const active = screen.getByRole('link', { name: /業務の流れ 2\. 区画残数管理/ });
    expect(active).toHaveAttribute('aria-current', 'page');
    const inactive = screen.getByRole('link', { name: /業務の流れ 1\. 台帳問い合わせ/ });
    expect(inactive).not.toHaveAttribute('aria-current');
  });

  it('viewer では権限のない ゆうちょ連携 がリンクにならない（ラベルは表示される）', () => {
    mockRole = 'viewer';
    renderSidebar();
    expect(
      screen.queryByRole('link', { name: /業務の流れ 3\. ゆうちょ連携/ })
    ).not.toBeInTheDocument();
    // ステッパー領域には非リンクのラベルとして残る
    const stepper = screen.getByRole('list', { name: '業務の流れ' });
    expect(stepper).toHaveTextContent('ゆうちょ連携');
  });

  it('collapsed 時はステッパーを表示しない', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('業務の流れ')).not.toBeInTheDocument();
  });
});
