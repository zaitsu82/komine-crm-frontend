'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabBaseProps } from './types';

export function BasicInfoTab2({ register, watch, setValue }: TabBaseProps) {
  return (
    <div className="space-y-6">
      {/* 勤務先情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">勤務先情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium">
              勤務先名称
            </Label>
            <Input
              id="companyName"
              {...register('workInfo.companyName')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyNameKana" className="text-sm font-medium">
              勤務先仮名
            </Label>
            <Input
              id="companyNameKana"
              {...register('workInfo.companyNameKana')}
              placeholder="ひらがなで入力"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="workPostalCode" className="text-sm font-medium">
              郵便番号
            </Label>
            <Input
              id="workPostalCode"
              {...register('workInfo.workPostalCode')}
              placeholder="123-4567"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="workPhoneNumber" className="text-sm font-medium">
              電話番号
            </Label>
            <Input
              id="workPhoneNumber"
              {...register('workInfo.workPhoneNumber')}
              placeholder="03-1234-5678"
              className="mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="workAddress" className="text-sm font-medium">
              就職先住所
            </Label>
            <Input
              id="workAddress"
              {...register('workInfo.workAddress')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* DM・宛先情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">DM・宛先情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dmSetting" className="text-sm font-medium">
              DM設定
            </Label>
            <Select
              value={watch('workInfo.dmSetting') || ''}
              onValueChange={(value) => setValue('workInfo.dmSetting', value as 'allow' | 'deny' | 'limited')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">許可</SelectItem>
                <SelectItem value="deny">拒否</SelectItem>
                <SelectItem value="limited">制限付き</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="addressType" className="text-sm font-medium">
              宛先区分
            </Label>
            <Select
              value={watch('workInfo.addressType') || ''}
              onValueChange={(value) => setValue('workInfo.addressType', value as 'home' | 'work' | 'other')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">自宅</SelectItem>
                <SelectItem value="work">勤務先</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div></div>
          <div className="col-span-3">
            <Label htmlFor="notes" className="text-sm font-medium">
              備考
            </Label>
            <Input
              id="notes"
              {...register('workInfo.notes')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* 請求情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">請求情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="billingType" className="text-sm font-medium">
              請求種別
            </Label>
            <Select
              value={watch('billingInfo.billingType') || ''}
              onValueChange={(value) => setValue('billingInfo.billingType', value as 'individual' | 'corporate' | 'bank_transfer')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">個人</SelectItem>
                <SelectItem value="corporate">法人</SelectItem>
                <SelectItem value="bank_transfer">銀行振込</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="institutionName" className="text-sm font-medium">
              機関名称
            </Label>
            <Input
              id="institutionName"
              {...register('billingInfo.institutionName')}
              placeholder="○○銀行 / ゆうちょ銀行"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="branchName" className="text-sm font-medium">
              支店名称
            </Label>
            <Input
              id="branchName"
              {...register('billingInfo.branchName')}
              placeholder="△△支店"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="accountType" className="text-sm font-medium">
              口座科目
            </Label>
            <Select
              value={watch('billingInfo.accountType') || ''}
              onValueChange={(value) => setValue('billingInfo.accountType', value as 'ordinary' | 'current' | 'savings')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinary">普通</SelectItem>
                <SelectItem value="current">当座</SelectItem>
                <SelectItem value="savings">貯蓄</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="symbolNumber" className="text-sm font-medium">
              記号番号
            </Label>
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
          </div>
          <div>
            <Label htmlFor="accountHolder" className="text-sm font-medium">
              口座名義
            </Label>
            <Input
              id="accountHolder"
              {...register('billingInfo.accountHolder')}
              placeholder="口座名義人"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
