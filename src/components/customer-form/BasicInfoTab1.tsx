'use client';

import { PLOT_SECTIONS_BY_PERIOD, PlotPeriod } from '@/types/customer';
import { SelectItem } from '@/components/ui/select';
import { TabBaseProps } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';

export function BasicInfoTab1({ register, watch, setValue, errors, viewMode }: TabBaseProps) {
  return (
    <div className="space-y-6">
      {/* 顧客基本情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">顧客基本情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="墓石コード"
            value={watch('customerCode')}
            viewMode={viewMode}
            required
            placeholder="A-56"
            register={register('customerCode')}
            error={errors.customerCode?.message}
          />
          <ViewModeField
            label="許可番号"
            value={watch('plotNumber')}
            viewMode={viewMode}
            placeholder="A-56"
            register={register('plotNumber')}
          />
          <ViewModeSelect
            label="区画（期）"
            value={watch('plotPeriod') || ''}
            viewMode={viewMode}
            placeholder="期を選択"
            onValueChange={(value) => {
              setValue('plotPeriod', value);
              setValue('section', '');
            }}
          >
            <SelectItem value="1期">1期</SelectItem>
            <SelectItem value="2期">2期</SelectItem>
            <SelectItem value="3期">3期</SelectItem>
            <SelectItem value="4期">4期</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="区画（詳細）"
            value={watch('section') || ''}
            viewMode={viewMode}
            placeholder={watch('plotPeriod') ? '区画を選択' : '先に期を選択'}
            disabled={!watch('plotPeriod')}
            onValueChange={(value) => setValue('section', value)}
          >
            {watch('plotPeriod') && PLOT_SECTIONS_BY_PERIOD[watch('plotPeriod') as PlotPeriod]?.map((section) => (
              <SelectItem key={section} value={section}>{section}</SelectItem>
            ))}
          </ViewModeSelect>
        </div>
      </div>

      {/* 申込者情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">申込者情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="申込日"
            value={watch('applicantInfo.applicationDate')}
            viewMode={viewMode}
            type="date"
            register={register('applicantInfo.applicationDate')}
          />
          <ViewModeField
            label="担当者氏名"
            value={watch('applicantInfo.staffName')}
            viewMode={viewMode}
            register={register('applicantInfo.staffName')}
          />
          <ViewModeField
            label="氏名"
            value={watch('applicantInfo.name')}
            viewMode={viewMode}
            register={register('applicantInfo.name')}
          />
          <ViewModeField
            label="振り仮名"
            value={watch('applicantInfo.nameKana')}
            viewMode={viewMode}
            placeholder="ひらがなで入力"
            register={register('applicantInfo.nameKana')}
          />
          <ViewModeField
            label="郵便番号"
            value={watch('applicantInfo.postalCode')}
            viewMode={viewMode}
            placeholder="123-4567"
            register={register('applicantInfo.postalCode')}
          />
          <ViewModeField
            label="電話番号"
            value={watch('applicantInfo.phoneNumber')}
            viewMode={viewMode}
            placeholder="090-1234-5678"
            register={register('applicantInfo.phoneNumber')}
          />
          <ViewModeField
            label="住所"
            value={watch('applicantInfo.address')}
            viewMode={viewMode}
            register={register('applicantInfo.address')}
            className="col-span-3"
          />
        </div>
      </div>

      {/* 契約者情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">契約者情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="予約日"
            value={watch('reservationDate')}
            viewMode={viewMode}
            type="date"
            register={register('reservationDate')}
          />
          <ViewModeField
            label="承諾書番号"
            value={watch('acceptanceNumber')}
            viewMode={viewMode}
            register={register('acceptanceNumber')}
          />
          <ViewModeField
            label="許可日"
            value={watch('permitDate')}
            viewMode={viewMode}
            type="date"
            register={register('permitDate')}
          />
          <ViewModeField
            label="開始年月日"
            value={watch('startDate')}
            viewMode={viewMode}
            type="date"
            register={register('startDate')}
          />
          <ViewModeField
            label="氏名"
            value={watch('name')}
            viewMode={viewMode}
            required
            register={register('name')}
            error={errors.name?.message}
          />
          <ViewModeField
            label="振り仮名"
            value={watch('nameKana')}
            viewMode={viewMode}
            required
            placeholder="ひらがなで入力"
            register={register('nameKana')}
            error={errors.nameKana?.message}
          />
          <ViewModeField
            label="生年月日"
            value={watch('birthDate')}
            viewMode={viewMode}
            type="date"
            register={register('birthDate')}
          />
          <ViewModeSelect
            label="性別"
            value={watch('gender') || ''}
            displayValue={watch('gender') === 'male' ? '男性' : watch('gender') === 'female' ? '女性' : ''}
            viewMode={viewMode}
            required
            placeholder="選択してください"
            onValueChange={(value) => setValue('gender', value as 'male' | 'female')}
          >
            <SelectItem value="male">男性</SelectItem>
            <SelectItem value="female">女性</SelectItem>
          </ViewModeSelect>
          <ViewModeField
            label="電話番号"
            value={watch('phoneNumber')}
            viewMode={viewMode}
            required
            placeholder="090-1234-5678"
            register={register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <ViewModeField
            label="ファックス"
            value={watch('faxNumber')}
            viewMode={viewMode}
            placeholder="03-1234-5678"
            register={register('faxNumber')}
          />
          <ViewModeField
            label="メール"
            value={watch('email')}
            viewMode={viewMode}
            type="email"
            placeholder="example@email.com"
            register={register('email')}
          />
          <ViewModeField
            label="住所"
            value={watch('address')}
            viewMode={viewMode}
            required
            register={register('address')}
            error={errors.address?.message}
            className="col-span-2"
          />
          <ViewModeField
            label="本籍地住所"
            value={watch('registeredAddress')}
            viewMode={viewMode}
            register={register('registeredAddress')}
            className="col-span-3"
          />
        </div>
      </div>

      {/* 使用料 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">使用料</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeSelect
            label="計算区分"
            value={watch('usageFee.calculationType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('usageFee.calculationType', value)}
          >
            <SelectItem value="固定">固定</SelectItem>
            <SelectItem value="変動">変動</SelectItem>
            <SelectItem value="面積割">面積割</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="税区分"
            value={watch('usageFee.taxType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('usageFee.taxType', value)}
          >
            <SelectItem value="税込">税込</SelectItem>
            <SelectItem value="税別">税別</SelectItem>
            <SelectItem value="非課税">非課税</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="請求区分"
            value={watch('usageFee.billingType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('usageFee.billingType', value)}
          >
            <SelectItem value="一括">一括</SelectItem>
            <SelectItem value="分割">分割</SelectItem>
            <SelectItem value="年払い">年払い</SelectItem>
            <SelectItem value="月払い">月払い</SelectItem>
          </ViewModeSelect>
          <ViewModeField
            label="請求年数"
            value={watch('usageFee.billingYears')}
            viewMode={viewMode}
            type="number"
            register={register('usageFee.billingYears')}
            error={errors.usageFee?.billingYears?.message}
          />
          <ViewModeField
            label="面積"
            value={watch('usageFee.area')}
            viewMode={viewMode}
            placeholder="10平方メートル"
            register={register('usageFee.area')}
          />
          <ViewModeField
            label="単価"
            value={watch('usageFee.unitPrice')}
            viewMode={viewMode}
            type="number"
            placeholder="10000"
            register={register('usageFee.unitPrice')}
          />
          <ViewModeField
            label="使用料"
            value={watch('usageFee.usageFee')}
            viewMode={viewMode}
            type="number"
            placeholder="200000"
            register={register('usageFee.usageFee')}
          />
          <ViewModeSelect
            label="支払い方法"
            value={watch('usageFee.paymentMethod') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('usageFee.paymentMethod', value)}
          >
            <SelectItem value="銀行振込">銀行振込</SelectItem>
            <SelectItem value="現金">現金</SelectItem>
            <SelectItem value="口座振替">口座振替</SelectItem>
            <SelectItem value="クレジット">クレジット</SelectItem>
          </ViewModeSelect>
        </div>
      </div>

      {/* 管理料 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">管理料</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeSelect
            label="計算区分"
            value={watch('managementFee.calculationType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('managementFee.calculationType', value)}
          >
            <SelectItem value="固定">固定</SelectItem>
            <SelectItem value="変動">変動</SelectItem>
            <SelectItem value="面積割">面積割</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="税区分"
            value={watch('managementFee.taxType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('managementFee.taxType', value)}
          >
            <SelectItem value="税込">税込</SelectItem>
            <SelectItem value="税別">税別</SelectItem>
            <SelectItem value="非課税">非課税</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="請求区分"
            value={watch('managementFee.billingType') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('managementFee.billingType', value)}
          >
            <SelectItem value="年払い">年払い</SelectItem>
            <SelectItem value="月払い">月払い</SelectItem>
            <SelectItem value="四半期払い">四半期払い</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </ViewModeSelect>
          <ViewModeField
            label="請求年数"
            value={watch('managementFee.billingYears')}
            viewMode={viewMode}
            type="number"
            register={register('managementFee.billingYears')}
          />
          <ViewModeField
            label="面積"
            value={watch('managementFee.area')}
            viewMode={viewMode}
            placeholder="10平方メートル"
            register={register('managementFee.area')}
          />
          <ViewModeField
            label="請求月"
            value={watch('managementFee.billingMonth')}
            viewMode={viewMode}
            type="number"
            placeholder="1-12"
            register={register('managementFee.billingMonth')}
          />
          <ViewModeField
            label="管理料"
            value={watch('managementFee.managementFee')}
            viewMode={viewMode}
            type="number"
            placeholder="5000"
            register={register('managementFee.managementFee')}
          />
          <ViewModeField
            label="単価"
            value={watch('managementFee.unitPrice')}
            viewMode={viewMode}
            type="number"
            placeholder="500"
            register={register('managementFee.unitPrice')}
          />
          <ViewModeField
            label="最終請求月"
            value={watch('managementFee.lastBillingMonth')}
            viewMode={viewMode}
            placeholder="----年--月"
            register={register('managementFee.lastBillingMonth')}
          />
          <ViewModeSelect
            label="支払方法"
            value={watch('managementFee.paymentMethod') || ''}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('managementFee.paymentMethod', value)}
          >
            <SelectItem value="銀行振込">銀行振込</SelectItem>
            <SelectItem value="現金">現金</SelectItem>
            <SelectItem value="口座振替">口座振替</SelectItem>
            <SelectItem value="クレジット">クレジット</SelectItem>
          </ViewModeSelect>
        </div>
      </div>

      {/* 墓石情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">墓石</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="墓石台"
            value={watch('gravestoneInfo.gravestoneBase')}
            viewMode={viewMode}
            register={register('gravestoneInfo.gravestoneBase')}
          />
          <ViewModeField
            label="包囲位置"
            value={watch('gravestoneInfo.enclosurePosition')}
            viewMode={viewMode}
            register={register('gravestoneInfo.enclosurePosition')}
          />
          <ViewModeField
            label="墓石取扱い"
            value={watch('gravestoneInfo.gravestoneDealer')}
            viewMode={viewMode}
            register={register('gravestoneInfo.gravestoneDealer')}
          />
          <ViewModeField
            label="墓石タイプ"
            value={watch('gravestoneInfo.gravestoneType')}
            viewMode={viewMode}
            register={register('gravestoneInfo.gravestoneType')}
          />
          <ViewModeField
            label="周辺設備"
            value={watch('gravestoneInfo.surroundingArea')}
            viewMode={viewMode}
            register={register('gravestoneInfo.surroundingArea')}
          />
          <ViewModeField
            label="設立期限"
            value={watch('gravestoneInfo.establishmentDeadline')}
            viewMode={viewMode}
            type="date"
            register={register('gravestoneInfo.establishmentDeadline')}
          />
          <ViewModeField
            label="設立日"
            value={watch('gravestoneInfo.establishmentDate')}
            viewMode={viewMode}
            type="date"
            register={register('gravestoneInfo.establishmentDate')}
          />
        </div>
      </div>
    </div>
  );
}
