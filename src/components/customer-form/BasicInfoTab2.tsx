'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectItem } from '@/components/ui/select';
import { TabBaseProps } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';

export function BasicInfoTab2({ register, watch, setValue, viewMode }: TabBaseProps) {
  const dmSettingLabels: Record<string, string> = {
    allow: '許可',
    deny: '拒否',
    limited: '制限付き',
  };
  const dmSettingDisplayValue = dmSettingLabels[watch('workInfo.dmSetting') || ''] || '';

  const addressTypeLabels: Record<string, string> = {
    home: '自宅',
    work: '勤務先',
    other: 'その他',
  };
  const addressTypeDisplayValue = addressTypeLabels[watch('workInfo.addressType') || ''] || '';

  const billingTypeLabels: Record<string, string> = {
    individual: '個人',
    corporate: '法人',
    bank_transfer: '銀行振込',
  };
  const billingTypeDisplayValue = billingTypeLabels[watch('billingInfo.billingType') || ''] || '';

  const accountTypeLabels: Record<string, string> = {
    ordinary: '普通',
    current: '当座',
    savings: '貯蓄',
  };
  const accountTypeDisplayValue = accountTypeLabels[watch('billingInfo.accountType') || ''] || '';

  return (
    <div className="space-y-6">
      {/* 勤務先情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">勤務先情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <ViewModeField
            label="勤務先名称"
            value={watch('workInfo.companyName')}
            viewMode={viewMode}
            register={register('workInfo.companyName')}
          />
          <ViewModeField
            label="勤務先仮名"
            value={watch('workInfo.companyNameKana')}
            viewMode={viewMode}
            placeholder="ひらがなで入力"
            register={register('workInfo.companyNameKana')}
          />
          <ViewModeField
            label="郵便番号"
            value={watch('workInfo.workPostalCode')}
            viewMode={viewMode}
            placeholder="123-4567"
            register={register('workInfo.workPostalCode')}
          />
          <ViewModeField
            label="電話番号"
            value={watch('workInfo.workPhoneNumber')}
            viewMode={viewMode}
            placeholder="03-1234-5678"
            register={register('workInfo.workPhoneNumber')}
          />
          <ViewModeField
            label="就職先住所"
            value={watch('workInfo.workAddress')}
            viewMode={viewMode}
            register={register('workInfo.workAddress')}
            className="col-span-2"
          />
        </div>
      </div>

      {/* DM・宛先情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">DM・宛先情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeSelect
            label="DM設定"
            value={watch('workInfo.dmSetting') || ''}
            displayValue={dmSettingDisplayValue}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('workInfo.dmSetting', value as 'allow' | 'deny' | 'limited')}
          >
            <SelectItem value="allow">許可</SelectItem>
            <SelectItem value="deny">拒否</SelectItem>
            <SelectItem value="limited">制限付き</SelectItem>
          </ViewModeSelect>
          <ViewModeSelect
            label="宛先区分"
            value={watch('workInfo.addressType') || ''}
            displayValue={addressTypeDisplayValue}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('workInfo.addressType', value as 'home' | 'work' | 'other')}
          >
            <SelectItem value="home">自宅</SelectItem>
            <SelectItem value="work">勤務先</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </ViewModeSelect>
          <div></div>
          <ViewModeField
            label="備考"
            value={watch('workInfo.notes')}
            viewMode={viewMode}
            register={register('workInfo.notes')}
            className="col-span-3"
          />
        </div>
      </div>

      {/* 請求情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">請求情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeSelect
            label="請求種別"
            value={watch('billingInfo.billingType') || ''}
            displayValue={billingTypeDisplayValue}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('billingInfo.billingType', value as 'individual' | 'corporate' | 'bank_transfer')}
          >
            <SelectItem value="individual">個人</SelectItem>
            <SelectItem value="corporate">法人</SelectItem>
            <SelectItem value="bank_transfer">銀行振込</SelectItem>
          </ViewModeSelect>
          <ViewModeField
            label="機関名称"
            value={watch('billingInfo.institutionName')}
            viewMode={viewMode}
            placeholder="○○銀行 / ゆうちょ銀行"
            register={register('billingInfo.institutionName')}
          />
          <ViewModeField
            label="支店名称"
            value={watch('billingInfo.branchName')}
            viewMode={viewMode}
            placeholder="△△支店"
            register={register('billingInfo.branchName')}
          />
          <ViewModeSelect
            label="口座科目"
            value={watch('billingInfo.accountType') || ''}
            displayValue={accountTypeDisplayValue}
            viewMode={viewMode}
            placeholder="選択してください"
            onValueChange={(value) => setValue('billingInfo.accountType', value as 'ordinary' | 'current' | 'savings')}
          >
            <SelectItem value="ordinary">普通</SelectItem>
            <SelectItem value="current">当座</SelectItem>
            <SelectItem value="savings">貯蓄</SelectItem>
          </ViewModeSelect>
          <div>
            <Label className="text-sm font-medium">記号番号</Label>
            {viewMode ? (
              <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
                {watch('billingInfo.symbolNumber') || watch('billingInfo.accountNumber')
                  ? `${watch('billingInfo.symbolNumber') || ''}-${watch('billingInfo.accountNumber') || ''}`
                  : '-'}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="symbolNumber"
                  {...register('billingInfo.symbolNumber')}
                  placeholder="記号"
                  className="w-24"
                />
                <span className="text-gray-500">-</span>
                <Input
                  id="accountNumber"
                  {...register('billingInfo.accountNumber')}
                  placeholder="番号"
                  className="flex-1"
                />
              </div>
            )}
          </div>
          <ViewModeField
            label="口座名義"
            value={watch('billingInfo.accountHolder')}
            viewMode={viewMode}
            placeholder="口座名義人"
            register={register('billingInfo.accountHolder')}
          />
        </div>
      </div>
    </div>
  );
}
