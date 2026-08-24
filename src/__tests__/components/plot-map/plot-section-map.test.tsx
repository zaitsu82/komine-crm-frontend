/**
 * 区画図: マスをクリックすると要約が出る
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { PlotSectionMap } from '@/components/plot-map/PlotSectionMap';
import type { PlotMapOverlayPlot } from '@/lib/plot-maps/types';

const plots: PlotMapOverlayPlot[] = [
  {
    id: 'pp-97',
    plotNumber: '1-97',
    displayNumber: '1-97',
    areaName: '1',
    areaSqm: 1,
    overlayStatus: 'vacant',
    contractorName: null,
    reservationDate: null,
    contractPlotId: null,
  },
  {
    id: 'pp-90',
    plotNumber: '1-90',
    displayNumber: '1-90',
    areaName: '1',
    areaSqm: 1,
    overlayStatus: 'contracted',
    contractorName: '柴田',
    reservationDate: null,
    contractPlotId: 'cp-90',
  },
];

describe('PlotSectionMap', () => {
  it('2期1区の地図タイトルと凡例を出す', () => {
    render(<PlotSectionMap mapId="2-1" plots={plots} onClose={() => undefined} />);

    expect(screen.getByRole('region', { name: '第2期 1区 区画図' })).toBeInTheDocument();
    expect(screen.getByText('地図を閉じる')).toBeInTheDocument();
    expect(screen.getByText('売却不可')).toBeInTheDocument();
  });

  it('空きマスをクリックすると右パネルに区画番号と空きが出る', async () => {
    const user = userEvent.setup();
    render(<PlotSectionMap mapId="2-1" plots={plots} onClose={() => undefined} />);

    await user.click(screen.getByRole('button', { name: '97番 空き' }));

    expect(screen.getByText('97番')).toBeInTheDocument();
    expect(screen.getByText('新規登録へ')).toBeInTheDocument();
  });

  it('契約済みマスから台帳へ進める', async () => {
    const user = userEvent.setup();
    render(<PlotSectionMap mapId="2-1" plots={plots} onClose={() => undefined} />);

    await user.click(screen.getByRole('button', { name: '90番 柴田' }));

    expect(screen.getByRole('link', { name: '台帳を開く' })).toHaveAttribute('href', '/plots/cp-90');
  });
});
