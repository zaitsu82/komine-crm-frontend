'use client';

import { PlotTabBaseProps } from './types';
import { MasterFallbackSelectItem, ViewModeField, ViewModeSelect } from './ViewModeField';
import { SelectItem } from '@/components/ui/select';
import { LEGACY_FEE_CODE_MAP } from '@/lib/master-resolve';

export function FeeInfoTab({
  register,
  watch,
  setValue,
  errors,
  viewMode = false,
  masterData,
}: PlotTabBaseProps) {
  // 使用料の有無を判定
  const hasUsageFee = watch('usageFee') !== null && watch('usageFee') !== undefined;
  // 管理料の有無を判定
  const hasManagementFee = watch('managementFee') !== null && watch('managementFee') !== undefined;

  // 使用料をトグル
  const toggleUsageFee = () => {
    if (hasUsageFee) {
      setValue('usageFee', null);
    } else {
      setValue('usageFee', {
        calculationType: null,
        taxType: null,
        billingType: null,
        billingYears: null,
        usageFee: null,
        area: null,
        unitPrice: null,
        paymentMethod: null,
      });
    }
  };

  // 管理料をトグル
  const toggleManagementFee = () => {
    if (hasManagementFee) {
      setValue('managementFee', null);
    } else {
      setValue('managementFee', {
        calculationType: null,
        taxType: null,
        billingType: null,
        billingYears: null,
        area: null,
        billingMonth: null,
        managementFee: null,
        unitPrice: null,
        lastBillingMonth: null,
        paymentMethod: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: 使用料 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sumi">使用料</h3>
          {!viewMode && (
            <button
              type="button"
              onClick={toggleUsageFee}
              className="px-3 py-1 text-sm bg-matsu text-white rounded hover:bg-matsu-dark"
            >
              {hasUsageFee ? '使用料を削除' : '使用料を追加'}
            </button>
          )}
        </div>

        {!hasUsageFee && (
          <div className="text-center text-hai py-8 border rounded-lg bg-kinari/30">
            使用料が登録されていません
          </div>
        )}

        {hasUsageFee && (
          <div className="grid grid-cols-3 gap-4">
            <ViewModeSelect
              label="計算区分"
              value={watch('usageFee.calculationType') || ''}
              onValueChange={(v) => setValue('usageFee.calculationType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.calcTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('usageFee.calculationType')}
                masters={masterData?.all?.calcTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.calc}
              />
            </ViewModeSelect>

            <ViewModeSelect
              label="税区分"
              value={watch('usageFee.taxType') || ''}
              onValueChange={(v) => setValue('usageFee.taxType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.taxTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('usageFee.taxType')}
                masters={masterData?.all?.taxTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.tax}
              />
            </ViewModeSelect>

            <ViewModeSelect
              label="請求区分"
              value={watch('usageFee.billingType') || ''}
              onValueChange={(v) => setValue('usageFee.billingType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.billingTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('usageFee.billingType')}
                masters={masterData?.all?.billingTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.billing}
              />
            </ViewModeSelect>

            <ViewModeField
              label="請求年数"
              viewMode={viewMode}
              register={register('usageFee.billingYears')}
              error={errors.usageFee?.billingYears?.message}
              placeholder="5"
            />

            <ViewModeField
              label="面積"
              viewMode={viewMode}
              register={register('usageFee.area')}
              error={errors.usageFee?.area?.message}
              placeholder="3.6"
            />

            <ViewModeField
              label="単価"
              viewMode={viewMode}
              register={register('usageFee.unitPrice')}
              error={errors.usageFee?.unitPrice?.message}
              placeholder="10000"
            />

            <ViewModeField
              label="使用料"
              viewMode={viewMode}
              register={register('usageFee.usageFee')}
              error={errors.usageFee?.usageFee?.message}
              placeholder="36000"
            />

            <ViewModeSelect
              label="送付方法"
              value={watch('usageFee.paymentMethod') || ''}
              onValueChange={(v) => setValue('usageFee.paymentMethod', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.paymentMethods.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              {/* 送付方法（旧 shiharai）は旧コードの意味が不明なため legacyMap 無し（#177 と同方針） */}
              <MasterFallbackSelectItem
                value={watch('usageFee.paymentMethod')}
                masters={masterData?.all?.paymentMethods ?? []}
              />
            </ViewModeSelect>
          </div>
        )}
      </div>

      {/* Section 2: 管理料 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sumi">管理料</h3>
          {!viewMode && (
            <button
              type="button"
              onClick={toggleManagementFee}
              className="px-3 py-1 text-sm bg-matsu text-white rounded hover:bg-matsu-dark"
            >
              {hasManagementFee ? '管理料を削除' : '管理料を追加'}
            </button>
          )}
        </div>

        {!hasManagementFee && (
          <div className="text-center text-hai py-8 border rounded-lg bg-kinari/30">
            管理料が登録されていません
          </div>
        )}

        {hasManagementFee && (
          <div className="grid grid-cols-3 gap-4">
            <ViewModeSelect
              label="計算区分"
              value={watch('managementFee.calculationType') || ''}
              onValueChange={(v) => setValue('managementFee.calculationType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.calcTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('managementFee.calculationType')}
                masters={masterData?.all?.calcTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.calc}
              />
            </ViewModeSelect>

            <ViewModeSelect
              label="税区分"
              value={watch('managementFee.taxType') || ''}
              onValueChange={(v) => setValue('managementFee.taxType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.taxTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('managementFee.taxType')}
                masters={masterData?.all?.taxTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.tax}
              />
            </ViewModeSelect>

            <ViewModeSelect
              label="請求区分"
              value={watch('managementFee.billingType') || ''}
              onValueChange={(v) => setValue('managementFee.billingType', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.billingTypes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              <MasterFallbackSelectItem
                value={watch('managementFee.billingType')}
                masters={masterData?.all?.billingTypes ?? []}
                legacyMap={LEGACY_FEE_CODE_MAP.billing}
              />
            </ViewModeSelect>

            <ViewModeField
              label="請求年数"
              viewMode={viewMode}
              register={register('managementFee.billingYears')}
              error={errors.managementFee?.billingYears?.message}
              placeholder="5"
            />

            <ViewModeField
              label="面積"
              viewMode={viewMode}
              register={register('managementFee.area')}
              error={errors.managementFee?.area?.message}
              placeholder="3.6"
            />

            <ViewModeField
              label="請求月"
              viewMode={viewMode}
              register={register('managementFee.billingMonth')}
              error={errors.managementFee?.billingMonth?.message}
              placeholder="4"
            />

            <ViewModeField
              label="管理料"
              viewMode={viewMode}
              register={register('managementFee.managementFee')}
              error={errors.managementFee?.managementFee?.message}
              placeholder="12000"
            />

            <ViewModeField
              label="単価"
              viewMode={viewMode}
              register={register('managementFee.unitPrice')}
              error={errors.managementFee?.unitPrice?.message}
              placeholder="3000"
            />

            <ViewModeField
              label="終納請求年月"
              viewMode={viewMode}
              register={register('managementFee.lastBillingMonth')}
              error={errors.managementFee?.lastBillingMonth?.message}
              placeholder="2024年4月"
            />

            <ViewModeSelect
              label="送付方法"
              value={watch('managementFee.paymentMethod') || ''}
              onValueChange={(v) => setValue('managementFee.paymentMethod', v)}
              viewMode={viewMode}
              placeholder="選択..."
            >
              {masterData?.paymentMethods.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
              {/* 送付方法（旧 shiharai）は旧コードの意味が不明なため legacyMap 無し（#177 と同方針） */}
              <MasterFallbackSelectItem
                value={watch('managementFee.paymentMethod')}
                masters={masterData?.all?.paymentMethods ?? []}
              />
            </ViewModeSelect>
          </div>
        )}
      </div>
    </div>
  );
}
