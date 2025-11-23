'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Customer, PLOT_UNIT_TYPE_LABELS, PLOT_STATUS_LABELS, OWNERSHIP_TYPE_LABELS } from '@/types/customer';
import { customerFormSchema, CustomerFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, calculateEffectiveCapacity, calculateSuggestedPrice } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerFormProps {
  customer?: Customer;
  onSave: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({ customer, onSave, onCancel, isLoading }: CustomerFormProps) {
  const isEditing = !!customer;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? {
      customerCode: customer.customerCode,
      plotNumber: customer.plotNumber || '',
      section: customer.section || '',
      reservationDate: customer.reservationDate ? formatDate(customer.reservationDate) : '',
      acceptanceNumber: customer.acceptanceNumber || '',
      permitDate: customer.permitDate ? formatDate(customer.permitDate) : '',
      startDate: customer.startDate ? formatDate(customer.startDate) : '',
      name: customer.name,
      nameKana: customer.nameKana,
      birthDate: customer.birthDate ? formatDate(customer.birthDate) : '',
      gender: customer.gender,
      phoneNumber: customer.phoneNumber,
      faxNumber: customer.faxNumber || '',
      email: customer.email || '',
      address: customer.address,
      registeredAddress: customer.registeredAddress || '',
      applicantInfo: customer.applicantInfo ? {
        applicationDate: customer.applicantInfo.applicationDate ? formatDate(customer.applicantInfo.applicationDate) : '',
        staffName: customer.applicantInfo.staffName || '',
        name: customer.applicantInfo.name || '',
        nameKana: customer.applicantInfo.nameKana || '',
        postalCode: customer.applicantInfo.postalCode || '',
        phoneNumber: customer.applicantInfo.phoneNumber || '',
        address: customer.applicantInfo.address || '',
      } : undefined,
      usageFee: customer.usageFee ? {
        calculationType: customer.usageFee.calculationType || '',
        taxType: customer.usageFee.taxType || '',
        billingType: customer.usageFee.billingType || '',
        billingYears: customer.usageFee.billingYears?.toString() || '',
        area: customer.usageFee.area || '',
        unitPrice: customer.usageFee.unitPrice?.toString() || '',
        usageFee: customer.usageFee.usageFee?.toString() || '',
        paymentMethod: customer.usageFee.paymentMethod || '',
      } : undefined,
      managementFee: customer.managementFee ? {
        calculationType: customer.managementFee.calculationType || '',
        taxType: customer.managementFee.taxType || '',
        billingType: customer.managementFee.billingType || '',
        billingYears: customer.managementFee.billingYears?.toString() || '',
        area: customer.managementFee.area || '',
        billingMonth: customer.managementFee.billingMonth?.toString() || '',
        managementFee: customer.managementFee.managementFee?.toString() || '',
        unitPrice: customer.managementFee.unitPrice?.toString() || '',
        lastBillingMonth: customer.managementFee.lastBillingMonth || '',
        paymentMethod: customer.managementFee.paymentMethod || '',
      } : undefined,
      gravestoneInfo: customer.gravestoneInfo ? {
        gravestoneBase: customer.gravestoneInfo.gravestoneBase || '',
        enclosurePosition: customer.gravestoneInfo.enclosurePosition || '',
        gravestoneDealer: customer.gravestoneInfo.gravestoneDealer || '',
        gravestoneType: customer.gravestoneInfo.gravestoneType || '',
        surroundingArea: customer.gravestoneInfo.surroundingArea || '',
        establishmentDeadline: customer.gravestoneInfo.establishmentDeadline ? formatDate(customer.gravestoneInfo.establishmentDeadline) : '',
        establishmentDate: customer.gravestoneInfo.establishmentDate ? formatDate(customer.gravestoneInfo.establishmentDate) : '',
      } : undefined,
      // 後方互換性フィールド
      familyContacts: customer.familyContacts?.map(contact => ({
        ...contact,
        birthDate: contact.birthDate ? formatDate(contact.birthDate) : '',
      })) || [],
      buriedPersons: customer.buriedPersons?.map(person => ({
        ...person,
        burialDate: person.burialDate ? formatDate(person.burialDate) : '',
      })) || [],
      emergencyContact: customer.emergencyContact ? {
        name: customer.emergencyContact.name,
        relationship: customer.emergencyContact.relationship,
        phoneNumber: customer.emergencyContact.phoneNumber,
      } : undefined,
    } : {
      customerCode: '',
      plotNumber: '',
      section: '',
      reservationDate: '',
      acceptanceNumber: '',
      permitDate: '',
      startDate: '',
      name: '',
      nameKana: '',
      birthDate: '',
      gender: '', // 空文字列で未選択状態
      phoneNumber: '',
      faxNumber: '',
      email: '',
      address: '',
      registeredAddress: '',
      familyContacts: [],
      buriedPersons: [],
      // 以下のオブジェクトはundefinedにしてユーザーが入力した場合のみ作成
      applicantInfo: undefined as any,
      usageFee: undefined as any,
      managementFee: undefined as any,
      gravestoneInfo: undefined as any,
      workInfo: undefined as any,
      billingInfo: undefined as any,
      plotInfo: undefined as any,
      emergencyContact: undefined as any,
    }
  });

  const { fields: familyContactFields, append: addFamilyContact, remove: removeFamilyContact } = useFieldArray({
    control,
    name: "familyContacts"
  });

  const { fields: buriedPersonFields, append: addBuriedPerson, remove: removeBuriedPerson } = useFieldArray({
    control,
    name: "buriedPersons"
  });

  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const handleAddNewContact = () => {
    const newId = `contact-${Date.now()}`;
    addFamilyContact({
      id: newId,
      name: '',
      birthDate: '',
      relationship: '',
      address: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      registeredAddress: '',
      mailingType: '', // 空文字列で未選択状態
      companyName: '',
      companyNameKana: '',
      companyAddress: '',
      companyPhone: '',
      notes: ''
    });
    setExpandedContactId(newId);
  };

  const handleAddNewBuriedPerson = () => {
    const newId = `buried-${Date.now()}`;
    addBuriedPerson({
      id: newId,
      name: '',
      gender: '', // 空文字列で未選択状態
      burialDate: '',
      memo: ''
    });
  };

  const toggleContactExpansion = (contactId: string) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
  };

  const onSubmit = (data: CustomerFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <Tabs defaultValue="basic-info-1" className="w-full">
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="basic-info-1" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報①</TabsTrigger>
          <TabsTrigger value="basic-info-2" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報②</TabsTrigger>
          <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">連絡先/家族</TabsTrigger>
          <TabsTrigger value="burial-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">埋葬情報</TabsTrigger>
          <TabsTrigger value="plot-settings" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">区画設定</TabsTrigger>
          <TabsTrigger value="construction" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">工事情報</TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">履歴情報</TabsTrigger>
        </TabsList>

          <TabsContent value="basic-info-1" className="space-y-6 mt-6">
            {/* 顧客基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">顧客基本情報</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerCode" className="text-sm font-medium">
                    顧客コード <span className="text-red-500">*</span>
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
                    区画番号
                  </Label>
                  <Input
                    id="plotNumber"
                    {...register('plotNumber')}
                    placeholder="A-56"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="section" className="text-sm font-medium">
                    区域
                  </Label>
                  <Select 
                    value={watch('section') || ''} 
                    onValueChange={(value) => setValue('section', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="east">東区</SelectItem>
                      <SelectItem value="west">西区</SelectItem>
                      <SelectItem value="south">南区</SelectItem>
                      <SelectItem value="north">北区</SelectItem>
                      <SelectItem value="center">中央区</SelectItem>
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
                    placeholder="10㎡"
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
                    placeholder="10㎡"
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
          </TabsContent>

          <TabsContent value="basic-info-2" className="space-y-6 mt-6">
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
                  <Label htmlFor="bankName" className="text-sm font-medium">
                    銀行名称
                  </Label>
                  <Input
                    id="bankName"
                    {...register('billingInfo.bankName')}
                    placeholder="○○銀行"
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
                  <Label htmlFor="accountNumber" className="text-sm font-medium">
                    記号番号
                  </Label>
                  <Input
                    id="accountNumber"
                    {...register('billingInfo.accountNumber')}
                    placeholder="1234567"
                    className="mt-1"
                  />
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
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6 mt-6">
            {/* 家族・連絡先一覧 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold">家族・連絡先</h3>
                <Button 
                  type="button" 
                  onClick={handleAddNewContact}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  + 新規追加
                </Button>
              </div>
              
              {familyContactFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <p>登録されている家族・連絡先はありません</p>
                  <p className="text-sm mt-2">「新規追加」ボタンから追加してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {familyContactFields.map((field, index) => {
                    const contactId = field.id;
                    const isExpanded = expandedContactId === contactId;
                    const contactData = watch(`familyContacts.${index}`);
                    
                    return (
                      <div key={contactId} className="border rounded-lg bg-white shadow-sm">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b"
                          onClick={() => toggleContactExpansion(contactId)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {contactData?.name || '未入力'}
                                  </span>
                                  {contactData?.relationship && (
                                    <span className="text-gray-600 ml-2">（{contactData.relationship}）</span>
                                  )}
                                </div>
                                <div className="text-gray-600">
                                  {contactData?.phoneNumber || '電話番号未入力'}
                                </div>
                                <div className="text-gray-600">
                                  {contactData?.address || '住所未入力'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFamilyContact(index);
                                  if (expandedContactId === contactId) {
                                    setExpandedContactId(null);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                削除
                              </Button>
                              <span className="text-gray-400 text-sm">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4">
                            <div className="space-y-4">
                              {/* 基本情報 */}
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    氏名 <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.name`)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    生年月日
                                  </Label>
                                  <Input
                                    type="date"
                                    {...register(`familyContacts.${index}.birthDate`)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    続柄 <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.relationship`)}
                                    placeholder="配偶者、息子、娘など"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              {/* 連絡先情報 */}
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    電話番号 <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.phoneNumber`)}
                                    placeholder="090-1234-5678"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    ファックス
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.faxNumber`)}
                                    placeholder="03-1234-5678"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    イーメール
                                  </Label>
                                  <Input
                                    type="email"
                                    {...register(`familyContacts.${index}.email`)}
                                    placeholder="example@email.com"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              {/* 住所情報 */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    住所 <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.address`)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    本籍住所
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.registeredAddress`)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              {/* 送付先・勤務先情報 */}
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    送付先区分
                                  </Label>
                                  <Select 
                                    value={watch(`familyContacts.${index}.mailingType`) || ''} 
                                    onValueChange={(value) => setValue(`familyContacts.${index}.mailingType`, value as 'home' | 'work' | 'other')}
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
                                <div>
                                  <Label className="text-sm font-medium">
                                    勤務先名称
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.companyName`)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    勤務先かな
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.companyNameKana`)}
                                    placeholder="ひらがなで入力"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              {/* 勤務先詳細情報 */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    勤務先住所
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.companyAddress`)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    勤務先電話番号
                                  </Label>
                                  <Input
                                    {...register(`familyContacts.${index}.companyPhone`)}
                                    placeholder="03-1234-5678"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              {/* 備考 */}
                              <div>
                                <Label className="text-sm font-medium">
                                  備考
                                </Label>
                                <Input
                                  {...register(`familyContacts.${index}.notes`)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 住所情報（基本情報用） */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">住所情報</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode" className="text-sm font-medium">
                    郵便番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                    placeholder="123-4567"
                    className="mt-1"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="prefecture" className="text-sm font-medium">
                    都道府県 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prefecture"
                    {...register('prefecture')}
                    className="mt-1"
                  />
                  {errors.prefecture && (
                    <p className="text-red-500 text-sm mt-1">{errors.prefecture.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">
                    市区町村 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register('city')}
                    className="mt-1"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 緊急連絡先（後方互換性） */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">緊急連絡先</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName" className="text-sm font-medium">
                    氏名
                  </Label>
                  <Input
                    id="emergencyName"
                    {...register('emergencyContact.name')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship" className="text-sm font-medium">
                    続柄
                  </Label>
                  <Input
                    id="emergencyRelationship"
                    {...register('emergencyContact.relationship')}
                    placeholder="配偶者、息子、娘など"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                    電話番号
                  </Label>
                  <Input
                    id="emergencyPhone"
                    {...register('emergencyContact.phoneNumber')}
                    placeholder="090-1234-5678"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="burial-info" className="space-y-6 mt-6">
            {/* 埋葬者一覧 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold">埋葬者一覧</h3>
                <Button 
                  type="button" 
                  onClick={handleAddNewBuriedPerson}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  + 新規追加
                </Button>
              </div>
              
              {buriedPersonFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <p>登録されている埋葬者はいません</p>
                  <p className="text-sm mt-2">「新規追加」ボタンから追加してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {buriedPersonFields.map((field, index) => {
                    const buriedPersonData = watch(`buriedPersons.${index}`);
                    
                    return (
                      <div key={field.id} className="border rounded-lg bg-white shadow-sm p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">氏名:</span>
                              <div className="font-medium text-gray-900">
                                {buriedPersonData?.name || '未入力'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">性別:</span>
                              <div className="text-gray-600">
                                {buriedPersonData?.gender === 'male' ? '男性' : buriedPersonData?.gender === 'female' ? '女性' : '未入力'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">埋葬日:</span>
                              <div className="text-gray-600">
                                {buriedPersonData?.burialDate || '未入力'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">メモ:</span>
                              <div className="text-gray-600 truncate">
                                {buriedPersonData?.memo || '未入力'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                removeBuriedPerson(index);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              削除
                            </Button>
                          </div>
                        </div>
                        
                        {/* 編集フォーム */}
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">
                                氏名 <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                {...register(`buriedPersons.${index}.name`)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                性別 <span className="text-red-500">*</span>
                              </Label>
                              <Select 
                                value={watch(`buriedPersons.${index}.gender`) || ''} 
                                onValueChange={(value) => setValue(`buriedPersons.${index}.gender`, value as 'male' | 'female')}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">男性</SelectItem>
                                  <SelectItem value="female">女性</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">
                                埋葬日 <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="date"
                                {...register(`buriedPersons.${index}.burialDate`)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                メモ
                              </Label>
                              <Input
                                {...register(`buriedPersons.${index}.memo`)}
                                placeholder="特記事項があれば入力"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="plot-settings" className="space-y-6 mt-6">
            {/* 区画設定 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold">区画設定</h3>
                <Button
                  type="button"
                  onClick={() => {
                    // TODO: 区画割当追加ロジック
                    console.log('区画追加');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  + 区画を追加
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 ヒント:</strong> 複数の区画・納骨堂を登録できます。既存の区画を選択するか、新規に作成してください。
                  収容人数や合祀の可否、連携ステータスも設定できます。
                </p>
              </div>

              {/* 区画割当が無い場合のメッセージ */}
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">まだ区画が登録されていません</p>
                <p className="text-sm text-gray-400">「+ 区画を追加」ボタンから登録を開始してください</p>
              </div>

              {/* TODO: 動的な区画割当行を実装 */}
              {/* 以下は実装例のプレースホルダー */}
              <div className="space-y-4 hidden">
                {/* 区画行サンプル（後で動的に生成） */}
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-700">区画 #1</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      削除
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* ユニット種別 */}
                    <div>
                      <Label className="text-sm font-medium">
                        ユニット種別 <span className="text-red-500">*</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PLOT_UNIT_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 区画番号 */}
                    <div>
                      <Label className="text-sm font-medium">
                        区画番号
                      </Label>
                      <Input
                        placeholder="例: A-56"
                        className="mt-1"
                      />
                    </div>

                    {/* 区域 */}
                    <div>
                      <Label className="text-sm font-medium">
                        区域
                      </Label>
                      <Input
                        placeholder="例: 東区"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* 面積 */}
                    <div>
                      <Label className="text-sm font-medium">
                        面積（㎡）
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10.5"
                        className="mt-1"
                      />
                    </div>

                    {/* 基本収容人数 */}
                    <div>
                      <Label className="text-sm font-medium">
                        基本収容人数
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="4"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">既定値</p>
                    </div>

                    {/* 収容人数上書き */}
                    <div>
                      <Label className="text-sm font-medium">
                        収容人数上書き
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="変更時のみ"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">空欄=既定値</p>
                    </div>

                    {/* 有効収容人数（自動計算） */}
                    <div>
                      <Label className="text-sm font-medium">
                        有効収容人数
                      </Label>
                      <div className="mt-1 px-3 py-2 bg-gray-100 rounded border text-center font-semibold text-lg">
                        4人
                      </div>
                      <p className="text-xs text-gray-500 mt-1">自動計算</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* 合祀可否 */}
                    <div>
                      <Label className="text-sm font-medium">
                        合祀可否 <span className="text-red-500">*</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">可</SelectItem>
                          <SelectItem value="false">不可</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 所有形態 */}
                    <div>
                      <Label className="text-sm font-medium">
                        所有形態 <span className="text-red-500">*</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(OWNERSHIP_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 連携ステータス */}
                    <div>
                      <Label className="text-sm font-medium">
                        連携ステータス <span className="text-red-500">*</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reserved">予約済み</SelectItem>
                          <SelectItem value="in_use">使用中</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 価格 */}
                    <div>
                      <Label className="text-sm font-medium">
                        価格（円）
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="1500000"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 購入日 */}
                    <div>
                      <Label className="text-sm font-medium">
                        購入日
                      </Label>
                      <Input
                        type="date"
                        className="mt-1"
                      />
                    </div>

                    {/* 備考 */}
                    <div>
                      <Label className="text-sm font-medium">
                        備考
                      </Label>
                      <Input
                        placeholder="特記事項があれば入力"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* 警告メッセージ（在庫重複時など） */}
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 hidden">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>警告:</strong> この区画は既に別の顧客に割り当てられています。共同使用の場合は問題ありません。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="construction" className="space-y-6 mt-6">
            {/* 工事情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">工事情報</h3>
              <p className="text-gray-600">墓石工事に関する情報をここに入力します</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {/* 履歴情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">履歴情報</h3>
              <p className="text-gray-600">これまでの取引履歴・対応履歴をここに表示します</p>
            </div>
          </TabsContent>

        </Tabs>

        {/* フォーム送信ボタン */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isLoading ? '保存中...' : (isEditing ? '更新' : '登録')}
          </Button>
        </div>
      </form>
  );
}