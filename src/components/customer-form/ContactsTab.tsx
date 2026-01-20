'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactsTabProps, getDefaultContact } from './types';

export function ContactsTab({
  register,
  watch,
  setValue,
  errors,
  familyContactFields,
  addFamilyContact,
  removeFamilyContact,
  expandedContactId,
  setExpandedContactId,
}: ContactsTabProps) {
  const handleAddNewContact = () => {
    const newId = `contact-${Date.now()}`;
    addFamilyContact(getDefaultContact(newId));
    setExpandedContactId(newId);
  };

  const toggleContactExpansion = (contactId: string) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
  };

  return (
    <div className="space-y-6">
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
                              ふりがな
                            </Label>
                            <Input
                              {...register(`familyContacts.${index}.nameKana`)}
                              placeholder="ひらがなで入力"
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

                        {/* 生年月日・性別 */}
                        <div className="grid grid-cols-3 gap-4">
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
                              性別
                            </Label>
                            <Select
                              value={watch(`familyContacts.${index}.gender`) || ''}
                              onValueChange={(value) => setValue(`familyContacts.${index}.gender`, value as 'male' | 'female')}
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
                          <div />
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
    </div>
  );
}
