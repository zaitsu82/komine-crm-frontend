'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collectiveBurialApplicationSchema, CollectiveBurialApplicationFormValues } from '@/lib/validations';
import { createCollectiveBurialApplication, getCollectiveBurialApplications } from '@/lib/collective-burial';
import { CollectiveBurialApplication } from '@/types/collective-burial';
import CapacityWarningDialog from '@/components/capacity-warning-dialog';
import { COLLECTIVE_BURIAL_LIMITS, getCapacityStatus, getRemainingCapacity, getCapacityPercentage } from '@/config/collective-burial-limits';

interface CollectiveBurialApplicationFormProps {
  onSubmitSuccess?: (application: CollectiveBurialApplication) => void;
}

const todayString = new Date().toISOString().split('T')[0];

const defaultValues: CollectiveBurialApplicationFormValues = {
  applicationDate: todayString,
  desiredDate: '',
  burialType: 'family',
  mainRepresentative: '',
  applicantName: '',
  applicantNameKana: '',
  applicantPhone: '',
  applicantEmail: '',
  applicantPostalCode: '',
  applicantAddress: '',
  plotSection: '',
  plotNumber: '',
  specialRequests: '',
  totalFee: '',
  depositAmount: '',
  paymentMethod: '',
  paymentDueDate: '',
  persons: [
    {
      name: '',
      nameKana: '',
      relationship: '',
      deathDate: '',
      age: '',
      gender: '',
      originalPlotNumber: '',
      certificateNumber: '',
      memo: '',
    },
  ],
  ceremonies: [],
  documents: [],
};

const errorText = (message?: string) => {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
};

