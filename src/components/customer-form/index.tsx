'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Customer, ConstructionType } from '@/types/customer';
import { customerFormSchema, CustomerFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CustomerFormProps } from './types';
import { BasicInfoTab1 } from './BasicInfoTab1';
import { BasicInfoTab2 } from './BasicInfoTab2';
import { ContactsTab } from './ContactsTab';
import { BurialInfoTab } from './BurialInfoTab';
import { ConstructionInfoTab } from './ConstructionInfoTab';
import { HistoryTab } from './HistoryTab';

export default function CustomerForm({ customer, onSave, onCancel, isLoading }: CustomerFormProps) {
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? {
      customerCode: customer.customerCode,
      plotNumber: customer.plotNumber || '',
      plotPeriod: customer.plotPeriod || '',
      section: customer.section || '',
      reservationDate: customer.reservationDate ? formatDate(customer.reservationDate) : '',
      acceptanceNumber: customer.acceptanceNumber || '',
      permitDate: customer.permitDate ? formatDate(customer.permitDate) : '',
      startDate: customer.startDate ? formatDate(customer.startDate) : '',
      name: customer.name,
      nameKana: customer.nameKana,
      birthDate: customer.birthDate ? formatDate(customer.birthDate) : '',
      gender: customer.gender,
      phoneNumber: customer.phoneNumber,
      faxNumber: customer.faxNumber || '',
      email: customer.email || '',
      address: customer.address,
      registeredAddress: customer.registeredAddress || '',
      applicantInfo: customer.applicantInfo ? {
        applicationDate: customer.applicantInfo.applicationDate ? formatDate(customer.applicantInfo.applicationDate) : '',
        staffName: customer.applicantInfo.staffName || '',
        name: customer.applicantInfo.name || '',
        nameKana: customer.applicantInfo.nameKana || '',
        postalCode: customer.applicantInfo.postalCode || '',
        phoneNumber: customer.applicantInfo.phoneNumber || '',
        address: customer.applicantInfo.address || '',
      } : undefined,
      usageFee: customer.usageFee ? {
        calculationType: customer.usageFee.calculationType || '',
        taxType: customer.usageFee.taxType || '',
        billingType: customer.usageFee.billingType || '',
        billingYears: customer.usageFee.billingYears?.toString() || '',
        area: customer.usageFee.area || '',
        unitPrice: customer.usageFee.unitPrice?.toString() || '',
        usageFee: customer.usageFee.usageFee?.toString() || '',
        paymentMethod: customer.usageFee.paymentMethod || '',
      } : undefined,
      managementFee: customer.managementFee ? {
        calculationType: customer.managementFee.calculationType || '',
        taxType: customer.managementFee.taxType || '',
        billingType: customer.managementFee.billingType || '',
        billingYears: customer.managementFee.billingYears?.toString() || '',
        area: customer.managementFee.area || '',
        billingMonth: customer.managementFee.billingMonth?.toString() || '',
        managementFee: customer.managementFee.managementFee?.toString() || '',
        unitPrice: customer.managementFee.unitPrice?.toString() || '',
        lastBillingMonth: customer.managementFee.lastBillingMonth || '',
        paymentMethod: customer.managementFee.paymentMethod || '',
      } : undefined,
      gravestoneInfo: customer.gravestoneInfo ? {
        gravestoneBase: customer.gravestoneInfo.gravestoneBase || '',
        enclosurePosition: customer.gravestoneInfo.enclosurePosition || '',
        gravestoneDealer: customer.gravestoneInfo.gravestoneDealer || '',
        gravestoneType: customer.gravestoneInfo.gravestoneType || '',
        surroundingArea: customer.gravestoneInfo.surroundingArea || '',
        establishmentDeadline: customer.gravestoneInfo.establishmentDeadline ? formatDate(customer.gravestoneInfo.establishmentDeadline) : '',
        establishmentDate: customer.gravestoneInfo.establishmentDate ? formatDate(customer.gravestoneInfo.establishmentDate) : '',
      } : undefined,
      familyContacts: customer.familyContacts?.map(contact => ({
        id: contact.id,
        name: contact.name || '',
        nameKana: contact.nameKana || '',
        birthDate: contact.birthDate ? formatDate(contact.birthDate) : '',
        gender: contact.gender || '',
        relationship: contact.relationship || '',
        address: contact.address || '',
        phoneNumber: contact.phoneNumber || '',
        faxNumber: contact.faxNumber || '',
        email: contact.email || '',
        registeredAddress: contact.registeredAddress || '',
        mailingType: contact.mailingType || '',
        companyName: contact.companyName || '',
        companyNameKana: contact.companyNameKana || '',
        companyAddress: contact.companyAddress || '',
        companyPhone: contact.companyPhone || '',
        notes: contact.notes || '',
      })) || [],
      buriedPersons: customer.buriedPersons?.map(person => ({
        id: person.id,
        name: person.name || '',
        nameKana: person.nameKana || '',
        birthDate: person.birthDate ? formatDate(person.birthDate) : '',
        gender: person.gender || '',
        posthumousName: person.posthumousName || '',
        deathDate: person.deathDate ? formatDate(person.deathDate) : '',
        age: person.age?.toString() || '',
        burialDate: person.burialDate ? formatDate(person.burialDate) : '',
        reportDate: person.reportDate ? formatDate(person.reportDate) : '',
        religion: person.religion || '',
        relationship: person.relationship || '',
        memo: person.memo || '',
      })) || [],
      emergencyContact: customer.emergencyContact ? {
        name: customer.emergencyContact.name,
        relationship: customer.emergencyContact.relationship,
        phoneNumber: customer.emergencyContact.phoneNumber,
      } : undefined,
      constructionRecords: customer.constructionRecords?.map(record => ({
        id: record.id,
        contractorName: record.contractorName || '',
        constructionType: record.constructionType || 'gravestone',
        startDate: record.startDate ? formatDate(record.startDate) : '',
        scheduledEndDate: record.scheduledEndDate ? formatDate(record.scheduledEndDate) : '',
        endDate: record.endDate ? formatDate(record.endDate) : '',
        description: record.description || '',
        constructionAmount: record.constructionAmount?.toString() || '',
        paidAmount: record.paidAmount?.toString() || '',
        notes: record.notes || '',
      })) || [],
    } : {
      customerCode: '',
      plotNumber: '',
      plotPeriod: '',
      section: '',
      reservationDate: '',
      acceptanceNumber: '',
      permitDate: '',
      startDate: '',
      name: '',
      nameKana: '',
      birthDate: '',
      gender: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      address: '',
      registeredAddress: '',
      familyContacts: [],
      buriedPersons: [],
      constructionRecords: [],
      applicantInfo: undefined as any,
      usageFee: undefined as any,
      managementFee: undefined as any,
      gravestoneInfo: undefined as any,
      workInfo: undefined as any,
      billingInfo: undefined as any,
      plotInfo: undefined as any,
      emergencyContact: undefined as any,
    }
  });

  const { fields: familyContactFields, append: addFamilyContact, remove: removeFamilyContact } = useFieldArray({
    control,
    name: "familyContacts"
  });

  const { fields: buriedPersonFields, append: addBuriedPerson, remove: removeBuriedPerson } = useFieldArray({
    control,
    name: "buriedPersons"
  });

  const { fields: constructionRecordFields, append: addConstructionRecord, remove: removeConstructionRecord } = useFieldArray({
    control,
    name: "constructionRecords"
  });

  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [expandedConstructionId, setExpandedConstructionId] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const onSubmit = (data: CustomerFormData) => {
    onSave(data);
  };

  const tabBaseProps = {
    register,
    watch,
    setValue,
    errors,
    control,
    customer,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <Tabs defaultValue="basic-info-1" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="basic-info-1" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報1</TabsTrigger>
          <TabsTrigger value="basic-info-2" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">基本情報2</TabsTrigger>
          <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">連絡先/家族</TabsTrigger>
          <TabsTrigger value="burial-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">埋葬情報</TabsTrigger>
          <TabsTrigger value="construction-info" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">工事情報</TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">履歴情報</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info-1" className="space-y-6 mt-6">
          <BasicInfoTab1 {...tabBaseProps} />
        </TabsContent>

        <TabsContent value="basic-info-2" className="space-y-6 mt-6">
          <BasicInfoTab2 {...tabBaseProps} />
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

        <TabsContent value="construction-info" className="space-y-6 mt-6">
          <ConstructionInfoTab
            {...tabBaseProps}
            constructionRecordFields={constructionRecordFields}
            addConstructionRecord={addConstructionRecord}
            removeConstructionRecord={removeConstructionRecord}
            expandedConstructionId={expandedConstructionId}
            setExpandedConstructionId={setExpandedConstructionId}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <HistoryTab
            customer={customer}
            selectedHistoryId={selectedHistoryId}
            setSelectedHistoryId={setSelectedHistoryId}
          />
        </TabsContent>

      </Tabs>

      {/* フォーム送信ボタン */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading ? '保存中...' : (isEditing ? '更新' : '登録')}
        </Button>
      </div>
    </form>
  );
}

// Re-export types and components
export * from './types';
export { PlotSettingsSection } from './PlotSettingsSection';
