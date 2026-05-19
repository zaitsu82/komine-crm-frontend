'use client';

import { useState } from 'react';
import { PlotTabBaseProps } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';
import { SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';
import { Gender, ContractRole, PaymentStatus } from '@komine/types';

export function BasicInfoTab({
  register,
  watch,
  setValue,
  errors,
  viewMode = false,
  masterData,
}: PlotTabBaseProps) {
  // マスタデータから期→区画名のマッピングを構築
  const { periods, sectionsByPeriod } = useMemo(() => {
    const items = masterData?.sectionNames || [];
    const periodSet = new Set<string>();
    const map: Record<string, string[]> = {};
    for (const item of items) {
      periodSet.add(item.period);
      if (!map[item.period]) map[item.period] = [];
      map[item.period].push(item.name);
    }
    return { periods: Array.from(periodSet), sectionsByPeriod: map };
  }, [masterData?.sectionNames]);

  // 現在のareaNameから所属する期を特定
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const currentAreaName = watch('physicalPlot.areaName');
    for (const [period, sections] of Object.entries(sectionsByPeriod)) {
      if (sections.includes(currentAreaName)) return period;
    }
    return '';
  });

  return (
    <div className="space-y-6">
      {/* Section 1: 物理区画情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-sumi mb-3">物理区画情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="区画番号"
            viewMode={viewMode}
            required
            register={register('physicalPlot.plotNumber')}
            error={errors.physicalPlot?.plotNumber?.message}
            placeholder="例: A-001"
          />

          {/* 区画の選択 - 期→区画の2段階セレクト */}
          <div>
            <Label className="text-sm font-medium">
              区画
              <span className="text-beni"> *</span>
            </Label>
            {viewMode ? (
              <div className="mt-1 px-3 py-2 bg-kohaku-50 border rounded-md min-h-[38px] text-sm">
                {watch('physicalPlot.areaName') || '-'}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 期の選択 */}
                <ViewModeSelect
                  label=""
                  value={selectedPeriod}
                  onValueChange={(v) => {
                    setSelectedPeriod(v);
                    setValue('physicalPlot.areaName', '');
                  }}
                  placeholder="期を選択..."
                >
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </ViewModeSelect>

                {/* 区画の選択 */}
                {selectedPeriod && (
                  <ViewModeSelect
                    label=""
                    value={watch('physicalPlot.areaName') || ''}
                    onValueChange={(v) => setValue('physicalPlot.areaName', v)}
                    placeholder="区画を選択..."
                  >
                    {sectionsByPeriod[selectedPeriod]?.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </ViewModeSelect>
                )}
              </div>
            )}
            {errors.physicalPlot?.areaName && (
              <p className="text-beni text-sm mt-1">{errors.physicalPlot.areaName.message}</p>
            )}
          </div>

          <ViewModeField
            label="面積(㎡)"
            viewMode={viewMode}
            type="number"
            register={register('physicalPlot.areaSqm')}
            error={errors.physicalPlot?.areaSqm?.message}
            placeholder="3.6"
          />
        </div>
      </div>

      {/* Section 2: 契約区画情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-sumi mb-3">契約区画情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <ViewModeField
            label="契約面積(㎡)"
            viewMode={viewMode}
            required
            type="number"
            register={register('contractPlot.contractAreaSqm')}
            error={errors.contractPlot?.contractAreaSqm?.message}
            placeholder="3.6"
          />

          <ViewModeField
            label="区画位置詳細"
            viewMode={viewMode}
            register={register('contractPlot.locationDescription')}
            error={errors.contractPlot?.locationDescription?.message}
            placeholder="例: 北側中央付近"
          />
        </div>
      </div>

      {/* Section 3: 販売契約情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-sumi mb-3">販売契約情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="契約日"
            viewMode={viewMode}
            required
            type="date"
            register={register('saleContract.contractDate')}
            error={errors.saleContract?.contractDate?.message}
          />

          <ViewModeField
            label="金額"
            viewMode={viewMode}
            required
            type="number"
            register={register('saleContract.price')}
            error={errors.saleContract?.price?.message}
            placeholder="0"
          />

          <ViewModeSelect
            label="支払状態"
            value={watch('saleContract.paymentStatus') || ''}
            onValueChange={(v) => setValue('saleContract.paymentStatus', v as PaymentStatus)}
            viewMode={viewMode}
            placeholder="選択..."
          >
            <SelectItem value={PaymentStatus.Unpaid}>未払い</SelectItem>
            <SelectItem value={PaymentStatus.PartialPaid}>一部支払済</SelectItem>
            <SelectItem value={PaymentStatus.Paid}>支払済</SelectItem>
            <SelectItem value={PaymentStatus.Overdue}>延滞</SelectItem>
            <SelectItem value={PaymentStatus.Refunded}>返金済</SelectItem>
          </ViewModeSelect>

          <ViewModeField
            label="予約日"
            viewMode={viewMode}
            type="date"
            register={register('saleContract.reservationDate')}
            error={errors.saleContract?.reservationDate?.message}
          />

          <ViewModeField
            label="受付番号"
            viewMode={viewMode}
            register={register('saleContract.acceptanceNumber')}
            error={errors.saleContract?.acceptanceNumber?.message}
            placeholder="例: R2024-001"
          />

          <ViewModeField
            label="許可日"
            viewMode={viewMode}
            type="date"
            register={register('saleContract.permitDate')}
            error={errors.saleContract?.permitDate?.message}
          />

          <ViewModeField
            label="平成書番号"
            viewMode={viewMode}
            register={register('saleContract.permitNumber')}
            error={errors.saleContract?.permitNumber?.message}
            placeholder="例: P2024-001"
          />

          <ViewModeField
            label="使用開始日"
            viewMode={viewMode}
            type="date"
            register={register('saleContract.startDate')}
            error={errors.saleContract?.startDate?.message}
          />

          <ViewModeField
            label="受付日"
            viewMode={viewMode}
            type="date"
            register={register('saleContract.acceptanceDate')}
            error={errors.saleContract?.acceptanceDate?.message}
          />

          <ViewModeField
            label="担当者"
            viewMode={viewMode}
            register={register('saleContract.staffInCharge')}
            error={errors.saleContract?.staffInCharge?.message}
            placeholder="担当者名"
          />

          <ViewModeField
            label="取扱"
            viewMode={viewMode}
            register={register('saleContract.agentName')}
            error={errors.saleContract?.agentName?.message}
            placeholder="販売代理店名"
          />
        </div>
      </div>

      {/* Section 4: 契約者情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-sumi mb-3">契約者情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="氏名"
            viewMode={viewMode}
            required
            register={register('customer.name')}
            error={errors.customer?.name?.message}
            placeholder="山田 太郎"
          />

          <ViewModeField
            label="氏名カナ"
            viewMode={viewMode}
            required
            register={register('customer.nameKana')}
            error={errors.customer?.nameKana?.message}
            placeholder="ヤマダ タロウ"
          />

          <ViewModeField
            label="生年月日"
            viewMode={viewMode}
            type="date"
            register={register('customer.birthDate')}
            error={errors.customer?.birthDate?.message}
          />

          <ViewModeSelect
            label="性別"
            value={watch('customer.gender') || ''}
            onValueChange={(v) => setValue('customer.gender', v as Gender)}
            viewMode={viewMode}
            placeholder="選択..."
          >
            <SelectItem value={Gender.Male}>男性</SelectItem>
            <SelectItem value={Gender.Female}>女性</SelectItem>
            <SelectItem value={Gender.NotAnswered}>未回答</SelectItem>
          </ViewModeSelect>

          <ViewModeField
            label="郵便番号"
            viewMode={viewMode}
            required
            register={register('customer.postalCode')}
            error={errors.customer?.postalCode?.message}
            placeholder="1234567（ハイフンなし7桁）"
          />

          <div className="col-span-3">
            <ViewModeField
              label="住所"
              viewMode={viewMode}
              required
              register={register('customer.address')}
              error={errors.customer?.address?.message}
              placeholder="東京都渋谷区..."
            />
          </div>

          <div className="col-span-3">
            <ViewModeField
              label="住所2"
              viewMode={viewMode}
              register={register('customer.addressLine2')}
              error={errors.customer?.addressLine2?.message}
              placeholder="マンション名・部屋番号等"
            />
          </div>

          <div className="col-span-3">
            <ViewModeField
              label="本籍地"
              viewMode={viewMode}
              register={register('customer.registeredAddress')}
              error={errors.customer?.registeredAddress?.message}
              placeholder="東京都..."
            />
          </div>

          <ViewModeField
            label="電話番号"
            viewMode={viewMode}
            register={register('customer.phoneNumber')}
            error={errors.customer?.phoneNumber?.message}
            placeholder="09012345678（ハイフンなし10-11桁）"
          />

          <ViewModeField
            label="FAX"
            viewMode={viewMode}
            register={register('customer.faxNumber')}
            error={errors.customer?.faxNumber?.message}
            placeholder="0312345678"
          />

          <ViewModeField
            label="メール"
            viewMode={viewMode}
            type="email"
            register={register('customer.email')}
            error={errors.customer?.email?.message}
            placeholder="example@example.com"
          />

          <ViewModeSelect
            label="役割"
            value={watch('customer.role') || ''}
            onValueChange={(v) => setValue('customer.role', v as ContractRole)}
            viewMode={viewMode}
            placeholder="選択..."
          >
            <SelectItem value={ContractRole.Contractor}>契約者</SelectItem>
            <SelectItem value={ContractRole.Applicant}>申込者</SelectItem>
          </ViewModeSelect>
        </div>
      </div>

    </div>
  );
}
