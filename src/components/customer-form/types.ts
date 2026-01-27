import { UseFormRegister, UseFormWatch, UseFormSetValue, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form';
import { Customer, ConstructionType } from '@/types/customer';
import { CustomerFormData } from '@/lib/validations';
import { MasterItem, TaxTypeMasterItem } from '@/lib/api';

// マスタデータの型
export interface MasterData {
  calcTypes: MasterItem[];
  taxTypes: TaxTypeMasterItem[];
  billingTypes: MasterItem[];
  paymentMethods: MasterItem[];
  accountTypes: MasterItem[];
  constructionTypes: MasterItem[];
  isLoading: boolean;
}

export interface CustomerFormProps {
  customer?: Customer;
  onSave: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TabBaseProps {
  register: UseFormRegister<CustomerFormData>;
  watch: UseFormWatch<CustomerFormData>;
  setValue: UseFormSetValue<CustomerFormData>;
  errors: FieldErrors<CustomerFormData>;
  control: Control<CustomerFormData>;
  customer?: Customer;
  /** 閲覧モード（trueの場合は読み取り専用表示） */
  viewMode?: boolean;
  /** マスタデータ */
  masterData?: MasterData;
}

export interface ContactsTabProps extends TabBaseProps {
  familyContactFields: UseFieldArrayReturn<CustomerFormData, 'familyContacts'>['fields'];
  addFamilyContact: UseFieldArrayReturn<CustomerFormData, 'familyContacts'>['append'];
  removeFamilyContact: UseFieldArrayReturn<CustomerFormData, 'familyContacts'>['remove'];
  expandedContactId: string | null;
  setExpandedContactId: (id: string | null) => void;
}

export interface BurialInfoTabProps extends TabBaseProps {
  buriedPersonFields: UseFieldArrayReturn<CustomerFormData, 'buriedPersons'>['fields'];
  addBuriedPerson: UseFieldArrayReturn<CustomerFormData, 'buriedPersons'>['append'];
  removeBuriedPerson: UseFieldArrayReturn<CustomerFormData, 'buriedPersons'>['remove'];
}

export interface ConstructionInfoTabProps extends TabBaseProps {
  constructionRecordFields: UseFieldArrayReturn<CustomerFormData, 'constructionRecords'>['fields'];
  addConstructionRecord: UseFieldArrayReturn<CustomerFormData, 'constructionRecords'>['append'];
  removeConstructionRecord: UseFieldArrayReturn<CustomerFormData, 'constructionRecords'>['remove'];
  expandedConstructionId: string | null;
  setExpandedConstructionId: (id: string | null) => void;
}

export interface HistoryTabProps {
  customer?: Customer;
  selectedHistoryId: string | null;
  setSelectedHistoryId: (id: string | null) => void;
  /** 閲覧モード（trueの場合は読み取り専用表示） */
  viewMode?: boolean;
}

export interface PlotSettingsSectionProps {
  customer?: Customer;
  watch: UseFormWatch<CustomerFormData>;
  setValue: UseFormSetValue<CustomerFormData>;
}

// 新規連絡先のデフォルト値
export const getDefaultContact = (id: string) => ({
  id,
  name: '',
  nameKana: '',
  birthDate: '',
  gender: '' as '' | 'male' | 'female',
  relationship: '',
  address: '',
  phoneNumber: '',
  faxNumber: '',
  email: '',
  registeredAddress: '',
  mailingType: '' as '' | 'home' | 'work' | 'other',
  companyName: '',
  companyNameKana: '',
  companyAddress: '',
  companyPhone: '',
  notes: ''
});

// 新規埋葬者のデフォルト値
export const getDefaultBuriedPerson = (id: string) => ({
  id,
  name: '',
  nameKana: '',
  birthDate: '',
  gender: '' as '' | 'male' | 'female',
  posthumousName: '',
  deathDate: '',
  age: '',
  burialDate: '',
  reportDate: '',
  religion: '',
  relationship: '',
  memo: ''
});

// 新規工事記録のデフォルト値
export const getDefaultConstructionRecord = (id: string) => ({
  id,
  contractorName: '',
  constructionType: 'gravestone' as ConstructionType,
  startDate: '',
  scheduledEndDate: '',
  endDate: '',
  description: '',
  constructionAmount: '',
  paidAmount: '',
  notes: ''
});
