'use client';

import { useState } from 'react';
import { PlotTabBaseProps } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';
import { SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PLOT_SECTIONS_BY_PERIOD, PlotPeriod } from '@/types/plot-constants';
import { Gender, ContractRole, PaymentStatus } from '@komine/types';

export function BasicInfoTab({
  register,
  watch,
  setValue,
  errors,
  viewMode = false,
  masterData,
}: PlotTabBaseProps) {
  // 現在のareaNameから所属する期を特定
  const [selectedPeriod, setSelectedPeriod] = useState<PlotPeriod | ''>(() => {
    const currentAreaName = watch('physicalPlot.areaName');
    for (const [period, sections] of Object.entries(PLOT_SECTIONS_BY_PERIOD)) {
      if (sections.includes(currentAreaName)) return period as PlotPeriod;
    }
    return '';
  });

  // 使用料の有無を判定
  const hasUsageFee = watch('usageFee') !== null && watch('usageFee') !== undefined;
  // 管理料の有無を判定
  const hasManagementFee = watch('managementFee') !== null && watch('managementFee') !== undefined;
  // 墓石情報の有無を判定
  const hasGravestoneInfo = watch('gravestoneInfo') !== null && watch('gravestoneInfo') !== undefined;

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

  // 墓石情報をトグル
  const toggleGravestoneInfo = () => {
    if (hasGravestoneInfo) {
      setValue('gravestoneInfo', null);
    } else {
      setValue('gravestoneInfo', {
        gravestoneBase: null,
        enclosurePosition: null,
        gravestoneDealer: null,
        gravestoneType: null,
        surroundingArea: null,
        establishmentDeadline: null,
        establishmentDate: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: 物理区画情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">物理区画情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="区画番号"
            viewMode={viewMode}
            required
            register={register('physicalPlot.plotNumber')}
            error={errors.physicalPlot?.plotNumber?.message}
            placeholder="例: A-001"
          />

          {/* 区画（期）の選択 - 2段階セレクト */}
          <div>
            <Label className="text-sm font-medium">
              区画（期）
              <span className="text-red-500"> *</span>
            </Label>
            {viewMode ? (
              <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
                {watch('physicalPlot.areaName') || '-'}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 期の選択 */}
                <ViewModeSelect
                  label=""
                  value={selectedPeriod}
                  onValueChange={(v) => {
                    setSelectedPeriod(v as PlotPeriod);
                    setValue('physicalPlot.areaName', '');
                  }}
                  placeholder="期を選択..."
                >
                  <SelectItem value="1期">1期</SelectItem>
                  <SelectItem value="2期">2期</SelectItem>
                  <SelectItem value="3期">3期</SelectItem>
                  <SelectItem value="4期">4期</SelectItem>
                </ViewModeSelect>

                {/* 区画の選択 */}
                {selectedPeriod && (
                  <ViewModeSelect
                    label=""
                    value={watch('physicalPlot.areaName') || ''}
                    onValueChange={(v) => setValue('physicalPlot.areaName', v)}
                    placeholder="区画を選択..."
                  >
                    {PLOT_SECTIONS_BY_PERIOD[selectedPeriod]?.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </ViewModeSelect>
                )}
              </div>
            )}
            {errors.physicalPlot?.areaName && (
              <p className="text-red-500 text-sm mt-1">{errors.physicalPlot.areaName.message}</p>
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">契約区画情報</h3>
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">販売契約情報</h3>
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
            <SelectItem value={PaymentStatus.Cancelled}>キャンセル</SelectItem>
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
            label="許可番号"
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
        </div>
      </div>

      {/* Section 4: 契約者情報 */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">契約者情報</h3>
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
            required
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

      {/* Section 5: 使用料 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">使用料</h3>
          {!viewMode && (
            <button
              type="button"
              onClick={toggleUsageFee}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {hasUsageFee ? '使用料を削除' : '使用料を追加'}
            </button>
          )}
        </div>

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
              label="支払方法"
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
            </ViewModeSelect>
          </div>
        )}
      </div>

      {/* Section 6: 管理料 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">管理料</h3>
          {!viewMode && (
            <button
              type="button"
              onClick={toggleManagementFee}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {hasManagementFee ? '管理料を削除' : '管理料を追加'}
            </button>
          )}
        </div>

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
              label="最終請求月"
              viewMode={viewMode}
              register={register('managementFee.lastBillingMonth')}
              error={errors.managementFee?.lastBillingMonth?.message}
              placeholder="2024-04"
            />

            <ViewModeSelect
              label="支払方法"
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
            </ViewModeSelect>
          </div>
        )}
      </div>

      {/* Section 7: 墓石情報 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">墓石情報</h3>
          {!viewMode && (
            <button
              type="button"
              onClick={toggleGravestoneInfo}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {hasGravestoneInfo ? '墓石情報を削除' : '墓石情報を追加'}
            </button>
          )}
        </div>

        {hasGravestoneInfo && (
          <div className="grid grid-cols-3 gap-4">
            <ViewModeField
              label="墓石台"
              viewMode={viewMode}
              register={register('gravestoneInfo.gravestoneBase')}
              error={errors.gravestoneInfo?.gravestoneBase?.message}
              placeholder="御影石"
            />

            <ViewModeField
              label="外柵位置"
              viewMode={viewMode}
              register={register('gravestoneInfo.enclosurePosition')}
              error={errors.gravestoneInfo?.enclosurePosition?.message}
              placeholder="東側"
            />

            <ViewModeField
              label="石材店"
              viewMode={viewMode}
              register={register('gravestoneInfo.gravestoneDealer')}
              error={errors.gravestoneInfo?.gravestoneDealer?.message}
              placeholder="○○石材店"
            />

            <ViewModeField
              label="墓石種類"
              viewMode={viewMode}
              register={register('gravestoneInfo.gravestoneType')}
              error={errors.gravestoneInfo?.gravestoneType?.message}
              placeholder="和型"
            />

            <ViewModeField
              label="周辺面積"
              viewMode={viewMode}
              register={register('gravestoneInfo.surroundingArea')}
              error={errors.gravestoneInfo?.surroundingArea?.message}
              placeholder="1.5"
            />

            <ViewModeField
              label="建立期限"
              viewMode={viewMode}
              type="date"
              register={register('gravestoneInfo.establishmentDeadline')}
              error={errors.gravestoneInfo?.establishmentDeadline?.message}
            />

            <ViewModeField
              label="建立日"
              viewMode={viewMode}
              type="date"
              register={register('gravestoneInfo.establishmentDate')}
              error={errors.gravestoneInfo?.establishmentDate?.message}
            />
          </div>
        )}
      </div>
    </div>
  );
}
