import { UseFormRegister, UseFormWatch, UseFormSetValue, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form';
import type { PlotDetailResponse } from '@komine/types';
import type { PlotFormData, FamilyContactFormData, BuriedPersonFormData, ConstructionInfoFormData } from '@/lib/validations/plot-form';
import { MasterItem, TaxTypeMasterItem, SectionNameMasterItem } from '@/lib/api';

export interface MasterData {
  calcTypes: MasterItem[];
  taxTypes: TaxTypeMasterItem[];
  billingTypes: MasterItem[];
  paymentMethods: MasterItem[];
  accountTypes: MasterItem[];
  sectionNames: SectionNameMasterItem[];
  isLoading: boolean;
}

export interface PlotFormProps {
  plotDetail?: PlotDetailResponse;
  onSave: (data: PlotFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PlotTabBaseProps {
  register: UseFormRegister<PlotFormData>;
  watch: UseFormWatch<PlotFormData>;
  setValue: UseFormSetValue<PlotFormData>;
  errors: FieldErrors<PlotFormData>;
  control: Control<PlotFormData>;
  viewMode?: boolean;
  masterData?: MasterData;
}

export interface ContactsTabProps extends PlotTabBaseProps {
  familyContactFields: UseFieldArrayReturn<PlotFormData, 'familyContacts'>['fields'];
  addFamilyContact: UseFieldArrayReturn<PlotFormData, 'familyContacts'>['append'];
  removeFamilyContact: UseFieldArrayReturn<PlotFormData, 'familyContacts'>['remove'];
  expandedContactId: string | null;
  setExpandedContactId: (id: string | null) => void;
}

export interface BurialInfoTabProps extends PlotTabBaseProps {
  buriedPersonFields: UseFieldArrayReturn<PlotFormData, 'buriedPersons'>['fields'];
  addBuriedPerson: UseFieldArrayReturn<PlotFormData, 'buriedPersons'>['append'];
  removeBuriedPerson: UseFieldArrayReturn<PlotFormData, 'buriedPersons'>['remove'];
}

export interface ConstructionInfoTabProps extends PlotTabBaseProps {
  constructionInfoFields: UseFieldArrayReturn<PlotFormData, 'constructionInfos'>['fields'];
  addConstructionInfo: UseFieldArrayReturn<PlotFormData, 'constructionInfos'>['append'];
  removeConstructionInfo: UseFieldArrayReturn<PlotFormData, 'constructionInfos'>['remove'];
}

export interface HistoryTabProps {
  plotDetail?: PlotDetailResponse;
}

// デフォルト値ヘルパー
export const getDefaultContact = (): FamilyContactFormData => ({
  emergencyContactFlag: false,
  name: '',
  birthDate: null,
  relationship: '',
  postalCode: null,
  address: '',
  phoneNumber: '',
  faxNumber: null,
  email: null,
  registeredAddress: null,
  mailingType: null,
  notes: null,
});

export const getDefaultBuriedPerson = (): BuriedPersonFormData => ({
  name: '',
  nameKana: null,
  relationship: null,
  deathDate: null,
  age: null,
  gender: null,
  burialDate: null,
  notes: null,
});

export const getDefaultConstructionInfo = (): ConstructionInfoFormData => ({
  constructionType: null,
  startDate: null,
  completionDate: null,
  contractor: null,
  supervisor: null,
  progress: null,
  workItem1: null,
  workDate1: null,
  workAmount1: null,
  workStatus1: null,
  workItem2: null,
  workDate2: null,
  workAmount2: null,
  workStatus2: null,
  permitNumber: null,
  applicationDate: null,
  permitDate: null,
  permitStatus: null,
  paymentType1: null,
  paymentAmount1: null,
  paymentDate1: null,
  paymentStatus1: null,
  paymentType2: null,
  paymentAmount2: null,
  paymentScheduledDate2: null,
  paymentStatus2: null,
  scheduledEndDate: null,
  constructionContent: null,
  notes: null,
});
