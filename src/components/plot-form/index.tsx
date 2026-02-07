'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  plotFormSchema,
  defaultPlotFormData,
  plotDetailToFormData,
} from '@/lib/validations/plot-form';
import type { PlotFormData } from '@/lib/validations/plot-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMasters } from '@/hooks';

import type { PlotFormProps, MasterData } from './types';
import { BasicInfoTab } from './BasicInfoTab';
import { WorkBillingTab } from './WorkBillingTab';
import { ContactsTab } from './ContactsTab';
import { BurialInfoTab } from './BurialInfoTab';
import { HistoryTab } from './HistoryTab';

export default function PlotForm({ plotDetail, onSave, isLoading }: PlotFormProps) {
  const isEditing = !!plotDetail;

  const {
    calcTypes,
    taxTypes,
    billingTypes,
    paymentMethods,
    accountTypes,
    isLoading: isMasterLoading,
  } = useMasters();

  const masterData: MasterData = {
    calcTypes,
    taxTypes,
    billingTypes,
    paymentMethods,
    accountTypes,
    isLoading: isMasterLoading,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotFormSchema),
    defaultValues: plotDetail
      ? plotDetailToFormData(plotDetail)
      : defaultPlotFormData,
  });

  const {
    fields: familyContactFields,
    append: addFamilyContact,
    remove: removeFamilyContact,
  } = useFieldArray({ control, name: 'familyContacts' });

  const {
    fields: buriedPersonFields,
    append: addBuriedPerson,
    remove: removeBuriedPerson,
  } = useFieldArray({ control, name: 'buriedPersons' });

  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const onSubmit = (data: PlotFormData) => {
    onSave(data);
  };

  const onError = (validationErrors: Record<string, unknown>) => {
    console.log('Form validation errors:', validationErrors);
  };

  const tabBaseProps = {
    register,
    watch,
    setValue,
    errors,
    control,
    masterData,
  };

  // エラーメッセージを整形
  const errorMessages = Object.entries(errors)
    .map(([key, value]) => {
      if (typeof value === 'object' && value && 'message' in value && value.message) {
        return `${key}: ${value.message}`;
      }
      return null;
    })
    .filter(Boolean);

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full">
      {errorMessages.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-800 font-semibold mb-2">入力エラーがあります</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger
            value="basic-info"
            className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            区画・契約情報
          </TabsTrigger>
          <TabsTrigger
            value="work-billing"
            className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            勤務先・請求
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            連絡先/家族
          </TabsTrigger>
          <TabsTrigger
            value="burial-info"
            className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            埋葬情報
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            履歴情報
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-6 mt-6">
          <BasicInfoTab {...tabBaseProps} />
        </TabsContent>

        <TabsContent value="work-billing" className="space-y-6 mt-6">
          <WorkBillingTab {...tabBaseProps} />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <ContactsTab
            {...tabBaseProps}
            familyContactFields={familyContactFields}
            addFamilyContact={addFamilyContact}
            removeFamilyContact={removeFamilyContact}
            expandedContactId={expandedContactId}
            setExpandedContactId={setExpandedContactId}
          />
        </TabsContent>

        <TabsContent value="burial-info" className="space-y-6 mt-6">
          <BurialInfoTab
            {...tabBaseProps}
            buriedPersonFields={buriedPersonFields}
            addBuriedPerson={addBuriedPerson}
            removeBuriedPerson={removeBuriedPerson}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <HistoryTab plotDetail={plotDetail} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading ? '保存中...' : isEditing ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
