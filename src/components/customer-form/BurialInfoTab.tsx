'use client';

import { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';
import { BurialInfoTabProps, getDefaultBuriedPerson } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';

export function BurialInfoTab({
  register,
  watch,
  setValue,
  buriedPersonFields,
  addBuriedPerson,
  removeBuriedPerson,
  viewMode,
}: BurialInfoTabProps) {
  const [expandedBurialId, setExpandedBurialId] = useState<string | null>(null);

  const handleAddNewBuriedPerson = () => {
    const newId = `buried-${Date.now()}`;
    addBuriedPerson(getDefaultBuriedPerson(newId));
  };

  const getGenderDisplayValue = (gender: string | undefined) => {
    return gender === 'male' ? '男性' : gender === 'female' ? '女性' : '';
  };

  return (
    <div className="space-y-6">
      {/* 埋葬者一覧 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">埋葬者一覧</h3>
          {!viewMode && (
            <Button
              type="button"
              onClick={handleAddNewBuriedPerson}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              + 新規追加
            </Button>
          )}
        </div>

        {buriedPersonFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            <p>登録されている埋葬者はいません</p>
            {!viewMode && <p className="text-sm mt-2">「新規追加」ボタンから追加してください</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 埋葬者一覧テーブル */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">氏名</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">性別</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">埋葬日</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">メモ</th>
                    {!viewMode && (
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">操作</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {buriedPersonFields.map((field, index) => {
                    const buriedPersonData = watch(`buriedPersons.${index}`);
                    const isExpanded = expandedBurialId === `burial-${field.id}`;

                    return (
                      <Fragment key={field.id}>
                        <tr
                          className={`border-t cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                          onClick={() => setExpandedBurialId(isExpanded ? null : `burial-${field.id}`)}
                        >
                          <td className="px-4 py-2 text-sm">
                            {buriedPersonData?.name || '未入力'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {buriedPersonData?.gender === 'male' ? '男性' : buriedPersonData?.gender === 'female' ? '女性' : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {buriedPersonData?.burialDate || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm truncate max-w-32">
                            {buriedPersonData?.memo || '-'}
                          </td>
                          {!viewMode && (
                            <td className="px-4 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBuriedPerson(index);
                                  if (expandedBurialId === `burial-${field.id}`) {
                                    setExpandedBurialId(null);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                削除
                              </Button>
                            </td>
                          )}
                        </tr>
                        {isExpanded && (
                          <tr key={`${field.id}-detail`}>
                            <td colSpan={viewMode ? 4 : 5} className="px-4 py-4 bg-gray-50 border-t">
                              {/* 編集フォーム */}
                              <div className="space-y-4">
                                {/* 基本情報 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <ViewModeField
                                    label="氏名"
                                    value={watch(`buriedPersons.${index}.name`)}
                                    viewMode={viewMode}
                                    required
                                    register={register(`buriedPersons.${index}.name`)}
                                  />
                                  <ViewModeField
                                    label="ふりがな"
                                    value={watch(`buriedPersons.${index}.nameKana`)}
                                    viewMode={viewMode}
                                    placeholder="ひらがなで入力"
                                    register={register(`buriedPersons.${index}.nameKana`)}
                                  />
                                  <ViewModeField
                                    label="戒名"
                                    value={watch(`buriedPersons.${index}.posthumousName`)}
                                    viewMode={viewMode}
                                    register={register(`buriedPersons.${index}.posthumousName`)}
                                  />
                                </div>

                                {/* 生年月日・性別 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <ViewModeField
                                    label="生年月日"
                                    value={watch(`buriedPersons.${index}.birthDate`)}
                                    viewMode={viewMode}
                                    type="date"
                                    register={register(`buriedPersons.${index}.birthDate`)}
                                  />
                                  <ViewModeSelect
                                    label="性別"
                                    value={watch(`buriedPersons.${index}.gender`) || ''}
                                    displayValue={getGenderDisplayValue(watch(`buriedPersons.${index}.gender`))}
                                    viewMode={viewMode}
                                    required
                                    placeholder="選択してください"
                                    onValueChange={(value) => setValue(`buriedPersons.${index}.gender`, value as 'male' | 'female')}
                                  >
                                    <SelectItem value="male">男性</SelectItem>
                                    <SelectItem value="female">女性</SelectItem>
                                  </ViewModeSelect>
                                  <ViewModeField
                                    label="宗派"
                                    value={watch(`buriedPersons.${index}.religion`)}
                                    viewMode={viewMode}
                                    register={register(`buriedPersons.${index}.religion`)}
                                  />
                                </div>

                                {/* 命日・享年 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <ViewModeField
                                    label="命日"
                                    value={watch(`buriedPersons.${index}.deathDate`)}
                                    viewMode={viewMode}
                                    type="date"
                                    register={register(`buriedPersons.${index}.deathDate`)}
                                  />
                                  <ViewModeField
                                    label="享年"
                                    value={watch(`buriedPersons.${index}.age`)}
                                    viewMode={viewMode}
                                    type="number"
                                    placeholder="歳"
                                    register={register(`buriedPersons.${index}.age`)}
                                  />
                                  <ViewModeField
                                    label="続柄"
                                    value={watch(`buriedPersons.${index}.relationship`)}
                                    viewMode={viewMode}
                                    placeholder="配偶者、父、母など"
                                    register={register(`buriedPersons.${index}.relationship`)}
                                  />
                                </div>

                                {/* 埋葬日・届出日 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <ViewModeField
                                    label="埋葬日"
                                    value={watch(`buriedPersons.${index}.burialDate`)}
                                    viewMode={viewMode}
                                    required
                                    type="date"
                                    register={register(`buriedPersons.${index}.burialDate`)}
                                  />
                                  <ViewModeField
                                    label="届出日"
                                    value={watch(`buriedPersons.${index}.reportDate`)}
                                    viewMode={viewMode}
                                    type="date"
                                    register={register(`buriedPersons.${index}.reportDate`)}
                                  />
                                  <ViewModeField
                                    label="メモ"
                                    value={watch(`buriedPersons.${index}.memo`)}
                                    viewMode={viewMode}
                                    placeholder="特記事項があれば入力"
                                    register={register(`buriedPersons.${index}.memo`)}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
