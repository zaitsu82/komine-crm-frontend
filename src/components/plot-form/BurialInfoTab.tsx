'use client';

import { useState } from 'react';
import { BurialInfoTabProps, getDefaultBuriedPerson } from './types';
import { ViewModeSelect } from './ViewModeField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { Gender } from '@komine/types';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

export function BurialInfoTab({
  register,
  watch,
  setValue,
  errors,
  buriedPersonFields,
  addBuriedPerson,
  removeBuriedPerson,
}: BurialInfoTabProps) {
  const [expandedBurialId, setExpandedBurialId] = useState<string | null>(null);

  const genderLabels: Record<Gender, string> = {
    [Gender.Male]: '男性',
    [Gender.Female]: '女性',
    [Gender.NotAnswered]: '未回答',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">埋葬者情報</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBuriedPerson(getDefaultBuriedPerson())}
        >
          <Plus className="h-4 w-4 mr-1" />
          新規追加
        </Button>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-kinari border rounded-md text-sm font-semibold">
        <div>氏名</div>
        <div>性別</div>
        <div>命日</div>
        <div>メモ</div>
      </div>

      {/* Burial Person Rows */}
      <div className="space-y-3">
        {buriedPersonFields.map((field, index) => {
          const gender = watch(`buriedPersons.${index}.gender`);
          const genderLabel = gender ? genderLabels[gender as Gender] : '-';

          return (
            <div key={field.id} className="border rounded-lg overflow-hidden">
              {/* Summary Row */}
              <div
                className="flex items-center justify-between p-3 bg-kinari border rounded-md cursor-pointer hover:bg-matsu-50 transition-colors duration-200"
                onClick={() =>
                  setExpandedBurialId(expandedBurialId === field.id ? null : field.id)
                }
              >
                <div className="grid grid-cols-4 gap-4 flex-1 text-sm">
                  <span className="font-medium">
                    {watch(`buriedPersons.${index}.name`) || '未入力'}
                  </span>
                  <span>{genderLabel}</span>
                  <span>{watch(`buriedPersons.${index}.deathDate`) || '-'}</span>
                  <span className="text-hai truncate">
                    {watch(`buriedPersons.${index}.notes`) || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="削除"
                    aria-label="埋葬者を削除"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBuriedPerson(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-beni" />
                  </Button>
                  {expandedBurialId === field.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Expanded Fields */}
              {expandedBurialId === field.id && (
                <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                  {/* Name */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.name`}>
                      氏名 <span className="text-beni">*</span>
                    </Label>
                    <Input
                      id={`buriedPersons.${index}.name`}
                      {...register(`buriedPersons.${index}.name`)}
                      className={errors.buriedPersons?.[index]?.name ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.name && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  {/* Name Kana */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.nameKana`}>氏名カナ</Label>
                    <Input
                      id={`buriedPersons.${index}.nameKana`}
                      {...register(`buriedPersons.${index}.nameKana`)}
                      className={errors.buriedPersons?.[index]?.nameKana ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.nameKana && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.nameKana?.message}
                      </p>
                    )}
                  </div>

                  {/* Birth Date */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.birthDate`}>生年月日</Label>
                    <Input
                      id={`buriedPersons.${index}.birthDate`}
                      type="date"
                      {...register(`buriedPersons.${index}.birthDate`)}
                      className={errors.buriedPersons?.[index]?.birthDate ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.birthDate && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.birthDate?.message}
                      </p>
                    )}
                  </div>

                  {/* Posthumous Name */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.posthumousName`}>戒名</Label>
                    <Input
                      id={`buriedPersons.${index}.posthumousName`}
                      {...register(`buriedPersons.${index}.posthumousName`)}
                      className={
                        errors.buriedPersons?.[index]?.posthumousName ? 'border-beni' : ''
                      }
                    />
                    {errors.buriedPersons?.[index]?.posthumousName && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.posthumousName?.message}
                      </p>
                    )}
                  </div>

                  {/* Report Date */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.reportDate`}>届出日</Label>
                    <Input
                      id={`buriedPersons.${index}.reportDate`}
                      type="date"
                      {...register(`buriedPersons.${index}.reportDate`)}
                      className={errors.buriedPersons?.[index]?.reportDate ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.reportDate && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.reportDate?.message}
                      </p>
                    )}
                  </div>

                  {/* Religion */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.religion`}>宗派</Label>
                    <Input
                      id={`buriedPersons.${index}.religion`}
                      {...register(`buriedPersons.${index}.religion`)}
                      className={errors.buriedPersons?.[index]?.religion ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.religion && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.religion?.message}
                      </p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.relationship`}>続柄</Label>
                    <Input
                      id={`buriedPersons.${index}.relationship`}
                      {...register(`buriedPersons.${index}.relationship`)}
                      className={
                        errors.buriedPersons?.[index]?.relationship ? 'border-beni' : ''
                      }
                    />
                    {errors.buriedPersons?.[index]?.relationship && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.relationship?.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <ViewModeSelect
                      label="性別"
                      value={watch(`buriedPersons.${index}.gender`) || ''}
                      onValueChange={(value: string) =>
                        setValue(`buriedPersons.${index}.gender`, value as Gender)
                      }
                      viewMode={false}
                    >
                      {Object.entries(genderLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </ViewModeSelect>
                    {errors.buriedPersons?.[index]?.gender && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.gender?.message}
                      </p>
                    )}
                  </div>

                  {/* Death Date */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.deathDate`}>命日</Label>
                    <Input
                      id={`buriedPersons.${index}.deathDate`}
                      type="date"
                      {...register(`buriedPersons.${index}.deathDate`)}
                      className={errors.buriedPersons?.[index]?.deathDate ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.deathDate && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.deathDate?.message}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.age`}>享年</Label>
                    <Input
                      id={`buriedPersons.${index}.age`}
                      type="number"
                      {...register(`buriedPersons.${index}.age`, {
                        valueAsNumber: true,
                      })}
                      className={errors.buriedPersons?.[index]?.age ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.age && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.age?.message}
                      </p>
                    )}
                  </div>

                  {/* Burial Date */}
                  <div>
                    <Label htmlFor={`buriedPersons.${index}.burialDate`}>埋葬日</Label>
                    <Input
                      id={`buriedPersons.${index}.burialDate`}
                      type="date"
                      {...register(`buriedPersons.${index}.burialDate`)}
                      className={
                        errors.buriedPersons?.[index]?.burialDate ? 'border-beni' : ''
                      }
                    />
                    {errors.buriedPersons?.[index]?.burialDate && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.burialDate?.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <Label htmlFor={`buriedPersons.${index}.notes`}>備考</Label>
                    <Input
                      id={`buriedPersons.${index}.notes`}
                      {...register(`buriedPersons.${index}.notes`)}
                      className={errors.buriedPersons?.[index]?.notes ? 'border-beni' : ''}
                    />
                    {errors.buriedPersons?.[index]?.notes && (
                      <p className="text-sm text-beni mt-1">
                        {errors.buriedPersons[index]?.notes?.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