export default function CollectiveBurialApplicationForm({ onSubmitSuccess }: CollectiveBurialApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [capacityStatus, setCapacityStatus] = useState<'safe' | 'warning' | 'critical' | 'full'>('safe');
  const [pendingSubmitData, setPendingSubmitData] = useState<CollectiveBurialApplicationFormValues | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectiveBurialApplicationFormValues>({
    resolver: zodResolver(collectiveBurialApplicationSchema),
    defaultValues,
  });

  const {
    fields: personFields,
    append: appendPerson,
    remove: removePerson,
  } = useFieldArray({
    control,
    name: 'persons',
  });

  const {
    fields: ceremonyFields,
    append: appendCeremony,
    remove: removeCeremony,
  } = useFieldArray({
    control,
    name: 'ceremonies',
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: 'documents',
  });

  // 現在の合祀人数を計算
  const getCurrentTotalPersons = (): number => {
    const applications = getCollectiveBurialApplications();
    return applications.reduce((total, app) => {
      // 完了済みとキャンセル以外をカウント
      if (app.status !== 'cancelled') {
        return total + app.persons.length;
      }
      return total;
    }, 0);
  };

  // 人数チェックを実行
  const checkCapacity = (values: CollectiveBurialApplicationFormValues): boolean => {
    const currentTotal = getCurrentTotalPersons();
    const newPersonsCount = values.persons.length;
    const futureTotal = currentTotal + newPersonsCount;
    const maxCapacity = COLLECTIVE_BURIAL_LIMITS.MAX_TOTAL_CAPACITY;

    const status = getCapacityStatus(futureTotal, maxCapacity);

    // 1申込あたりの上限チェック
    if (newPersonsCount > COLLECTIVE_BURIAL_LIMITS.MAX_PERSONS_PER_APPLICATION) {
      alert(`1つの申込で登録できる故人数は${COLLECTIVE_BURIAL_LIMITS.MAX_PERSONS_PER_APPLICATION}名までです。\n現在: ${newPersonsCount}名`);
      return false;
    }

    // 全体の上限チェック
    if (status === 'full' || futureTotal > maxCapacity) {
      setCapacityStatus('full');
      setShowCapacityWarning(true);
      return false;
    }

    // 警告表示（続行可能）
    if (status === 'warning' || status === 'critical') {
      setCapacityStatus(status);
      setPendingSubmitData(values);
      setShowCapacityWarning(true);
      return false; // 一旦停止して警告表示
    }

    return true; // 問題なし
  };

  const performSubmit = async (values: CollectiveBurialApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      const application = await createCollectiveBurialApplication(values);
      setLastCreatedId(application.id);
      onSubmitSuccess?.(application);
      reset({
        ...defaultValues,
        applicationDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Collective burial application creation failed:', error);
      alert('合祀申込の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
      setPendingSubmitData(null);
    }
  };

  const onSubmit = async (values: CollectiveBurialApplicationFormValues) => {
    // 人数チェック
    const canProceed = checkCapacity(values);
    if (canProceed) {
      await performSubmit(values);
    }
  };

  const handleCapacityWarningContinue = async () => {
    setShowCapacityWarning(false);
    if (pendingSubmitData) {
      await performSubmit(pendingSubmitData);
    }
  };

  const handleCapacityWarningClose = () => {
    setShowCapacityWarning(false);
    setPendingSubmitData(null);
  };

  // 現在の状況を計算
  const currentTotal = getCurrentTotalPersons();
  const maxCapacity = COLLECTIVE_BURIAL_LIMITS.MAX_TOTAL_CAPACITY;
  const remaining = getRemainingCapacity(currentTotal, maxCapacity);
  const percentage = getCapacityPercentage(currentTotal, maxCapacity);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-5 gap-2 bg-white">
          <TabsTrigger value="basic" className="py-2 text-sm">基本情報</TabsTrigger>
          <TabsTrigger value="persons" className="py-2 text-sm">故人情報</TabsTrigger>
          <TabsTrigger value="ceremonies" className="py-2 text-sm">法要情報</TabsTrigger>
          <TabsTrigger value="documents" className="py-2 text-sm">関連書類</TabsTrigger>
          <TabsTrigger value="payment" className="py-2 text-sm">料金情報</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="applicationDate">申込日 *</Label>
              <Input id="applicationDate" type="date" {...register('applicationDate')} />
              {errorText(errors.applicationDate?.message)}
            </div>
            <div>
              <Label htmlFor="desiredDate">合祀希望日</Label>
              <Input id="desiredDate" type="date" {...register('desiredDate')} />
              {errorText(errors.desiredDate?.message as string | undefined)}
            </div>
            <div>
              <Label htmlFor="burialType">合祀種別 *</Label>
              <Controller
                control={control}
                name="burialType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {errorText(errors.burialType?.message)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="mainRepresentative">主たる代表者 *</Label>
              <Input id="mainRepresentative" placeholder="例: 長男" {...register('mainRepresentative')} />
              {errorText(errors.mainRepresentative?.message)}
            </div>
            <div>
              <Label htmlFor="plotSection">区域 *</Label>
              <Input id="plotSection" placeholder="例: 東区" {...register('plotSection')} />
              {errorText(errors.plotSection?.message)}
            </div>
            <div>
              <Label htmlFor="plotNumber">区画番号 *</Label>
              <Input id="plotNumber" placeholder="例: A-001" {...register('plotNumber')} />
              {errorText(errors.plotNumber?.message)}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold">申込者情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="applicantName">申込者氏名 *</Label>
                <Input id="applicantName" {...register('applicantName')} />
                {errorText(errors.applicantName?.message)}
              </div>
              <div>
                <Label htmlFor="applicantNameKana">申込者氏名（カナ） *</Label>
                <Input id="applicantNameKana" {...register('applicantNameKana')} />
                {errorText(errors.applicantNameKana?.message)}
              </div>
              <div>
                <Label htmlFor="applicantPhone">連絡先電話番号 *</Label>
                <Input id="applicantPhone" placeholder="例: 090-0000-0000" {...register('applicantPhone')} />
                {errorText(errors.applicantPhone?.message)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="applicantEmail">メールアドレス</Label>
                <Input id="applicantEmail" type="email" placeholder="example@example.com" {...register('applicantEmail')} />
                {errorText(errors.applicantEmail?.message)}
              </div>
              <div>
                <Label htmlFor="applicantPostalCode">郵便番号</Label>
                <Input id="applicantPostalCode" placeholder="123-4567" {...register('applicantPostalCode')} />
                {errorText(errors.applicantPostalCode?.message)}
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="paymentDueDate">支払期日</Label>
                <Input id="paymentDueDate" type="date" {...register('paymentDueDate')} />
                {errorText(errors.paymentDueDate?.message)}
              </div>
            </div>
            <div>
              <Label htmlFor="applicantAddress">住所 *</Label>
              <Input id="applicantAddress" placeholder="都道府県 市区町村 町名番地" {...register('applicantAddress')} />
              {errorText(errors.applicantAddress?.message)}
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests">特別な要望・配慮事項</Label>
            <textarea
              id="specialRequests"
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              placeholder="宗派や儀礼上の配慮、特記事項など"
              {...register('specialRequests')}
            />
            {errorText(errors.specialRequests?.message)}
          </div>
        </TabsContent>

        <TabsContent value="persons" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">合祀対象者一覧</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => appendPerson({
              name: '',
              nameKana: '',
              relationship: '',
              deathDate: '',
              age: '',
              gender: '',
              originalPlotNumber: '',
              certificateNumber: '',
              memo: '',
            })}>
              + 対象者追加
            </Button>
          </div>

          {personFields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">対象者 {index + 1}</p>
                {personFields.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removePerson(index)}>
                    削除
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`persons-${index}-name`}>氏名 *</Label>
                  <Input id={`persons-${index}-name`} {...register(`persons.${index}.name`)} />
                  {errorText(errors.persons?.[index]?.name?.message)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-nameKana`}>氏名（カナ） *</Label>
                  <Input id={`persons-${index}-nameKana`} {...register(`persons.${index}.nameKana`)} />
                  {errorText(errors.persons?.[index]?.nameKana?.message)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-relationship`}>続柄 *</Label>
                  <Input id={`persons-${index}-relationship`} {...register(`persons.${index}.relationship`)} />
                  {errorText(errors.persons?.[index]?.relationship?.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`persons-${index}-deathDate`}>死亡日 *</Label>
                  <Input id={`persons-${index}-deathDate`} type="date" {...register(`persons.${index}.deathDate`)} />
                  {errorText(errors.persons?.[index]?.deathDate?.message)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-age`}>享年</Label>
                  <Input id={`persons-${index}-age`} type="number" min={0} {...register(`persons.${index}.age`)} />
                  {errorText(errors.persons?.[index]?.age?.message)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-gender`}>性別</Label>
                  <Controller
                    control={control}
                    name={`persons.${index}.gender`}
                    render={({ field }) => (
                      <Select
                        value={field.value && field.value !== '' ? field.value : 'none'}
                        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      >
                        <SelectTrigger id={`persons-${index}-gender`}>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">未選択</SelectItem>
                          <SelectItem value="male">男性</SelectItem>
                          <SelectItem value="female">女性</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errorText(errors.persons?.[index]?.gender?.message as string | undefined)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-originalPlotNumber`}>元の墓所</Label>
                  <Input id={`persons-${index}-originalPlotNumber`} {...register(`persons.${index}.originalPlotNumber`)} />
                  {errorText(errors.persons?.[index]?.originalPlotNumber?.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`persons-${index}-certificateNumber`}>改葬許可証番号</Label>
                  <Input id={`persons-${index}-certificateNumber`} {...register(`persons.${index}.certificateNumber`)} />
                  {errorText(errors.persons?.[index]?.certificateNumber?.message)}
                </div>
                <div>
                  <Label htmlFor={`persons-${index}-memo`}>備考</Label>
                  <Input id={`persons-${index}-memo`} {...register(`persons.${index}.memo`)} />
                  {errorText(errors.persons?.[index]?.memo?.message)}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

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
                participants: '',
                location: '',
                memo: '',
              })}
            >
              + 法要追加
            </Button>
          </div>

          {ceremonyFields.length === 0 && (
            <p className="text-sm text-gray-500">法要情報は未登録です。必要に応じて追加してください。</p>
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
                  {errorText(errors.ceremonies?.[index]?.date?.message)}
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-officiant`}>導師・執行者</Label>
                  <Input id={`ceremonies-${index}-officiant`} {...register(`ceremonies.${index}.officiant`)} />
                  {errorText(errors.ceremonies?.[index]?.officiant?.message)}
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-religion`}>宗派</Label>
                  <Input id={`ceremonies-${index}-religion`} {...register(`ceremonies.${index}.religion`)} />
                  {errorText(errors.ceremonies?.[index]?.religion?.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`ceremonies-${index}-participants`}>参列者数</Label>
                  <Input id={`ceremonies-${index}-participants`} type="number" min={0} {...register(`ceremonies.${index}.participants`)} />
                  {errorText(errors.ceremonies?.[index]?.participants?.message)}
                </div>
                <div>
                  <Label htmlFor={`ceremonies-${index}-location`}>実施場所</Label>
                  <Input id={`ceremonies-${index}-location`} {...register(`ceremonies.${index}.location`)} />
                  {errorText(errors.ceremonies?.[index]?.location?.message)}
                </div>
              </div>

              <div>
                <Label htmlFor={`ceremonies-${index}-memo`}>備考</Label>
                <Input id={`ceremonies-${index}-memo`} {...register(`ceremonies.${index}.memo`)} />
                {errorText(errors.ceremonies?.[index]?.memo?.message)}
              </div>
            </div>
          ))}
        </TabsContent>

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
            <p className="text-sm text-gray-500">関連書類は未登録です。必要に応じて追加してください。</p>
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
                  {errorText(errors.documents?.[index]?.issuedDate?.message)}
                </div>
                <div>
                  <Label htmlFor={`documents-${index}-memo`}>備考</Label>
                  <Input id={`documents-${index}-memo`} {...register(`documents.${index}.memo`)} />
                  {errorText(errors.documents?.[index]?.memo?.message)}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="payment" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalFee">合祀料金総額</Label>
                <Input id="totalFee" type="number" min={0} {...register('totalFee')} />
                {errorText(errors.totalFee?.message)}
              </div>
              <div>
                <Label htmlFor="depositAmount">内金・手付金</Label>
                <Input id="depositAmount" type="number" min={0} {...register('depositAmount')} />
                {errorText(errors.depositAmount?.message)}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">支払方法</Label>
              <Input id="paymentMethod" placeholder="例: 銀行振込、現金" {...register('paymentMethod')} />
              {errorText(errors.paymentMethod?.message)}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {lastCreatedId && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          申込ID「{lastCreatedId}」で登録しました。合祀実施記録タブから内容を確認できます。
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset({
            ...defaultValues,
            applicationDate: new Date().toISOString().split('T')[0],
          })}
        >
          リセット
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </div>
    </form>

      {/* 人数上限警告ダイアログ */}
      <CapacityWarningDialog
        isOpen={showCapacityWarning}
        onClose={handleCapacityWarningClose}
        onContinue={capacityStatus !== 'full' ? handleCapacityWarningContinue : undefined}
        status={capacityStatus === 'safe' ? 'warning' : capacityStatus}
        current={currentTotal + (pendingSubmitData?.persons.length || 0)}
        max={maxCapacity}
        remaining={remaining - (pendingSubmitData?.persons.length || 0)}
        percentage={getCapacityPercentage(
          currentTotal + (pendingSubmitData?.persons.length || 0),
          maxCapacity
        )}
      />
    </>
  );
}
