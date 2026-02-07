import { UseFormRegister, UseFormWatch, UseFormSetValue, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form';
import type { PlotDetailResponse } from '@komine/types';
import type { PlotFormData, FamilyContactFormData, BuriedPersonFormData } from '@/lib/validations/plot-form';
import { MasterItem, TaxTypeMasterItem } from '@/lib/api';

export interface MasterData {
  calcTypes: MasterItem[];
  taxTypes: TaxTypeMasterItem[];
  billingTypes: MasterItem[];
  paymentMethods: MasterItem[];
  accountTypes: MasterItem[];
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
