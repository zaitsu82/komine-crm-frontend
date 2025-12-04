import {
  CollectiveBurialApplication,
  CollectiveBurialApplicationInput,
  CollectiveBurialCeremony,
  CollectiveBurialDocument,
  CollectiveBurialPerson,
  CollectiveBurialStatus,
} from '@/types/collective-burial';
import { integrateCollectiveBurialToCustomer } from '@/lib/customer-collective-burial-integration';

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const parseNumber = (value?: string): number | null => {
  if (!value) return null;
  const normalized = value.replace(/,/g, '').trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(4, '0')}`;

export const mockCollectiveBurialApplications: CollectiveBurialApplication[] = [
  {
    id: 'CBA-0001',
    applicationDate: new Date('2024-09-01'),
    desiredDate: new Date('2024-09-23'),
    burialType: 'family',
    status: 'completed',
    mainRepresentative: '長男（契約者本人）',
    applicant: {
      name: '田中 太郎',
      nameKana: 'たなか たろう',
      phone: '090-1234-5678',
      email: 'tanaka.taro@example.com',
      postalCode: '803-0841',
      address: '福岡県北九州市小倉北区清水2-12-15',
    },
    plot: {
      plotPeriod: '1期',
      section: 'A',
      number: 'A-001',
    },
    persons: [
      {
        id: 'CBA-0001-PER-01',
        name: '田中 一郎',
        nameKana: 'たなか いちろう',
        relationship: '父',
        deathDate: new Date('2023-12-15'),
        age: 85,
        gender: 'male',
        originalPlotNumber: 'A-001-A',
        certificateNumber: 'KAI-2024-001',
        memo: '元の墓所から移転'
      },
      {
        id: 'CBA-0001-PER-02',
        name: '田中 花子',
        nameKana: 'たなか はなこ',
        relationship: '母',
        deathDate: new Date('2024-03-20'),
        age: 80,
        gender: 'female',
        originalPlotNumber: 'A-001-B',
        certificateNumber: 'KAI-2024-002',
        memo: '同日移転実施'
      }
    ],
    ceremonies: [
      {
        id: 'CBA-0001-CER-01',
        date: new Date('2024-09-23'),
        officiant: '浄土寺 慈恵和尚',
        religion: '浄土宗',
        participants: 15,
        location: '小霊園内 合祀堂',
        memo: '秋彼岸に実施'
      }
    ],
    documents: [
      {
        id: 'CBA-0001-DOC-01',
        type: 'permit',
        name: '改葬許可証（田中一郎）',
        issuedDate: new Date('2024-09-10')
      },
      {
        id: 'CBA-0001-DOC-02',
        type: 'permit',
        name: '改葬許可証（田中花子）',
        issuedDate: new Date('2024-09-10')
      },
      {
        id: 'CBA-0001-DOC-03',
        type: 'agreement',
        name: '合祀同意書',
        issuedDate: new Date('2024-09-01'),
        memo: '親族一同署名済み'
      }
    ],
    payment: {
      totalFee: 500000,
      depositAmount: 100000,
      paymentMethod: '銀行振込',
      paymentDueDate: new Date('2024-09-15')
    },
    specialRequests: '浄土宗の作法に従い、阿弥陀如来への読経を重視。',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-09-23')
  }
];

export const getCollectiveBurialApplications = (): CollectiveBurialApplication[] => {
  return [...mockCollectiveBurialApplications].sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
};

const toPerson = (applicationId: string, index: number, person: CollectiveBurialApplicationInput['persons'][number]): CollectiveBurialPerson => {
  return {
    id: `${applicationId}-PER-${String(index + 1).padStart(2, '0')}`,
    name: person.name,
    nameKana: person.nameKana,
    relationship: person.relationship,
    deathDate: parseDate(person.deathDate),
    age: person.age ? parseNumber(person.age) : null,
    gender: person.gender,
    originalPlotNumber: person.originalPlotNumber,
    certificateNumber: person.certificateNumber,
    memo: person.memo,
  };
};

const toCeremony = (applicationId: string, index: number, ceremony: NonNullable<CollectiveBurialApplicationInput['ceremonies']>[number]): CollectiveBurialCeremony => {
  return {
    id: `${applicationId}-CER-${String(index + 1).padStart(2, '0')}`,
    date: parseDate(ceremony.date),
    officiant: ceremony.officiant,
    religion: ceremony.religion,
    participants: ceremony.participants ? parseNumber(ceremony.participants) : null,
    location: ceremony.location,
    memo: ceremony.memo,
  };
};

const toDocument = (applicationId: string, index: number, document: NonNullable<CollectiveBurialApplicationInput['documents']>[number]): CollectiveBurialDocument => {
  return {
    id: `${applicationId}-DOC-${String(index + 1).padStart(2, '0')}`,
    type: document.type,
    name: document.name,
    issuedDate: parseDate(document.issuedDate),
    memo: document.memo,
  };
};

export const createCollectiveBurialApplication = async (
  input: CollectiveBurialApplicationInput
): Promise<CollectiveBurialApplication> => {
  const now = new Date();
  const newIndex = mockCollectiveBurialApplications.length + 1;
  const applicationId = generateId('CBA', newIndex);

  const status: CollectiveBurialStatus = input.desiredDate && parseDate(input.desiredDate)
    ? 'scheduled'
    : 'pending';

  const newApplication: CollectiveBurialApplication = {
    id: applicationId,
    applicationDate: parseDate(input.applicationDate) || now,
    desiredDate: parseDate(input.desiredDate),
    burialType: input.burialType,
    status,
    mainRepresentative: input.mainRepresentative,
    applicant: {
      name: input.applicantName,
      nameKana: input.applicantNameKana,
      phone: input.applicantPhone,
      email: input.applicantEmail || undefined,
      postalCode: input.applicantPostalCode || undefined,
      address: input.applicantAddress,
    },
    plot: {
      section: input.plotSection,
      number: input.plotNumber,
    },
    persons: input.persons.map((person, index) => toPerson(applicationId, index, person)),
    ceremonies: (input.ceremonies || []).map((ceremony, index) => toCeremony(applicationId, index, ceremony)),
    documents: (input.documents || []).map((document, index) => toDocument(applicationId, index, document)),
    payment: {
      totalFee: parseNumber(input.totalFee),
      depositAmount: parseNumber(input.depositAmount),
      paymentMethod: input.paymentMethod || null,
      paymentDueDate: parseDate(input.paymentDueDate),
    },
    specialRequests: input.specialRequests,
    createdAt: now,
    updatedAt: now,
  };

  mockCollectiveBurialApplications.unshift(newApplication);

  // 顧客データに合祀情報を統合（顧客コードがある場合のみ）
  // 申込者名から顧客を推測することも可能だが、ここでは区画情報で紐付け
  const integrationResult = integrateCollectiveBurialToCustomer(newApplication);

  if (!integrationResult.success) {
    console.warn('合祀申込の顧客データへの統合に失敗:', integrationResult.error);
    // エラーでも申込自体は作成済みなので継続
  } else {
    console.log('合祀申込を顧客データに統合しました:', integrationResult.customer?.customerCode);
  }

  return newApplication;
};
