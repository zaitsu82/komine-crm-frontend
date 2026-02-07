'use client'

import { PlotTabBaseProps } from './types'
import { ViewModeField, ViewModeSelect } from './ViewModeField'
import { SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DmSetting, AddressType, BillingType, AccountType } from '@komine/types'

export function WorkBillingTab({
  register,
  watch,
  setValue,
  errors,
}: PlotTabBaseProps) {
  const hasWorkInfo = watch('workInfo') !== null
  const hasBillingInfo = watch('billingInfo') !== null

  const toggleWorkInfo = () => {
    if (hasWorkInfo) {
      setValue('workInfo', null)
    } else {
      setValue('workInfo', {
        companyName: '',
        companyNameKana: '',
        workAddress: '',
        workPostalCode: '',
        workPhoneNumber: '',
        dmSetting: DmSetting.Allow,
        addressType: AddressType.Home,
        notes: null
      })
    }
  }

  const toggleBillingInfo = () => {
    if (hasBillingInfo) {
      setValue('billingInfo', null)
    } else {
      setValue('billingInfo', {
        billingType: BillingType.Individual,
        bankName: '',
        branchName: '',
        accountType: AccountType.Ordinary,
        accountNumber: '',
        accountHolder: ''
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Work Info */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">勤務先情報</h3>
          <Button type="button" variant="outline" size="sm" onClick={toggleWorkInfo}>
            {hasWorkInfo ? '削除' : '追加'}
          </Button>
        </div>
        {hasWorkInfo && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ViewModeField
                label="勤務先名称"
                required
                register={register('workInfo.companyName')}
                error={errors.workInfo?.companyName?.message}
                placeholder="会社名"
              />
              <ViewModeField
                label="勤務先名称カナ"
                register={register('workInfo.companyNameKana')}
                error={errors.workInfo?.companyNameKana?.message}
                placeholder="カイシャメイ"
              />
              <ViewModeField
                label="勤務先郵便番号"
                register={register('workInfo.workPostalCode')}
                error={errors.workInfo?.workPostalCode?.message}
                placeholder="123-4567"
              />
              <ViewModeField
                label="勤務先電話番号"
                register={register('workInfo.workPhoneNumber')}
                error={errors.workInfo?.workPhoneNumber?.message}
                placeholder="03-1234-5678"
              />
              <div className="col-span-2">
                <ViewModeField
                  label="勤務先住所"
                  register={register('workInfo.workAddress')}
                  error={errors.workInfo?.workAddress?.message}
                  placeholder="東京都..."
                />
              </div>
            </div>

            {/* DM・宛先設定 */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">DM・宛先設定</h4>
              <div className="grid grid-cols-2 gap-4">
                <ViewModeSelect
                  label="DM送信設定"
                  value={watch('workInfo.dmSetting') || ''}
                  onValueChange={(v) => setValue('workInfo.dmSetting', v as DmSetting)}
                  placeholder="選択..."
                >
                  <SelectItem value={DmSetting.Allow}>送信許可</SelectItem>
                  <SelectItem value={DmSetting.Deny}>送信拒否</SelectItem>
                  <SelectItem value={DmSetting.Limited}>制限付き</SelectItem>
                </ViewModeSelect>

                <ViewModeSelect
                  label="宛先区分"
                  value={watch('workInfo.addressType') || ''}
                  onValueChange={(v) => setValue('workInfo.addressType', v as AddressType)}
                  placeholder="選択..."
                >
                  <SelectItem value={AddressType.Home}>自宅</SelectItem>
                  <SelectItem value={AddressType.Work}>勤務先</SelectItem>
                  <SelectItem value={AddressType.Other}>その他</SelectItem>
                </ViewModeSelect>

                <div className="col-span-2">
                  <Label className="text-sm font-medium">備考</Label>
                  <textarea
                    className="mt-1 w-full px-3 py-2 border rounded-md resize-none"
                    rows={2}
                    {...register('workInfo.notes')}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section 2: Billing Info */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">請求情報</h3>
          <Button type="button" variant="outline" size="sm" onClick={toggleBillingInfo}>
            {hasBillingInfo ? '削除' : '追加'}
          </Button>
        </div>
        {hasBillingInfo && (
          <div className="grid grid-cols-2 gap-4">
            <ViewModeSelect
              label="請求区分"
              value={watch('billingInfo.billingType') || ''}
              onValueChange={(v) => setValue('billingInfo.billingType', v as BillingType)}
              placeholder="選択..."
            >
              <SelectItem value={BillingType.Individual}>個人</SelectItem>
              <SelectItem value={BillingType.Corporate}>法人</SelectItem>
              <SelectItem value={BillingType.BankTransfer}>銀行振込</SelectItem>
            </ViewModeSelect>

            <ViewModeField
              label="金融機関名"
              required
              register={register('billingInfo.bankName')}
              error={errors.billingInfo?.bankName?.message}
              placeholder="○○銀行"
            />

            <ViewModeField
              label="支店名"
              required
              register={register('billingInfo.branchName')}
              error={errors.billingInfo?.branchName?.message}
              placeholder="△△支店"
            />

            <ViewModeSelect
              label="口座種別"
              value={watch('billingInfo.accountType') || ''}
              onValueChange={(v) => setValue('billingInfo.accountType', v as AccountType)}
              placeholder="選択..."
            >
              <SelectItem value={AccountType.Ordinary}>普通預金</SelectItem>
              <SelectItem value={AccountType.Current}>当座預金</SelectItem>
              <SelectItem value={AccountType.Savings}>貯蓄預金</SelectItem>
            </ViewModeSelect>

            <ViewModeField
              label="口座番号"
              required
              register={register('billingInfo.accountNumber')}
              error={errors.billingInfo?.accountNumber?.message}
              placeholder="1234567"
            />

            <div className="col-span-2">
              <ViewModeField
                label="口座名義"
                required
                register={register('billingInfo.accountHolder')}
                error={errors.billingInfo?.accountHolder?.message}
                placeholder="ヤマダ タロウ"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
