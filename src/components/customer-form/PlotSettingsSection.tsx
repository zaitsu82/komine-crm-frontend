'use client';

import { useState } from 'react';
import { OwnedPlot, PLOT_SIZE, PLOT_SIZE_LABELS, PlotSizeType, PlotPeriod, PLOT_SECTIONS_BY_PERIOD } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateOwnedPlotsInfo } from '@/lib/utils';
import { PlotSettingsSectionProps } from './types';

export function PlotSettingsSection({ customer }: PlotSettingsSectionProps) {
  const [ownedPlots, setOwnedPlots] = useState<OwnedPlot[]>(customer?.ownedPlots || []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlot, setNewPlot] = useState<Partial<OwnedPlot>>({
    sizeType: 'full',
    areaSqm: PLOT_SIZE.FULL,
    status: 'available',
  });

  const handleAddPlot = () => {
    if (!newPlot.plotNumber) return;

    const plot: OwnedPlot = {
      id: `plot-${Date.now()}`,
      plotNumber: newPlot.plotNumber,
      plotPeriod: newPlot.plotPeriod as PlotPeriod,
      section: newPlot.section,
      sizeType: newPlot.sizeType || 'full',
      areaSqm: newPlot.areaSqm || PLOT_SIZE.FULL,
      purchaseDate: newPlot.purchaseDate,
      price: newPlot.price,
      status: newPlot.status || 'available',
      notes: newPlot.notes,
    };

    const updatedPlots = [...ownedPlots, plot];
    setOwnedPlots(updatedPlots);
    setShowAddDialog(false);
    setNewPlot({
      sizeType: 'full',
      areaSqm: PLOT_SIZE.FULL,
      status: 'available',
    });
  };

  const handleDeletePlot = (plotId: string) => {
    const updatedPlots = ownedPlots.filter(p => p.id !== plotId);
    setOwnedPlots(updatedPlots);
  };

  const handleSizeTypeChange = (sizeType: PlotSizeType) => {
    const areaSqm = sizeType === 'full' ? PLOT_SIZE.FULL : PLOT_SIZE.HALF;
    setNewPlot({ ...newPlot, sizeType, areaSqm });
  };

  const plotsInfo = calculateOwnedPlotsInfo(ownedPlots);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-semibold">区画設定</h3>
        <Button
          type="button"
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          + 区画を追加
        </Button>
      </div>

      {/* 区画管理仕様の説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>区画管理仕様:</strong><br />
          ・基本ルール: 1区画 = 3.6平方メートル<br />
          ・必要に応じて 1.8平方メートル×2 に分割して販売可能<br />
          ・複数区画の同一顧客所有（合わせ技）に対応
        </p>
      </div>

      {/* 合計情報 */}
      {ownedPlots.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-green-700">合計面積</Label>
              <div className="text-xl font-bold text-green-800">{plotsInfo.totalAreaSqm}平方メートル</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-green-700">区画数</Label>
              <div className="text-xl font-bold text-green-800">{plotsInfo.plotCount}区画</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-green-700">区画番号</Label>
              <div className="text-xl font-bold text-green-800">{plotsInfo.plotNumbers.join('／')}</div>
            </div>
          </div>
        </div>
      )}

      {/* 区画一覧 */}
      {ownedPlots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">まだ区画が登録されていません</p>
          <p className="text-sm text-gray-400">「+ 区画を追加」ボタンから登録を開始してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ownedPlots.map((plot, index) => (
            <div key={plot.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-lg">{plot.plotNumber}</span>
                  <span className={`px-2 py-1 rounded text-xs ${plot.sizeType === 'full'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                    }`}>
                    {PLOT_SIZE_LABELS[plot.sizeType]}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePlot(plot.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  削除
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">期</Label>
                  <div className="font-medium">{plot.plotPeriod || '-'}</div>
                </div>
                <div>
                  <Label className="text-gray-500">区画詳細</Label>
                  <div className="font-medium">{plot.section || '-'}</div>
                </div>
                <div>
                  <Label className="text-gray-500">面積</Label>
                  <div className="font-medium">{plot.areaSqm}平方メートル</div>
                </div>
                <div>
                  <Label className="text-gray-500">利用状況</Label>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${plot.status === 'in_use'
                      ? 'bg-green-100 text-green-800'
                      : plot.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {plot.status === 'in_use' ? '利用中' :
                        plot.status === 'reserved' ? '予約済み' : '空き'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">購入金額</Label>
                  <div className="font-medium">
                    {plot.price ? `¥${plot.price.toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 区画追加ダイアログ */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">区画を追加</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    区画番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="例: C-29"
                    value={newPlot.plotNumber || ''}
                    onChange={(e) => setNewPlot({ ...newPlot, plotNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">サイズ</Label>
                  <Select
                    value={newPlot.sizeType || 'full'}
                    onValueChange={(value) => handleSizeTypeChange(value as PlotSizeType)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">1区画（3.6平方メートル）</SelectItem>
                      <SelectItem value="half">半区画（1.8平方メートル）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">期</Label>
                  <Select
                    value={newPlot.plotPeriod || ''}
                    onValueChange={(value) => {
                      setNewPlot({ ...newPlot, plotPeriod: value as PlotPeriod, section: '' });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="期を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1期">1期</SelectItem>
                      <SelectItem value="2期">2期</SelectItem>
                      <SelectItem value="3期">3期</SelectItem>
                      <SelectItem value="4期">4期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">区画詳細</Label>
                  <Select
                    value={newPlot.section || ''}
                    onValueChange={(value) => setNewPlot({ ...newPlot, section: value })}
                    disabled={!newPlot.plotPeriod}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={newPlot.plotPeriod ? '区画を選択' : '先に期を選択'} />
                    </SelectTrigger>
                    <SelectContent>
                      {newPlot.plotPeriod && PLOT_SECTIONS_BY_PERIOD[newPlot.plotPeriod as PlotPeriod]?.map((section) => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">利用状況</Label>
                  <Select
                    value={newPlot.status || 'available'}
                    onValueChange={(value) => setNewPlot({ ...newPlot, status: value as OwnedPlot['status'] })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">空き</SelectItem>
                      <SelectItem value="reserved">予約済み</SelectItem>
                      <SelectItem value="in_use">利用中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">購入金額（円）</Label>
                  <Input
                    type="number"
                    placeholder="例: 270000"
                    value={newPlot.price || ''}
                    onChange={(e) => setNewPlot({ ...newPlot, price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">備考</Label>
                <Input
                  placeholder="特記事項があれば入力"
                  value={newPlot.notes || ''}
                  onChange={(e) => setNewPlot({ ...newPlot, notes: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewPlot({
                    sizeType: 'full',
                    areaSqm: PLOT_SIZE.FULL,
                    status: 'available',
                  });
                }}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleAddPlot}
                disabled={!newPlot.plotNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                追加
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
