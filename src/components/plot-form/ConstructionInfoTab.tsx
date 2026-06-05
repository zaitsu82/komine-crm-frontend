'use client';

import { useState } from 'react';
import { ConstructionInfoTabProps, getDefaultConstructionInfo } from './types';
import { MasterFallbackSelectItem, ViewModeSelect } from './ViewModeField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

export function ConstructionInfoTab({
  register,
  watch,
  setValue,
  constructionInfoFields,
  addConstructionInfo,
  removeConstructionInfo,
  masterData,
}: ConstructionInfoTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const contractors = masterData?.contractors ?? [];
  // 名称解決は無効を含む全件で行う（#238: 無効化済み業者を参照する既存工事の表示維持）
  const allContractors = masterData?.all?.contractors ?? contractors;

  const getContractorLabel = (value: string | null | undefined): string => {
    if (!value) return '未入力';
    const master = allContractors.find((c) => c.code === value);
    return master ? master.name : value;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">工事情報</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addConstructionInfo(getDefaultConstructionInfo())}
        >
          <Plus className="h-4 w-4 mr-1" />
          工事を追加
        </Button>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-kinari border rounded-md text-sm font-semibold">
        <div>業者名</div>
        <div>工事種別</div>
        <div>進捗</div>
        <div>工事開始日</div>
      </div>

      {/* Construction Info Rows */}
      <div className="space-y-3">
        {constructionInfoFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg overflow-hidden">
            {/* Summary Row */}
            <div
              className="flex items-center justify-between p-3 bg-kinari border rounded-md cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
              onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
            >
              <div className="grid grid-cols-4 gap-4 flex-1 text-sm">
                <span className="font-medium">
                  {getContractorLabel(watch(`constructionInfos.${index}.contractor`))}
                </span>
                <span>{watch(`constructionInfos.${index}.constructionType`) || '-'}</span>
                <span>{watch(`constructionInfos.${index}.progress`) || '-'}</span>
                <span>{watch(`constructionInfos.${index}.startDate`) || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="削除"
                  aria-label="工事情報を削除"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeConstructionInfo(index);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-beni" />
                </Button>
                {expandedId === field.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>

            {/* Expanded Fields */}
            {expandedId === field.id && (
              <div className="p-4 bg-white space-y-6">
                {/* 基本情報 */}
                <div>
                  <h4 className="text-sm font-medium text-sumi mb-3">工事基本情報</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.constructionType`}>工事種別</Label>
                      <Input
                        id={`constructionInfos.${index}.constructionType`}
                        {...register(`constructionInfos.${index}.constructionType`)}
                      />
                    </div>
                    <div>
                      {(() => {
                        const currentValue = watch(`constructionInfos.${index}.contractor`) || '';
                        return (
                          <ViewModeSelect
                            label="業者名"
                            value={currentValue}
                            onValueChange={(v) =>
                              setValue(`constructionInfos.${index}.contractor`, v)
                            }
                            placeholder="選択..."
                          >
                            {contractors.map((c) => (
                              <SelectItem key={c.id} value={c.code}>
                                {c.name}
                              </SelectItem>
                            ))}
                            {/* 無効化済み・未登録の既存値はフォールバック表示（#238） */}
                            <MasterFallbackSelectItem
                              value={currentValue}
                              masters={allContractors}
                            />
                          </ViewModeSelect>
                        );
                      })()}
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.supervisor`}>監督者</Label>
                      <Input
                        id={`constructionInfos.${index}.supervisor`}
                        {...register(`constructionInfos.${index}.supervisor`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.constructionContent`}>工事内容</Label>
                      <Input
                        id={`constructionInfos.${index}.constructionContent`}
                        {...register(`constructionInfos.${index}.constructionContent`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.progress`}>進捗</Label>
                      <Input
                        id={`constructionInfos.${index}.progress`}
                        {...register(`constructionInfos.${index}.progress`)}
                      />
                    </div>
                  </div>
                </div>

                {/* 日程 */}
                <div>
                  <h4 className="text-sm font-medium text-sumi mb-3">日程</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.startDate`}>工事開始日</Label>
                      <Input
                        id={`constructionInfos.${index}.startDate`}
                        type="date"
                        {...register(`constructionInfos.${index}.startDate`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.completionDate`}>工事終了日</Label>
                      <Input
                        id={`constructionInfos.${index}.completionDate`}
                        type="date"
                        {...register(`constructionInfos.${index}.completionDate`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.scheduledEndDate`}>終了予定日</Label>
                      <Input
                        id={`constructionInfos.${index}.scheduledEndDate`}
                        type="date"
                        {...register(`constructionInfos.${index}.scheduledEndDate`)}
                      />
                    </div>
                  </div>
                </div>

                {/* 許可情報 */}
                <div>
                  <h4 className="text-sm font-medium text-sumi mb-3">許可・申請情報</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.permitNumber`}>許可番号</Label>
                      <Input
                        id={`constructionInfos.${index}.permitNumber`}
                        {...register(`constructionInfos.${index}.permitNumber`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.applicationDate`}>申請日</Label>
                      <Input
                        id={`constructionInfos.${index}.applicationDate`}
                        type="date"
                        {...register(`constructionInfos.${index}.applicationDate`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.permitDate`}>許可日</Label>
                      <Input
                        id={`constructionInfos.${index}.permitDate`}
                        type="date"
                        {...register(`constructionInfos.${index}.permitDate`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`constructionInfos.${index}.permitStatus`}>許可状態</Label>
                      <Input
                        id={`constructionInfos.${index}.permitStatus`}
                        {...register(`constructionInfos.${index}.permitStatus`)}
                      />
                    </div>
                  </div>
                </div>

                {/* 工事項目 */}
                <div>
                  <h4 className="text-sm font-medium text-sumi mb-3">工事項目</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 項目1 */}
                    <div className="border border-gin rounded-elegant p-3 space-y-3">
                      <p className="text-xs font-medium text-hai">項目1</p>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workItem1`}>項目名</Label>
                        <Input
                          id={`constructionInfos.${index}.workItem1`}
                          {...register(`constructionInfos.${index}.workItem1`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workDate1`}>日付</Label>
                        <Input
                          id={`constructionInfos.${index}.workDate1`}
                          type="date"
                          {...register(`constructionInfos.${index}.workDate1`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workAmount1`}>金額</Label>
                        <Input
                          id={`constructionInfos.${index}.workAmount1`}
                          type="number"
                          {...register(`constructionInfos.${index}.workAmount1`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workStatus1`}>状態</Label>
                        <Input
                          id={`constructionInfos.${index}.workStatus1`}
                          {...register(`constructionInfos.${index}.workStatus1`)}
                        />
                      </div>
                    </div>
                    {/* 項目2 */}
                    <div className="border border-gin rounded-elegant p-3 space-y-3">
                      <p className="text-xs font-medium text-hai">項目2</p>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workItem2`}>項目名</Label>
                        <Input
                          id={`constructionInfos.${index}.workItem2`}
                          {...register(`constructionInfos.${index}.workItem2`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workDate2`}>日付</Label>
                        <Input
                          id={`constructionInfos.${index}.workDate2`}
                          type="date"
                          {...register(`constructionInfos.${index}.workDate2`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workAmount2`}>金額</Label>
                        <Input
                          id={`constructionInfos.${index}.workAmount2`}
                          type="number"
                          {...register(`constructionInfos.${index}.workAmount2`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.workStatus2`}>状態</Label>
                        <Input
                          id={`constructionInfos.${index}.workStatus2`}
                          {...register(`constructionInfos.${index}.workStatus2`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 入金情報 */}
                <div>
                  <h4 className="text-sm font-medium text-sumi mb-3">入金情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 入金1 */}
                    <div className="border border-gin rounded-elegant p-3 space-y-3">
                      <p className="text-xs font-medium text-hai">入金1</p>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentType1`}>入金種別</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentType1`}
                          {...register(`constructionInfos.${index}.paymentType1`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentAmount1`}>入金額</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentAmount1`}
                          type="number"
                          {...register(`constructionInfos.${index}.paymentAmount1`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentDate1`}>入金日</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentDate1`}
                          type="date"
                          {...register(`constructionInfos.${index}.paymentDate1`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentStatus1`}>状態</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentStatus1`}
                          {...register(`constructionInfos.${index}.paymentStatus1`)}
                        />
                      </div>
                    </div>
                    {/* 入金2 */}
                    <div className="border border-gin rounded-elegant p-3 space-y-3">
                      <p className="text-xs font-medium text-hai">入金2</p>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentType2`}>入金種別</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentType2`}
                          {...register(`constructionInfos.${index}.paymentType2`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentAmount2`}>入金額</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentAmount2`}
                          type="number"
                          {...register(`constructionInfos.${index}.paymentAmount2`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentScheduledDate2`}>入金予定日</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentScheduledDate2`}
                          type="date"
                          {...register(`constructionInfos.${index}.paymentScheduledDate2`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`constructionInfos.${index}.paymentStatus2`}>状態</Label>
                        <Input
                          id={`constructionInfos.${index}.paymentStatus2`}
                          {...register(`constructionInfos.${index}.paymentStatus2`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 備考 */}
                <div>
                  <Label htmlFor={`constructionInfos.${index}.notes`}>備考</Label>
                  <Input
                    id={`constructionInfos.${index}.notes`}
                    {...register(`constructionInfos.${index}.notes`)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {constructionInfoFields.length === 0 && (
        <div className="text-center text-hai py-8 border rounded-lg bg-kinari/30">
          工事情報が登録されていません
        </div>
      )}
    </div>
  );
}
