'use client';

import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';
import { ContactsTabProps, getDefaultContact } from './types';
import { ViewModeField, ViewModeSelect } from './ViewModeField';

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
  viewMode,
}: ContactsTabProps) {
  const handleAddNewContact = () => {
    const newId = `contact-${Date.now()}`;
    addFamilyContact(getDefaultContact(newId));
    setExpandedContactId(newId);
  };

  const toggleContactExpansion = (contactId: string) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
  };

  const getGenderDisplayValue = (gender: string | undefined) => {
    return gender === 'male' ? '男性' : gender === 'female' ? '女性' : '';
  };

  const getMailingTypeDisplayValue = (type: string | undefined) => {
    return type === 'home' ? '自宅' : type === 'work' ? '勤務先' : type === 'other' ? 'その他' : '';
  };

  return (
    <div className="space-y-6">
      {/* 家族・連絡先一覧 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">家族・連絡先</h3>
          {!viewMode && (
            <Button
              type="button"
              onClick={handleAddNewContact}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              + 新規追加
            </Button>
          )}
        </div>

        {familyContactFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            <p>登録されている家族・連絡先はありません</p>
            {!viewMode && <p className="text-sm mt-2">「新規追加」ボタンから追加してください</p>}
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
                        {!viewMode && (
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
                        )}
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
                          <ViewModeField
                            label="氏名"
                            value={watch(`familyContacts.${index}.name`)}
                            viewMode={viewMode}
                            required
                            register={register(`familyContacts.${index}.name`)}
                          />
                          <ViewModeField
                            label="ふりがな"
                            value={watch(`familyContacts.${index}.nameKana`)}
                            viewMode={viewMode}
                            placeholder="ひらがなで入力"
                            register={register(`familyContacts.${index}.nameKana`)}
                          />
                          <ViewModeField
                            label="続柄"
                            value={watch(`familyContacts.${index}.relationship`)}
                            viewMode={viewMode}
                            required
                            placeholder="配偶者、息子、娘など"
                            register={register(`familyContacts.${index}.relationship`)}
                          />
                        </div>

                        {/* 生年月日・性別 */}
                        <div className="grid grid-cols-3 gap-4">
                          <ViewModeField
                            label="生年月日"
                            value={watch(`familyContacts.${index}.birthDate`)}
                            viewMode={viewMode}
                            type="date"
                            register={register(`familyContacts.${index}.birthDate`)}
                          />
                          <ViewModeSelect
                            label="性別"
                            value={watch(`familyContacts.${index}.gender`) || ''}
                            displayValue={getGenderDisplayValue(watch(`familyContacts.${index}.gender`))}
                            viewMode={viewMode}
                            placeholder="選択してください"
                            onValueChange={(value) => setValue(`familyContacts.${index}.gender`, value as 'male' | 'female')}
                          >
                            <SelectItem value="male">男性</SelectItem>
                            <SelectItem value="female">女性</SelectItem>
                          </ViewModeSelect>
                          <div />
                        </div>

                        {/* 連絡先情報 */}
                        <div className="grid grid-cols-3 gap-4">
                          <ViewModeField
                            label="電話番号"
                            value={watch(`familyContacts.${index}.phoneNumber`)}
                            viewMode={viewMode}
                            required
                            placeholder="090-1234-5678"
                            register={register(`familyContacts.${index}.phoneNumber`)}
                          />
                          <ViewModeField
                            label="ファックス"
                            value={watch(`familyContacts.${index}.faxNumber`)}
                            viewMode={viewMode}
                            placeholder="03-1234-5678"
                            register={register(`familyContacts.${index}.faxNumber`)}
                          />
                          <ViewModeField
                            label="イーメール"
                            value={watch(`familyContacts.${index}.email`)}
                            viewMode={viewMode}
                            type="email"
                            placeholder="example@email.com"
                            register={register(`familyContacts.${index}.email`)}
                          />
                        </div>

                        {/* 住所情報 */}
                        <div className="grid grid-cols-2 gap-4">
                          <ViewModeField
                            label="住所"
                            value={watch(`familyContacts.${index}.address`)}
                            viewMode={viewMode}
                            required
                            register={register(`familyContacts.${index}.address`)}
                          />
                          <ViewModeField
                            label="本籍住所"
                            value={watch(`familyContacts.${index}.registeredAddress`)}
                            viewMode={viewMode}
                            register={register(`familyContacts.${index}.registeredAddress`)}
                          />
                        </div>

                        {/* 送付先・勤務先情報 */}
                        <div className="grid grid-cols-3 gap-4">
                          <ViewModeSelect
                            label="送付先区分"
                            value={watch(`familyContacts.${index}.mailingType`) || ''}
                            displayValue={getMailingTypeDisplayValue(watch(`familyContacts.${index}.mailingType`))}
                            viewMode={viewMode}
                            placeholder="選択してください"
                            onValueChange={(value) => setValue(`familyContacts.${index}.mailingType`, value as 'home' | 'work' | 'other')}
                          >
                            <SelectItem value="home">自宅</SelectItem>
                            <SelectItem value="work">勤務先</SelectItem>
                            <SelectItem value="other">その他</SelectItem>
                          </ViewModeSelect>
                          <ViewModeField
                            label="勤務先名称"
                            value={watch(`familyContacts.${index}.companyName`)}
                            viewMode={viewMode}
                            register={register(`familyContacts.${index}.companyName`)}
                          />
                          <ViewModeField
                            label="勤務先かな"
                            value={watch(`familyContacts.${index}.companyNameKana`)}
                            viewMode={viewMode}
                            placeholder="ひらがなで入力"
                            register={register(`familyContacts.${index}.companyNameKana`)}
                          />
                        </div>

                        {/* 勤務先詳細情報 */}
                        <div className="grid grid-cols-2 gap-4">
                          <ViewModeField
                            label="勤務先住所"
                            value={watch(`familyContacts.${index}.companyAddress`)}
                            viewMode={viewMode}
                            register={register(`familyContacts.${index}.companyAddress`)}
                          />
                          <ViewModeField
                            label="勤務先電話番号"
                            value={watch(`familyContacts.${index}.companyPhone`)}
                            viewMode={viewMode}
                            placeholder="03-1234-5678"
                            register={register(`familyContacts.${index}.companyPhone`)}
                          />
                        </div>

                        {/* 備考 */}
                        <ViewModeField
                          label="備考"
                          value={watch(`familyContacts.${index}.notes`)}
                          viewMode={viewMode}
                          register={register(`familyContacts.${index}.notes`)}
                        />
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
          <ViewModeField
            label="郵便番号"
            value={watch('postalCode')}
            viewMode={viewMode}
            required
            placeholder="123-4567"
            register={register('postalCode')}
            error={errors.postalCode?.message}
          />
          <ViewModeField
            label="都道府県"
            value={watch('prefecture')}
            viewMode={viewMode}
            required
            register={register('prefecture')}
            error={errors.prefecture?.message}
          />
          <ViewModeField
            label="市区町村"
            value={watch('city')}
            viewMode={viewMode}
            required
            register={register('city')}
            error={errors.city?.message}
          />
        </div>
      </div>

      {/* 緊急連絡先（後方互換性） */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">緊急連絡先</h3>
        <div className="grid grid-cols-3 gap-4">
          <ViewModeField
            label="氏名"
            value={watch('emergencyContact.name')}
            viewMode={viewMode}
            register={register('emergencyContact.name')}
          />
          <ViewModeField
            label="続柄"
            value={watch('emergencyContact.relationship')}
            viewMode={viewMode}
            placeholder="配偶者、息子、娘など"
            register={register('emergencyContact.relationship')}
          />
          <ViewModeField
            label="電話番号"
            value={watch('emergencyContact.phoneNumber')}
            viewMode={viewMode}
            placeholder="090-1234-5678"
            register={register('emergencyContact.phoneNumber')}
          />
        </div>
      </div>
    </div>
  );
}
