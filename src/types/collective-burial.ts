export type CollectiveBurialType = 'family' | 'relative' | 'other';

export type CollectiveBurialStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface CollectiveBurialPerson {
  id: string;
  name: string;
  nameKana: string;
  relationship: string;
  deathDate: Date | null;
  age?: number | null;
  gender?: 'male' | 'female' | '';
  originalPlotNumber?: string;
  certificateNumber?: string;
  memo?: string;
}

export interface CollectiveBurialCeremony {
  id: string;
  date: Date | null;
  officiant?: string;
  religion?: string;
  participants?: number | null;
  location?: string;
  memo?: string;
}

export interface CollectiveBurialDocument {
  id: string;
  type: 'permit' | 'certificate' | 'agreement' | 'other';
  name: string;
  issuedDate: Date | null;
  memo?: string;
}

export interface CollectiveBurialPaymentInfo {
  totalFee?: number | null;
  depositAmount?: number | null;
  paymentMethod?: string | null;
  paymentDueDate?: Date | null;
}

export interface CollectiveBurialApplication {
  id: string;
  applicationDate: Date;
  desiredDate: Date | null;
  burialType: CollectiveBurialType;
  status: CollectiveBurialStatus;
  mainRepresentative: string;
  applicant: {
    name: string;
    nameKana: string;
    phone: string;
    email?: string;
    postalCode?: string;
    address: string;
  };
  plot: {
    section: string;
    number: string;
  };
  persons: CollectiveBurialPerson[];
  ceremonies: CollectiveBurialCeremony[];
  documents: CollectiveBurialDocument[];
  payment: CollectiveBurialPaymentInfo;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectiveBurialApplicationInput {
  applicationDate: string;
  desiredDate?: string;
  burialType: CollectiveBurialType;
  mainRepresentative: string;
  applicantName: string;
  applicantNameKana: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantPostalCode?: string;
  applicantAddress: string;
  plotSection: string;
  plotNumber: string;
  specialRequests?: string;
  totalFee?: string;
  depositAmount?: string;
  paymentMethod?: string;
  paymentDueDate?: string;
  persons: {
    name: string;
    nameKana: string;
    relationship: string;
    deathDate: string;
    age?: string;
    gender?: 'male' | 'female' | '';
    originalPlotNumber?: string;
    certificateNumber?: string;
    memo?: string;
  }[];
  ceremonies?: {
    date?: string;
    officiant?: string;
    religion?: string;
    participants?: string;
    location?: string;
    memo?: string;
  }[];
  documents?: {
    type: 'permit' | 'certificate' | 'agreement' | 'other';
    name: string;
    issuedDate?: string;
    memo?: string;
  }[];
}
