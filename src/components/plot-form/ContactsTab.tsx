'use client';

import { ContactsTabProps, getDefaultContact } from './types';
import { ViewModeSelect } from './ViewModeField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectItem } from '@/components/ui/select';
import { AddressType } from '@komine/types';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

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
  const addressTypeLabels: Record<AddressType, string> = {
    [AddressType.Home]: '自宅',
    [AddressType.Work]: '勤務先',
    [AddressType.Other]: 'その他',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">家族連絡先</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addFamilyContact(getDefaultContact())}
        >
          <Plus className="h-4 w-4 mr-1" />
          新規追加
        </Button>
      </div>

      <div className="space-y-3">
        {familyContactFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg overflow-hidden">
            {/* Summary Line */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 border rounded-md cursor-pointer"
              onClick={() =>
                setExpandedContactId(expandedContactId === field.id ? null : field.id)
              }
            >
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">
                  {watch(`familyContacts.${index}.name`) || '未入力'}
                </span>
                <span className="text-gray-500">
                  {watch(`familyContacts.${index}.relationship`) || '-'}
                </span>
                <span className="text-gray-500">
                  {watch(`familyContacts.${index}.phoneNumber`) || '-'}
                </span>
                <span className="text-gray-500">
                  {watch(`familyContacts.${index}.address`) || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFamilyContact(index);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                {expandedContactId === field.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>

            {/* Expanded Fields */}
            {expandedContactId === field.id && (
              <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                {/* Emergency Contact Flag */}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`familyContacts.${index}.emergencyContactFlag`}
                    {...register(`familyContacts.${index}.emergencyContactFlag`)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`familyContacts.${index}.emergencyContactFlag`}>
                    緊急連絡先
                  </Label>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.name`}>
                    氏名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`familyContacts.${index}.name`}
                    {...register(`familyContacts.${index}.name`)}
                    className={errors.familyContacts?.[index]?.name ? 'border-red-500' : ''}
                  />
                  {errors.familyContacts?.[index]?.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.name?.message}
                    </p>
                  )}
                </div>

                {/* Relationship */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.relationship`}>
                    続柄 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`familyContacts.${index}.relationship`}
                    {...register(`familyContacts.${index}.relationship`)}
                    className={
                      errors.familyContacts?.[index]?.relationship ? 'border-red-500' : ''
                    }
                  />
                  {errors.familyContacts?.[index]?.relationship && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.relationship?.message}
                    </p>
                  )}
                </div>

                {/* Birth Date */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.birthDate`}>生年月日</Label>
                  <Input
                    id={`familyContacts.${index}.birthDate`}
                    type="date"
                    {...register(`familyContacts.${index}.birthDate`)}
                    className={
                      errors.familyContacts?.[index]?.birthDate ? 'border-red-500' : ''
                    }
                  />
                  {errors.familyContacts?.[index]?.birthDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.birthDate?.message}
                    </p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.postalCode`}>郵便番号</Label>
                  <Input
                    id={`familyContacts.${index}.postalCode`}
                    {...register(`familyContacts.${index}.postalCode`)}
                    placeholder="123-4567"
                    className={
                      errors.familyContacts?.[index]?.postalCode ? 'border-red-500' : ''
                    }
                  />
                  {errors.familyContacts?.[index]?.postalCode && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.postalCode?.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <Label htmlFor={`familyContacts.${index}.address`}>
                    住所 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`familyContacts.${index}.address`}
                    {...register(`familyContacts.${index}.address`)}
                    className={errors.familyContacts?.[index]?.address ? 'border-red-500' : ''}
                  />
                  {errors.familyContacts?.[index]?.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.address?.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.phoneNumber`}>
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`familyContacts.${index}.phoneNumber`}
                    {...register(`familyContacts.${index}.phoneNumber`)}
                    className={
                      errors.familyContacts?.[index]?.phoneNumber ? 'border-red-500' : ''
                    }
                  />
                  {errors.familyContacts?.[index]?.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.phoneNumber?.message}
                    </p>
                  )}
                </div>

                {/* Fax Number */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.faxNumber`}>FAX</Label>
                  <Input
                    id={`familyContacts.${index}.faxNumber`}
                    {...register(`familyContacts.${index}.faxNumber`)}
                    className={errors.familyContacts?.[index]?.faxNumber ? 'border-red-500' : ''}
                  />
                  {errors.familyContacts?.[index]?.faxNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.faxNumber?.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.email`}>メール</Label>
                  <Input
                    id={`familyContacts.${index}.email`}
                    type="email"
                    {...register(`familyContacts.${index}.email`)}
                    className={errors.familyContacts?.[index]?.email ? 'border-red-500' : ''}
                  />
                  {errors.familyContacts?.[index]?.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.email?.message}
                    </p>
                  )}
                </div>

                {/* Registered Address */}
                <div>
                  <Label htmlFor={`familyContacts.${index}.registeredAddress`}>本籍地</Label>
                  <Input
                    id={`familyContacts.${index}.registeredAddress`}
                    {...register(`familyContacts.${index}.registeredAddress`)}
                    className={
                      errors.familyContacts?.[index]?.registeredAddress ? 'border-red-500' : ''
                    }
                  />
                  {errors.familyContacts?.[index]?.registeredAddress && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.registeredAddress?.message}
                    </p>
                  )}
                </div>

                {/* Mailing Type */}
                <div>
                  <ViewModeSelect
                    label="宛先区分"
                    value={watch(`familyContacts.${index}.mailingType`) || ''}
                    onValueChange={(value: string) =>
                      setValue(`familyContacts.${index}.mailingType`, value as AddressType)
                    }
                    viewMode={false}
                  >
                    {Object.entries(addressTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </ViewModeSelect>
                  {errors.familyContacts?.[index]?.mailingType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.mailingType?.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <Label htmlFor={`familyContacts.${index}.notes`}>備考</Label>
                  <Input
                    id={`familyContacts.${index}.notes`}
                    {...register(`familyContacts.${index}.notes`)}
                    className={errors.familyContacts?.[index]?.notes ? 'border-red-500' : ''}
                  />
                  {errors.familyContacts?.[index]?.notes && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.familyContacts[index]?.notes?.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
