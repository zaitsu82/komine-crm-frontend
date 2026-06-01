import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockShouldUseMockData = jest.fn();
jest.mock('@/lib/api/client', () => ({
  __esModule: true,
  shouldUseMockData: () => mockShouldUseMockData(),
}));

import MockDataBanner from '@/components/mock-data-banner';

/**
 * #176: デモデータ表示中バナー
 */
describe('MockDataBanner', () => {
  afterEach(() => mockShouldUseMockData.mockReset());

  it('モックデータ無効時は何も描画しない（本番相当）', () => {
    mockShouldUseMockData.mockReturnValue(false);
    const { container } = render(<MockDataBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('モックデータ有効時はデモデータ表示中であることを明示する', () => {
    mockShouldUseMockData.mockReturnValue(true);
    render(<MockDataBanner />);
    expect(screen.getByText('デモデータ表示中')).toBeInTheDocument();
    expect(
      screen.getByText(/実際の台帳・契約・顧客とは紐づいていません/)
    ).toBeInTheDocument();
  });
});
