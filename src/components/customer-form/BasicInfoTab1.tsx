'use client';

import { PLOT_SECTIONS_BY_PERIOD, PlotPeriod } from '@/types/customer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabBaseProps } from './types';

export function BasicInfoTab1({ register, watch, setValue, errors }: TabBaseProps) {
  return (
    <div className="space-y-6">
      {/* 顧客基本情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">顧客基本情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="customerCode" className="text-sm font-medium">
              墓石コード <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerCode"
              {...register('customerCode')}
              placeholder="A-56"
              className="mt-1"
              required
            />
            {errors.customerCode && (
              <p className="text-red-500 text-sm mt-1">{errors.customerCode.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="plotNumber" className="text-sm font-medium">
              許可番号
            </Label>
            <Input
              id="plotNumber"
              {...register('plotNumber')}
              placeholder="A-56"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="plotPeriod" className="text-sm font-medium">
              区画（期）
            </Label>
            <Select
              value={watch('plotPeriod') || ''}
              onValueChange={(value) => {
                setValue('plotPeriod', value);
                setValue('section', '');
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
            <Label htmlFor="section" className="text-sm font-medium">
              区画（詳細）
            </Label>
            <Select
              value={watch('section') || ''}
              onValueChange={(value) => setValue('section', value)}
              disabled={!watch('plotPeriod')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={watch('plotPeriod') ? '区画を選択' : '先に期を選択'} />
              </SelectTrigger>
              <SelectContent>
                {watch('plotPeriod') && PLOT_SECTIONS_BY_PERIOD[watch('plotPeriod') as PlotPeriod]?.map((section) => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 申込者情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">申込者情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="applicationDate" className="text-sm font-medium">
              申込日
            </Label>
            <Input
              id="applicationDate"
              type="date"
              {...register('applicantInfo.applicationDate')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="staffName" className="text-sm font-medium">
              担当者氏名
            </Label>
            <Input
              id="staffName"
              {...register('applicantInfo.staffName')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="applicantName" className="text-sm font-medium">
              氏名
            </Label>
            <Input
              id="applicantName"
              {...register('applicantInfo.name')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="applicantNameKana" className="text-sm font-medium">
              振り仮名
            </Label>
            <Input
              id="applicantNameKana"
              {...register('applicantInfo.nameKana')}
              placeholder="ひらがなで入力"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="applicantPostalCode" className="text-sm font-medium">
              郵便番号
            </Label>
            <Input
              id="applicantPostalCode"
              {...register('applicantInfo.postalCode')}
              placeholder="123-4567"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="applicantPhoneNumber" className="text-sm font-medium">
              電話番号
            </Label>
            <Input
              id="applicantPhoneNumber"
              {...register('applicantInfo.phoneNumber')}
              placeholder="090-1234-5678"
              className="mt-1"
            />
          </div>
          <div className="col-span-3">
            <Label htmlFor="applicantAddress" className="text-sm font-medium">
              住所
            </Label>
            <Input
              id="applicantAddress"
              {...register('applicantInfo.address')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* 契約者情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">契約者情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="reservationDate" className="text-sm font-medium">
              予約日
            </Label>
            <Input
              id="reservationDate"
              type="date"
              {...register('reservationDate')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="acceptanceNumber" className="text-sm font-medium">
              承諾書番号
            </Label>
            <Input
              id="acceptanceNumber"
              {...register('acceptanceNumber')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="permitDate" className="text-sm font-medium">
              許可日
            </Label>
            <Input
              id="permitDate"
              type="date"
              {...register('permitDate')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium">
              開始年月日
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contractorName" className="text-sm font-medium">
              氏名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contractorName"
              {...register('name')}
              className="mt-1"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contractorNameKana" className="text-sm font-medium">
              振り仮名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contractorNameKana"
              {...register('nameKana')}
              placeholder="ひらがなで入力"
              className="mt-1"
              required
            />
            {errors.nameKana && (
              <p className="text-red-500 text-sm mt-1">{errors.nameKana.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="birthDate" className="text-sm font-medium">
              生年月日
            </Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              性別 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('gender') || ''}
              onValueChange={(value) => setValue('gender', value as 'male' | 'female')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              電話番号 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="090-1234-5678"
              className="mt-1"
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="faxNumber" className="text-sm font-medium">
              ファックス
            </Label>
            <Input
              id="faxNumber"
              {...register('faxNumber')}
              placeholder="03-1234-5678"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              メール
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="example@email.com"
              className="mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address" className="text-sm font-medium">
              住所 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              className="mt-1"
              required
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>
          <div className="col-span-3">
            <Label htmlFor="registeredAddress" className="text-sm font-medium">
              本籍地住所
            </Label>
            <Input
              id="registeredAddress"
              {...register('registeredAddress')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* 使用料 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">使用料</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="usageCalculationType" className="text-sm font-medium">
              計算区分
            </Label>
            <Select
              value={watch('usageFee.calculationType') || ''}
              onValueChange={(value) => setValue('usageFee.calculationType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="固定">固定</SelectItem>
                <SelectItem value="変動">変動</SelectItem>
                <SelectItem value="面積割">面積割</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="usageTaxType" className="text-sm font-medium">
              税区分
            </Label>
            <Select
              value={watch('usageFee.taxType') || ''}
              onValueChange={(value) => setValue('usageFee.taxType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="税込">税込</SelectItem>
                <SelectItem value="税別">税別</SelectItem>
                <SelectItem value="非課税">非課税</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="usageBillingType" className="text-sm font-medium">
              請求区分
            </Label>
            <Select
              value={watch('usageFee.billingType') || ''}
              onValueChange={(value) => setValue('usageFee.billingType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="一括">一括</SelectItem>
                <SelectItem value="分割">分割</SelectItem>
                <SelectItem value="年払い">年払い</SelectItem>
                <SelectItem value="月払い">月払い</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="usageBillingYears" className="text-sm font-medium">
              請求年数
            </Label>
            <Input
              id="usageBillingYears"
              type="number"
              {...register('usageFee.billingYears')}
              className="mt-1"
            />
            {errors.usageFee?.billingYears && (
              <p className="text-red-500 text-sm mt-1">{errors.usageFee.billingYears.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="usageArea" className="text-sm font-medium">
              面積
            </Label>
            <Input
              id="usageArea"
              {...register('usageFee.area')}
              placeholder="10平方メートル"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="usageUnitPrice" className="text-sm font-medium">
              単価
            </Label>
            <Input
              id="usageUnitPrice"
              type="number"
              {...register('usageFee.unitPrice')}
              placeholder="10000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="usageUsageFee" className="text-sm font-medium">
              使用料
            </Label>
            <Input
              id="usageUsageFee"
              type="number"
              {...register('usageFee.usageFee')}
              placeholder="200000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="usagePaymentMethod" className="text-sm font-medium">
              支払い方法
            </Label>
            <Select
              value={watch('usageFee.paymentMethod') || ''}
              onValueChange={(value) => setValue('usageFee.paymentMethod', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="銀行振込">銀行振込</SelectItem>
                <SelectItem value="現金">現金</SelectItem>
                <SelectItem value="口座振替">口座振替</SelectItem>
                <SelectItem value="クレジット">クレジット</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 管理料 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">管理料</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="mgmtCalculationType" className="text-sm font-medium">
              計算区分
            </Label>
            <Select
              value={watch('managementFee.calculationType') || ''}
              onValueChange={(value) => setValue('managementFee.calculationType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="固定">固定</SelectItem>
                <SelectItem value="変動">変動</SelectItem>
                <SelectItem value="面積割">面積割</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mgmtTaxType" className="text-sm font-medium">
              税区分
            </Label>
            <Select
              value={watch('managementFee.taxType') || ''}
              onValueChange={(value) => setValue('managementFee.taxType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="税込">税込</SelectItem>
                <SelectItem value="税別">税別</SelectItem>
                <SelectItem value="非課税">非課税</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mgmtBillingType" className="text-sm font-medium">
              請求区分
            </Label>
            <Select
              value={watch('managementFee.billingType') || ''}
              onValueChange={(value) => setValue('managementFee.billingType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="年払い">年払い</SelectItem>
                <SelectItem value="月払い">月払い</SelectItem>
                <SelectItem value="四半期払い">四半期払い</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mgmtBillingYears" className="text-sm font-medium">
              請求年数
            </Label>
            <Input
              id="mgmtBillingYears"
              type="number"
              {...register('managementFee.billingYears')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtArea" className="text-sm font-medium">
              面積
            </Label>
            <Input
              id="mgmtArea"
              {...register('managementFee.area')}
              placeholder="10平方メートル"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtBillingMonth" className="text-sm font-medium">
              請求月
            </Label>
            <Input
              id="mgmtBillingMonth"
              type="number"
              min="1"
              max="12"
              {...register('managementFee.billingMonth')}
              placeholder="1-12"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtManagementFee" className="text-sm font-medium">
              管理料
            </Label>
            <Input
              id="mgmtManagementFee"
              type="number"
              {...register('managementFee.managementFee')}
              placeholder="5000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtUnitPrice" className="text-sm font-medium">
              単価
            </Label>
            <Input
              id="mgmtUnitPrice"
              type="number"
              {...register('managementFee.unitPrice')}
              placeholder="500"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtLastBillingMonth" className="text-sm font-medium">
              最終請求月
            </Label>
            <Input
              id="mgmtLastBillingMonth"
              {...register('managementFee.lastBillingMonth')}
              placeholder="----年--月"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mgmtPaymentMethod" className="text-sm font-medium">
              支払方法
            </Label>
            <Select
              value={watch('managementFee.paymentMethod') || ''}
              onValueChange={(value) => setValue('managementFee.paymentMethod', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="銀行振込">銀行振込</SelectItem>
                <SelectItem value="現金">現金</SelectItem>
                <SelectItem value="口座振替">口座振替</SelectItem>
                <SelectItem value="クレジット">クレジット</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 墓石情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">墓石</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="gravestoneBase" className="text-sm font-medium">
              墓石台
            </Label>
            <Input
              id="gravestoneBase"
              {...register('gravestoneInfo.gravestoneBase')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="enclosurePosition" className="text-sm font-medium">
              包囲位置
            </Label>
            <Input
              id="enclosurePosition"
              {...register('gravestoneInfo.enclosurePosition')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gravestoneDealer" className="text-sm font-medium">
              墓石取扱い
            </Label>
            <Input
              id="gravestoneDealer"
              {...register('gravestoneInfo.gravestoneDealer')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gravestoneType" className="text-sm font-medium">
              墓石タイプ
            </Label>
            <Input
              id="gravestoneType"
              {...register('gravestoneInfo.gravestoneType')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="surroundingArea" className="text-sm font-medium">
              周辺設備
            </Label>
            <Input
              id="surroundingArea"
              {...register('gravestoneInfo.surroundingArea')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="establishmentDeadline" className="text-sm font-medium">
              設立期限
            </Label>
            <Input
              id="establishmentDeadline"
              type="date"
              {...register('gravestoneInfo.establishmentDeadline')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="establishmentDate" className="text-sm font-medium">
              設立日
            </Label>
            <Input
              id="establishmentDate"
              type="date"
              {...register('gravestoneInfo.establishmentDate')}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
