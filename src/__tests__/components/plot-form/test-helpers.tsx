import React from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  plotFormSchema,
  defaultPlotFormData,
} from '@/lib/validations/plot-form';
import type { PlotFormData } from '@/lib/validations/plot-form';
import type { MasterData } from '@/components/plot-form/types';

export const emptyMasterData: MasterData = {
  calcTypes: [],
  taxTypes: [],
  billingTypes: [],
  paymentMethods: [],
  sectionNames: [],
  relationships: [],
  contractors: [],
  validityPeriods: [],
  isLoading: false,
};

export interface FormHandles {
  register: ReturnType<typeof useForm<PlotFormData>>['register'];
  watch: ReturnType<typeof useForm<PlotFormData>>['watch'];
  setValue: ReturnType<typeof useForm<PlotFormData>>['setValue'];
  errors: ReturnType<typeof useForm<PlotFormData>>['formState']['errors'];
  control: ReturnType<typeof useForm<PlotFormData>>['control'];
}

interface TabHostProps {
  defaultValues?: Partial<PlotFormData>;
  arrayName?: 'familyContacts' | 'buriedPersons' | 'constructionInfos';
  children: (handles: FormHandles & {
    // useFieldArray is wired generically here, so the element shape is a union
    // across familyContacts/buriedPersons/constructionInfos. Consumers narrow it
    // when passing to a specific tab prop, so a permissive array type is used.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayFields?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayAppend?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayRemove?: any;
    handleSubmit: ReturnType<typeof useForm<PlotFormData>>['handleSubmit'];
  }) => React.ReactNode;
}

/**
 * Renders a tab inside a real react-hook-form context.
 * Pass `arrayName` to also wire up useFieldArray for that path.
 */
export function TabHost({ defaultValues, arrayName, children }: TabHostProps) {
  const merged = { ...defaultPlotFormData, ...defaultValues } as PlotFormData;
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    control,
    handleSubmit,
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotFormSchema) as Resolver<PlotFormData>,
    defaultValues: merged,
  });

  const arr = useFieldArray({
    control,
    name: arrayName ?? 'familyContacts',
  });

  return (
    <form>
      {children({
        register,
        watch,
        setValue,
        errors,
        control,
        handleSubmit,
        arrayFields: arrayName ? arr.fields : undefined,
        arrayAppend: arrayName ? arr.append : undefined,
        arrayRemove: arrayName ? arr.remove : undefined,
      })}
    </form>
  );
}
