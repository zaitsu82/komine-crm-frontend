'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BurialInfoTabProps, getDefaultBuriedPerson } from './types';

export function BurialInfoTab({
  register,
  watch,
  setValue,
  buriedPersonFields,
  addBuriedPerson,
  removeBuriedPerson,
}: BurialInfoTabProps) {
  const [expandedBurialId, setExpandedBurialId] = useState<string | null>(null);

  const handleAddNewBuriedPerson = () => {
    const newId = `buried-${Date.now()}`;
    addBuriedPerson(getDefaultBuriedPerson(newId));
  };

  return (
    <div className="space-y-6">
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
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {buriedPersonFields.map((field, index) => {
                    const buriedPersonData = watch(`buriedPersons.${index}`);
                    const isExpanded = expandedBurialId === `burial-${field.id}`;

                    return (
                      <>
                        <tr
                          key={field.id}
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
                        </tr>
                        {isExpanded && (
                          <tr key={`${field.id}-detail`}>
                            <td colSpan={5} className="px-4 py-4 bg-gray-50 border-t">
                              {/* 編集フォーム */}
                              <div className="space-y-4">
                                {/* 基本情報 */}
                                <div className="grid grid-cols-3 gap-4">
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
                                      ふりがな
                                    </Label>
                                    <Input
                                      {...register(`buriedPersons.${index}.nameKana`)}
                                      placeholder="ひらがなで入力"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      戒名
                                    </Label>
                                    <Input
                                      {...register(`buriedPersons.${index}.posthumousName`)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {/* 生年月日・性別 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      生年月日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`buriedPersons.${index}.birthDate`)}
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
                                  <div>
                                    <Label className="text-sm font-medium">
                                      宗派
                                    </Label>
                                    <Input
                                      {...register(`buriedPersons.${index}.religion`)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {/* 命日・享年 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      命日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`buriedPersons.${index}.deathDate`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      享年
                                    </Label>
                                    <Input
                                      type="number"
                                      {...register(`buriedPersons.${index}.age`)}
                                      placeholder="歳"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      続柄
                                    </Label>
                                    <Input
                                      {...register(`buriedPersons.${index}.relationship`)}
                                      placeholder="配偶者、父、母など"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {/* 埋葬日・届出日 */}
                                <div className="grid grid-cols-3 gap-4">
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
                                      届出日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`buriedPersons.${index}.reportDate`)}
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
                            </td>
                          </tr>
                        )}
                      </>
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
