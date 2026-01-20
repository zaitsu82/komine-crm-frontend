'use client';

import { ConstructionType, CONSTRUCTION_TYPE_LABELS } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConstructionInfoTabProps, getDefaultConstructionRecord } from './types';

export function ConstructionInfoTab({
  register,
  watch,
  setValue,
  constructionRecordFields,
  addConstructionRecord,
  removeConstructionRecord,
  expandedConstructionId,
  setExpandedConstructionId,
}: ConstructionInfoTabProps) {
  const handleAddNewConstructionRecord = () => {
    const newId = `construction-${Date.now()}`;
    addConstructionRecord(getDefaultConstructionRecord(newId));
    setExpandedConstructionId(newId);
  };

  const toggleConstructionExpansion = (constructionId: string) => {
    setExpandedConstructionId(expandedConstructionId === constructionId ? null : constructionId);
  };

  return (
    <div className="space-y-6">
      {/* 工事情報一覧 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">工事情報</h3>
          <Button
            type="button"
            onClick={handleAddNewConstructionRecord}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            + 新規追加
          </Button>
        </div>

        {constructionRecordFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            <p>登録されている工事情報はありません</p>
            <p className="text-sm mt-2">「新規追加」ボタンから追加してください</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 工事一覧テーブル */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">業者名</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">工事種類</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">開始日</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">予定日</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">終了日</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">内容</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {constructionRecordFields.map((field, index) => {
                    const recordData = watch(`constructionRecords.${index}`);
                    const isExpanded = expandedConstructionId === field.id;

                    return (
                      <>
                        <tr
                          key={field.id}
                          className={`border-t cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                          onClick={() => toggleConstructionExpansion(field.id)}
                        >
                          <td className="px-4 py-2 text-sm">
                            {recordData?.contractorName || '未入力'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {recordData?.constructionType ? CONSTRUCTION_TYPE_LABELS[recordData.constructionType as ConstructionType] : '未選択'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {recordData?.startDate || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {recordData?.scheduledEndDate || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {recordData?.endDate || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm truncate max-w-32">
                            {recordData?.description || '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleConstructionExpansion(field.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                {isExpanded ? '閉じる' : '編集'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeConstructionRecord(index);
                                  if (expandedConstructionId === field.id) {
                                    setExpandedConstructionId(null);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                削除
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${field.id}-detail`}>
                            <td colSpan={7} className="px-4 py-4 bg-gray-50 border-t">
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      業者名 <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      {...register(`constructionRecords.${index}.contractorName`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      工事開始日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`constructionRecords.${index}.startDate`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      施工金額
                                    </Label>
                                    <Input
                                      type="number"
                                      {...register(`constructionRecords.${index}.constructionAmount`)}
                                      placeholder="円"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      終了予定日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`constructionRecords.${index}.scheduledEndDate`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      工事終了日
                                    </Label>
                                    <Input
                                      type="date"
                                      {...register(`constructionRecords.${index}.endDate`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      入金金額
                                    </Label>
                                    <Input
                                      type="number"
                                      {...register(`constructionRecords.${index}.paidAmount`)}
                                      placeholder="円"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      工事内容
                                    </Label>
                                    <Input
                                      {...register(`constructionRecords.${index}.description`)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      工事種別
                                    </Label>
                                    <Select
                                      value={watch(`constructionRecords.${index}.constructionType`) || 'gravestone'}
                                      onValueChange={(value) => setValue(`constructionRecords.${index}.constructionType`, value as ConstructionType)}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="選択してください" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="gravestone">墓石工事</SelectItem>
                                        <SelectItem value="enclosure">外柵工事</SelectItem>
                                        <SelectItem value="additional">付帯工事</SelectItem>
                                        <SelectItem value="repair">修繕工事</SelectItem>
                                        <SelectItem value="other">その他</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">
                                    備考
                                  </Label>
                                  <Input
                                    {...register(`constructionRecords.${index}.notes`)}
                                    className="mt-1"
                                  />
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
