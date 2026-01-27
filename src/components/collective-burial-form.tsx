'use client';

/**
 * 合祀管理フォーム（API連携版）
 * Prisma CollectiveBurialモデルに準拠したフォーム
 */

import { useState, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collectiveBurialFormSchema, CollectiveBurialFormValues } from '@/lib/validations';
import {
  useCollectiveBurialMutations,
  useCollectiveBurialDetail,
} from '@/hooks/useCollectiveBurials';
import {
  serializeNotesData,
  parseNotesData,
  CollectiveBurialDetail,
  BILLING_STATUS_LABELS,
  BillingStatus,
} from '@/lib/api';

interface CollectiveBurialFormProps {
  /** 編集時のID（新規作成時はnull） */
  editId?: string | null;
  /** 送信成功時のコールバック */
  onSubmitSuccess?: () => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 契約区画ID（新規作成時に指定可能） */
  contractPlotId?: string;
}

const defaultValues: CollectiveBurialFormValues = {
  contractPlotId: '',
  burialCapacity: 10,
  validityPeriodYears: 33,
  billingAmount: '',
  burialType: 'family',
  specialRequests: '',
  freeText: '',
  ceremonies: [],
  documents: [],
};

const errorText = (message?: string) => {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
};

export default function CollectiveBurialForm({
  editId,
  onSubmitSuccess,
  onCancel,
  contractPlotId,
}: CollectiveBurialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editId;

  // 編集時のデータ取得
  const { data: existingData, isLoading: isLoadingDetail } = useCollectiveBurialDetail(editId || null);

  // CRUD操作
  const { createCollectiveBurial, updateCollectiveBurial, isLoading: isMutating, error: mutationError } = useCollectiveBurialMutations();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectiveBurialFormValues>({
    // 注意: z.coerce.number()を使用しているため、zodResolverの型推論が正しく機能しません
    // これは@hookform/resolversの既知の制限です。ランタイムでは正常に動作します。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(collectiveBurialFormSchema) as any,
    defaultValues: {
      ...defaultValues,
      contractPlotId: contractPlotId || '',
    },
  });

  // 法要情報フィールド配列
  const {
    fields: ceremonyFields,
    append: appendCeremony,
    remove: removeCeremony,
  } = useFieldArray({
    control,
    name: 'ceremonies',
  });

  // 書類情報フィールド配列
  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: 'documents',
  });

  // 編集時にデータを反映
  useEffect(() => {
    if (existingData && isEditMode) {
      const notesData = parseNotesData(existingData.notes);

      reset({
        contractPlotId: existingData.contractPlotId,
        burialCapacity: existingData.burialCapacity,
        validityPeriodYears: existingData.validityPeriodYears,
        billingAmount: existingData.billingAmount ?? '',
        burialType: notesData.burialType || 'family',
        specialRequests: notesData.specialRequests || '',
        freeText: notesData.freeText || '',
        ceremonies: notesData.ceremonies?.map(c => ({
          date: c.date || '',
          officiant: c.officiant || '',
          religion: c.religion || '',
          participants: c.participants,
          location: c.location || '',
          memo: c.memo || '',
        })) || [],
        documents: notesData.documents?.map(d => ({
          type: d.type,
          name: d.name,
          issuedDate: d.issuedDate || '',
          memo: d.memo || '',
        })) || [],
      });
    }
  }, [existingData, isEditMode, reset]);

  const onSubmit = async (values: CollectiveBurialFormValues) => {
    setIsSubmitting(true);

    try {
      // notesデータを構築
      const notesData = serializeNotesData({
        burialType: values.burialType,
        specialRequests: values.specialRequests,
        freeText: values.freeText,
        ceremonies: values.ceremonies?.filter(c => c.date || c.officiant || c.religion),
        documents: values.documents?.filter(d => d.name),
      });

      if (isEditMode && editId) {
        // 更新
        const result = await updateCollectiveBurial(editId, {
          burialCapacity: values.burialCapacity,
          validityPeriodYears: values.validityPeriodYears,
          billingAmount: typeof values.billingAmount === 'number' ? values.billingAmount : null,
          notes: notesData || null,
        });

        if (result) {
          onSubmitSuccess?.();
        }
      } else {
        // 新規作成
        const result = await createCollectiveBurial({
          contractPlotId: values.contractPlotId,
          burialCapacity: values.burialCapacity,
          validityPeriodYears: values.validityPeriodYears,
          billingAmount: typeof values.billingAmount === 'number' ? values.billingAmount : undefined,
          notes: notesData || undefined,
        });

        if (result) {
          onSubmitSuccess?.();
          reset(defaultValues);
        }
      }
    } catch (error) {
      console.error('Collective burial form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cha"></div>
        <span className="ml-3 text-hai">読み込み中...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 gap-2 bg-white">
          <TabsTrigger value="basic" className="py-2 text-sm">基本情報</TabsTrigger>
          <TabsTrigger value="settings" className="py-2 text-sm">合祀設定</TabsTrigger>
          <TabsTrigger value="ceremonies" className="py-2 text-sm">法要情報</TabsTrigger>
          <TabsTrigger value="documents" className="py-2 text-sm">関連書類</TabsTrigger>
        </TabsList>

        {/* 基本情報タブ */}
        <TabsContent value="basic" className="mt-4 space-y-6">
          <div className="bg-white border border-gin rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-sumi border-b border-gin pb-2">契約区画情報</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractPlotId">契約区画ID *</Label>
                <Input
                  id="contractPlotId"
                  placeholder="例: cp-001"
                  {...register('contractPlotId')}
                  disabled={isEditMode}
                />
                {errorText(errors.contractPlotId?.message)}
                {isEditMode && existingData && (
                  <p className="mt-1 text-sm text-hai">
                    区画番号: {existingData.plotNumber} / 区域: {existingData.areaName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="burialType">合祀種別</Label>
                <Controller
                  control={control}
                  name="burialType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'family'}>
                      <SelectTrigger id="burialType">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">家族合祀</SelectItem>
                        <SelectItem value="relative">親族合祀</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* 編集時は現在のステータスを表示 */}
            {isEditMode && existingData && (
              <div className="mt-4 p-4 bg-kinari rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-hai">埋葬状況:</span>
                    <span className="ml-2 font-semibold text-sumi">
                      {existingData.currentBurialCount} / {existingData.burialCapacity} 名
                    </span>
                  </div>
                  <div>
                    <span className="text-hai">請求ステータス:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${existingData.billingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      existingData.billingStatus === 'billed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {BILLING_STATUS_LABELS[existingData.billingStatus as BillingStatus]}
                    </span>
                  </div>
                  {existingData.capacityReachedDate && (
                    <div>
                      <span className="text-hai">上限到達日:</span>
                      <span className="ml-2 text-sumi">{existingData.capacityReachedDate}</span>
                    </div>
                  )}
                  {existingData.billingScheduledDate && (
                    <div>
                      <span className="text-hai">請求予定日:</span>
                      <span className="ml-2 text-sumi">{existingData.billingScheduledDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gin rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-sumi border-b border-gin pb-2">特別な要望・配慮事項</h3>
            <textarea
              id="specialRequests"
              rows={4}
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              placeholder="宗派や儀礼上の配慮、特記事項など"
              {...register('specialRequests')}
            />

            <h3 className="font-semibold text-sumi border-b border-gin pb-2 mt-6">備考</h3>
            <textarea
              id="freeText"
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              placeholder="その他備考"
              {...register('freeText')}
            />
          </div>
        </TabsContent>

        {/* 合祀設定タブ */}
        <TabsContent value="settings" className="mt-4 space-y-6">
          <div className="bg-white border border-gin rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-sumi border-b border-gin pb-2">埋葬・有効期間設定</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="burialCapacity">埋葬上限人数 *</Label>
                <Input
                  id="burialCapacity"
                  type="number"
                  min={1}
                  max={100}
                  {...register('burialCapacity')}
                />
                {errorText(errors.burialCapacity?.message)}
                <p className="mt-1 text-xs text-hai">この区画に埋葬できる最大人数</p>
              </div>

              <div>
                <Label htmlFor="validityPeriodYears">有効期間（年） *</Label>
                <Input
                  id="validityPeriodYears"
                  type="number"
                  min={1}
                  max={100}
                  {...register('validityPeriodYears')}
                />
                {errorText(errors.validityPeriodYears?.message)}
                <p className="mt-1 text-xs text-hai">上限到達後から請求までの期間</p>
              </div>

              <div>
                <Label htmlFor="billingAmount">請求金額（円）</Label>
                <Input
                  id="billingAmount"
                  type="number"
                  min={0}
                  placeholder="例: 300000"
                  {...register('billingAmount')}
                />
                {errorText(errors.billingAmount?.message)}
              </div>
            </div>

            <div className="mt-4 p-4 bg-ai-50 rounded-lg border border-ai-200">
              <h4 className="font-medium text-ai-dark mb-2">合祀の流れ</h4>
              <ol className="text-sm text-sumi space-y-1 list-decimal list-inside">
                <li>埋葬者が上限に到達すると「上限到達日」が記録されます</li>
                <li>上限到達日 + 有効期間 = 請求予定日が自動計算されます</li>
                <li>請求予定日になったら請求ステータスを「請求済」に更新します</li>
                <li>支払いを確認したら「支払済」に更新します</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        {/* 法要情報タブ */}
        <TabsContent value="ceremonies" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">法要情報</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCeremony({
                date: '',
                officiant: '',
                religion: '',
                participants: undefined,
                location: '',
                memo: '',
              })}
            >
              + 法要追加
            </Button>
          </div>

          {ceremonyFields.length === 0 && (
            <p className="text-sm text-gray-500 bg-kinari p-4 rounded-lg">
              法要情報は未登録です。必要に応じて追加してください。
            </p>
          )}

          {ceremonyFields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">法要 {index + 1}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => removeCeremony(index)}>
                  削除
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`ceremonies-${index}-date`}>実施日</Label>
                  <Input id={`ceremonies-${index}-date`} type="date" {...register(`ceremonies.${index}.date`)} />
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-officiant`}>導師・執行者</Label>
                  <Input id={`ceremonies-${index}-officiant`} {...register(`ceremonies.${index}.officiant`)} />
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-religion`}>宗派</Label>
                  <Input id={`ceremonies-${index}-religion`} {...register(`ceremonies.${index}.religion`)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`ceremonies-${index}-participants`}>参列者数</Label>
                  <Input id={`ceremonies-${index}-participants`} type="number" min={0} {...register(`ceremonies.${index}.participants`)} />
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-location`}>実施場所</Label>
                  <Input id={`ceremonies-${index}-location`} {...register(`ceremonies.${index}.location`)} />
                </div>
              </div>

              <div>
                <Label htmlFor={`ceremonies-${index}-memo`}>備考</Label>
                <Input id={`ceremonies-${index}-memo`} {...register(`ceremonies.${index}.memo`)} />
              </div>
            </div>
          ))}
        </TabsContent>

        {/* 書類情報タブ */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">関連書類</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendDocument({
                type: 'permit',
                name: '',
                issuedDate: '',
                memo: '',
              })}
            >
              + 書類追加
            </Button>
          </div>

          {documentFields.length === 0 && (
            <p className="text-sm text-gray-500 bg-kinari p-4 rounded-lg">
              関連書類は未登録です。必要に応じて追加してください。
            </p>
          )}

          {documentFields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">書類 {index + 1}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => removeDocument(index)}>
                  削除
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`documents-${index}-type`}>書類種別 *</Label>
                  <Controller
                    control={control}
                    name={`documents.${index}.type`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id={`documents-${index}-type`}>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permit">改葬許可証</SelectItem>
                          <SelectItem value="certificate">証明書</SelectItem>
                          <SelectItem value="agreement">同意書</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errorText(errors.documents?.[index]?.type?.message)}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`documents-${index}-name`}>書類名 *</Label>
                  <Input id={`documents-${index}-name`} {...register(`documents.${index}.name`)} />
                  {errorText(errors.documents?.[index]?.name?.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`documents-${index}-issuedDate`}>発行日</Label>
                  <Input id={`documents-${index}-issuedDate`} type="date" {...register(`documents.${index}.issuedDate`)} />
                </div>
                <div>
                  <Label htmlFor={`documents-${index}-memo`}>備考</Label>
                  <Input id={`documents-${index}-memo`} {...register(`documents.${index}.memo`)} />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* エラー表示 */}
      {mutationError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {mutationError}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 border-t border-gin">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => reset(isEditMode && existingData ? undefined : defaultValues)}
        >
          リセット
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isMutating}
          className="bg-cha hover:bg-cha-dark"
        >
          {isSubmitting || isMutating ? '保存中...' : isEditMode ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
