import { UseFormRegister, UseFormWatch, UseFormSetValue, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form';
import { ConstructionType, ConstructionRecord, HistoryRecord, TerminationProcessType, OwnedPlot, CustomerPlotAssignment } from '@/types/plot-constants';
import { CustomerFormData } from '@/lib/validations';
import { MasterItem, TaxTypeMasterItem } from '@/lib/api';

/**
 * Legacy Customer type - retained for CustomerForm defaultValues mapping.
 * Will be removed when CustomerForm is fully migrated to Plot-based form.
 */
export interface Customer {
  id: string;
  customerCode: string;
  plotNumber?: string;
  plotPeriod?: string;
  section?: string;
  applicantInfo?: {
    applicationDate: Date | null;
    staffName: string;
    name: string;
    nameKana: string;
    postalCode: string;
    phoneNumber: string;
    address: string;
  };
  reservationDate: Date | null;
  acceptanceNumber?: string;
  permitDate: Date | null;
  startDate: Date | null;
  name: string;
  nameKana: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | undefined;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  address: string;
  registeredAddress?: string;
  usageFee?: {
    calculationType: string;
    taxType: string;
    billingType: string;
    billingYears: number | null;
    area: string;
    unitPrice: number | null;
    usageFee: number | null;
    paymentMethod: string;
  };
  managementFee?: {
    calculationType: string;
    taxType: string;
    billingType: string;
    billingYears: number | null;
    area: string;
    billingMonth: number | null;
    managementFee: number | null;
    unitPrice: number | null;
    lastBillingMonth: string;
    paymentMethod: string;
  };
  gravestoneInfo?: {
    gravestoneBase: string;
    enclosurePosition: string;
    gravestoneDealer: string;
    gravestoneType: string;
    surroundingArea: string;
    establishmentDeadline: Date | null;
    establishmentDate: Date | null;
  };
  familyContacts?: {
    id: string;
    name: string;
    nameKana?: string;
    birthDate: Date | null;
    gender?: 'male' | 'female' | undefined;
    relationship: string;
    address: string;
    phoneNumber: string;
    faxNumber?: string;
    email?: string;
    registeredAddress?: string;
    mailingType: 'home' | 'work' | 'other' | undefined;
    companyName?: string;
    companyNameKana?: string;
    companyAddress?: string;
    companyPhone?: string;
    notes?: string;
  }[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  } | null;
  buriedPersons?: {
    id: string;
    name: string;
    nameKana?: string;
    birthDate?: Date | null;
    gender: 'male' | 'female' | undefined;
    posthumousName?: string;
    deathDate?: Date | null;
    age?: number;
    burialDate?: Date | null;
    reportDate?: Date | null;
    religion?: string;
    relationship?: string;
    memo?: string;
  }[];
  workInfo?: {
    companyName: string;
    companyNameKana: string;
    workAddress: string;
    workPostalCode: string;
    workPhoneNumber: string;
    dmSetting: 'allow' | 'deny' | 'limited';
    addressType: 'home' | 'work' | 'other';
    notes: string;
  };
  billingInfo?: {
    billingType: 'individual' | 'corporate' | 'bank_transfer';
    institutionName: string;
    branchName: string;
    accountType: 'ordinary' | 'current' | 'savings';
    symbolNumber: string;
    accountNumber: string;
    accountHolder: string;
    type?: string;
  };
  plotInfo?: {
    plotNumber: string;
    section: string;
    usage: 'in_use' | 'available' | 'reserved';
    size: string;
    price: string;
    contractDate: Date | null;
    capacity?: number;
  } | null;
  ownedPlots?: OwnedPlot[];
  plotAssignments?: CustomerPlotAssignment[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
  postalCode?: string;
  constructionRecords?: ConstructionRecord[];
  historyRecords?: HistoryRecord[];
  terminationInfo?: {
    terminationDate: Date | null;
    reason: string;
    processType: TerminationProcessType;
    processDetail?: string;
    refundAmount?: number;
    handledBy?: string;
    notes?: string;
  };
  notes?: string;
}

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
