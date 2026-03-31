'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  plotFormSchema,
  defaultPlotFormData,
  plotDetailToFormData,
} from '@/lib/validations/plot-form';
import type { PlotFormData } from '@/lib/validations/plot-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMasters } from '@/hooks';
import { showWarning } from '@/lib/toast';

import type { PlotFormProps, MasterData } from './types';
import { BasicInfoTab } from './BasicInfoTab';
import { WorkBillingTab } from './WorkBillingTab';
import { ContactsTab } from './ContactsTab';
import { BurialInfoTab } from './BurialInfoTab';
export default function PlotForm({ plotDetail, onSave, isLoading }: PlotFormProps) {
  const isEditing = !!plotDetail;

  const {
    calcTypes,
    taxTypes,
    billingTypes,
    paymentMethods,
    accountTypes,
    sectionNames,
    isLoading: isMasterLoading,
  } = useMasters();

  const masterData: MasterData = {
    calcTypes,
    taxTypes,
    billingTypes,
    paymentMethods,
    accountTypes,
    sectionNames,
    isLoading: isMasterLoading,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotFormSchema) as Resolver<PlotFormData>,
    defaultValues: plotDetail
      ? plotDetailToFormData(plotDetail)
      : defaultPlotFormData,
  });

  // plotDetail が後から到着した場合にフォームを更新
  useEffect(() => {
    if (plotDetail) {
      reset(plotDetailToFormData(plotDetail));
    }
  }, [plotDetail, reset]);

  const {
    fields: familyContactFields,
    append: addFamilyContact,
    remove: removeFamilyContact,
  } = useFieldArray({ control, name: 'familyContacts' });

  const {
    fields: buriedPersonFields,
    append: addBuriedPerson,
    remove: removeBuriedPerson,
  } = useFieldArray({ control, name: 'buriedPersons' });

  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const onSubmit = (data: PlotFormData) => {
    onSave(data);
  };

  const onError = () => {
    showWarning('入力エラーがあります', 'エラー箇所を確認してください');
  };

  const tabBaseProps = {
    register,
    watch,
    setValue,
    errors,
    control,
    masterData,
  };

  // タブ定義: フィールドグループ → タブ名の対応
  const tabConfig = {
    'basic-info': {
      label: '区画・契約情報',
      sections: ['physicalPlot', 'contractPlot', 'saleContract', 'customer', 'usageFee', 'managementFee', 'gravestoneInfo'],
    },
    'work-billing': {
      label: '勤務先・請求',
      sections: ['workInfo', 'billingInfo'],
    },
    'contacts': {
      label: '連絡先/家族',
      sections: ['familyContacts'],
    },
    'burial-info': {
      label: '埋葬情報',
      sections: ['buriedPersons', 'collectiveBurial'],
    },
  } satisfies Record<string, { label: string; sections: string[] }>;

  // フィールドパス → 日本語ラベルのマッピング
  const fieldLabels: Record<string, string> = {
    // 物理区画
    'physicalPlot.plotNumber': '区画番号',
    'physicalPlot.areaName': '区画（期）',
    'physicalPlot.areaSqm': '面積',
    'physicalPlot.notes': '備考',
    // 契約区画
    'contractPlot.contractAreaSqm': '契約面積',
    'contractPlot.locationDescription': '区画位置詳細',
    // 販売契約
    'saleContract.contractDate': '契約日',
    'saleContract.price': '金額',
    'saleContract.paymentStatus': '支払状態',
    'saleContract.reservationDate': '予約日',
    'saleContract.acceptanceNumber': '受付番号',
    'saleContract.acceptanceDate': '受付日',
    'saleContract.permitDate': '許可日',
    'saleContract.permitNumber': '許可番号',
    'saleContract.startDate': '使用開始日',
    'saleContract.staffInCharge': '担当者',
    'saleContract.agentName': '取扱',
    'saleContract.notes': '備考',
    // 契約者
    'customer.name': '氏名',
    'customer.nameKana': '氏名カナ',
    'customer.birthDate': '生年月日',
    'customer.gender': '性別',
    'customer.postalCode': '郵便番号',
    'customer.address': '住所',
    'customer.addressLine2': '住所2',
    'customer.registeredAddress': '本籍地',
    'customer.phoneNumber': '電話番号',
    'customer.faxNumber': 'FAX',
    'customer.email': 'メール',
    'customer.role': '役割',
    'customer.notes': '備考',
    // 勤務先
    'workInfo.companyName': '勤務先名称',
    'workInfo.companyNameKana': '勤務先名称カナ',
    'workInfo.workPostalCode': '勤務先郵便番号',
    'workInfo.workPhoneNumber': '勤務先電話番号',
    'workInfo.workAddress': '勤務先住所',
    'workInfo.dmSetting': 'DM送信設定',
    'workInfo.addressType': '宛先区分',
    'workInfo.notes': '備考',
    // 請求情報
    'billingInfo.billingType': '請求区分',
    'billingInfo.bankName': '金融機関名',
    'billingInfo.branchName': '支店名',
    'billingInfo.accountType': '口座種別',
    'billingInfo.accountNumber': '口座番号',
    'billingInfo.accountHolder': '口座名義',
    // 使用料
    'usageFee.calculationType': '計算区分',
    'usageFee.taxType': '税区分',
    'usageFee.billingType': '請求区分',
    'usageFee.billingYears': '請求年数',
    'usageFee.usageFee': '使用料',
    'usageFee.area': '面積',
    'usageFee.unitPrice': '単価',
    'usageFee.paymentMethod': '支払方法',
    // 管理料
    'managementFee.calculationType': '計算区分',
    'managementFee.taxType': '税区分',
    'managementFee.billingType': '請求区分',
    'managementFee.billingYears': '請求年数',
    'managementFee.area': '面積',
    'managementFee.billingMonth': '請求月',
    'managementFee.managementFee': '管理料',
    'managementFee.unitPrice': '単価',
    'managementFee.lastBillingMonth': '最終請求月',
    'managementFee.paymentMethod': '支払方法',
    // 墓石情報
    'gravestoneInfo.gravestoneBase': '墓石台',
    'gravestoneInfo.enclosurePosition': '外柵位置',
    'gravestoneInfo.gravestoneDealer': '石材店',
    'gravestoneInfo.gravestoneType': '墓石種類',
    'gravestoneInfo.surroundingArea': '周辺面積',
    'gravestoneInfo.gravestoneCost': '墓石代',
    'gravestoneInfo.establishmentDeadline': '建立期限',
    'gravestoneInfo.establishmentDate': '建立日',
    // 家族連絡先（配列内フィールド）
    'name': '氏名',
    'nameKana': '読み（かな）',
    'relationship': '続柄',
    'birthDate': '生年月日',
    'postalCode': '郵便番号',
    'address': '住所',
    'phoneNumber': '電話番号',
    'phoneNumber2': '電話番号2',
    'faxNumber': 'FAX',
    'email': 'メール',
    'registeredAddress': '本籍地',
    'mailingType': '宛先区分',
    'workCompanyName': '勤務先名称',
    'workCompanyNameKana': '勤務先かな',
    'workAddress': '勤務先住所',
    'workPhoneNumber': '勤務先電話番号',
    'contactMethod': '連絡区分',
    'notes': '備考',
    // 埋葬者（配列内フィールド）
    'deathDate': '命日',
    'age': '享年',
    'gender': '性別',
    'burialDate': '埋葬日',
    'posthumousName': '戒名',
    'reportDate': '届出日',
    'religion': '宗派',
    // 合祀設定
    'collectiveBurial.burialCapacity': '埋葬上限数',
    'collectiveBurial.validityPeriodYears': '有効期間（年）',
    'collectiveBurial.billingAmount': '請求金額',
    'collectiveBurial.notes': '備考',
  };

  // 配列フィールドのセクション名
  const arraySectionLabels: Record<string, string> = {
    familyContacts: '家族連絡先',
    buriedPersons: '埋葬者',
  };

  // フィールドパスからタブ名を取得
  const getTabLabel = (path: string): string => {
    const topKey = path.split('.')[0];
    for (const tab of Object.values(tabConfig)) {
      if (tab.sections.includes(topKey)) return tab.label;
    }
    return '';
  };

  // フィールドパスから日本語ラベルを取得
  const getFieldLabel = (path: string): string => {
    // 完全一致
    if (fieldLabels[path]) return fieldLabels[path];

    // 配列パターン: familyContacts.0.name → 家族連絡先[1] 氏名
    const arrayMatch = path.match(/^(\w+)\.(\d+)\.(.+)$/);
    if (arrayMatch) {
      const [, section, index, field] = arrayMatch;
      const sectionLabel = arraySectionLabels[section] || section;
      const fieldLabel = fieldLabels[field] || field;
      return `${sectionLabel}[${Number(index) + 1}] ${fieldLabel}`;
    }

    return path;
  };

  // エラーメッセージを整形（ネストされたエラーも再帰的に収集）
  const collectErrors = (obj: Record<string, unknown>, prefix = ''): string[] => {
    const messages: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('message' in value && typeof value.message === 'string') {
          const path = `${prefix}${key}`;
          const tabLabel = getTabLabel(path);
          const fieldLabel = getFieldLabel(path);
          const label = tabLabel ? `[${tabLabel}] ${fieldLabel}` : fieldLabel;
          messages.push(`${label}: ${value.message}`);
        } else {
          messages.push(...collectErrors(value as Record<string, unknown>, `${prefix}${key}.`));
        }
      }
    }
    return messages;
  };
  const errorMessages = collectErrors(errors as Record<string, unknown>);

  // エラーがあるタブを判定
  const tabsWithErrors = new Set<string>();
  for (const key of Object.keys(errors)) {
    for (const [tabKey, tab] of Object.entries(tabConfig)) {
      if (tab.sections.includes(key)) {
        tabsWithErrors.add(tabKey);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="w-full">
      {errorMessages.length > 0 && (
        <div className="mb-4 p-4 bg-beni-50 border border-beni-200 rounded-elegant">
          <h4 className="text-beni-dark font-semibold mb-2">入力エラーがあります</h4>
          <ul className="list-disc list-inside text-beni text-sm">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          {Object.entries(tabConfig).map(([tabKey, tab]) => {
            const hasError = tabsWithErrors.has(tabKey);
            return (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                className={`relative py-2 data-[state=active]:bg-matsu data-[state=active]:text-white ${hasError ? 'text-beni border-b-2 border-beni data-[state=active]:bg-beni' : ''
                  }`}
              >
                {hasError && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-beni text-white text-[10px] font-bold leading-none">
                    !
                  </span>
                )}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="basic-info" className="space-y-6 mt-6">
          <BasicInfoTab {...tabBaseProps} />
        </TabsContent>

        <TabsContent value="work-billing" className="space-y-6 mt-6">
          <WorkBillingTab {...tabBaseProps} />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <ContactsTab
            {...tabBaseProps}
            familyContactFields={familyContactFields}
            addFamilyContact={addFamilyContact}
            removeFamilyContact={removeFamilyContact}
            expandedContactId={expandedContactId}
            setExpandedContactId={setExpandedContactId}
          />
        </TabsContent>

        <TabsContent value="burial-info" className="space-y-6 mt-6">
          <BurialInfoTab
            {...tabBaseProps}
            buriedPersonFields={buriedPersonFields}
            addBuriedPerson={addBuriedPerson}
            removeBuriedPerson={removeBuriedPerson}
          />
        </TabsContent>

      </Tabs>

      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-matsu hover:bg-matsu-dark text-white px-6"
        >
          {isLoading ? '保存中...' : isEditing ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
