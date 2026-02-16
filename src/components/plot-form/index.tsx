'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
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
    resolver: zodResolver(plotFormSchema) as Resolver<PlotFormData>,
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

  const onError = (_validationErrors: Record<string, unknown>) => {
    // Validation errors are displayed inline via the form UI
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
        <div className="mb-4 p-4 bg-beni-50 border border-beni-200 rounded-elegant">
          <h4 className="text-beni-dark font-semibold mb-2">入力エラーがあります</h4>
          <ul className="list-disc list-inside text-beni text-sm">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger
            value="basic-info"
            className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white"
          >
            区画・契約情報
          </TabsTrigger>
          <TabsTrigger
            value="work-billing"
            className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white"
          >
            勤務先・請求
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white"
          >
            連絡先/家族
          </TabsTrigger>
          <TabsTrigger
            value="burial-info"
            className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white"
          >
            埋葬情報
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

      </Tabs>

      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-matsu hover:bg-matsu-dark text-white px-6"
        >
          {isLoading ? '保存中...' : isEditing ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
