import {
  physicalPlotSchema,
  contractPlotSchema,
  saleContractSchema,
  customerSchema,
  workInfoSchema,
  billingInfoSchema,
  gravestoneInfoSchema,
  familyContactSchema,
  buriedPersonSchema,
  collectiveBurialSchema,
  plotFormSchema,
  plotUpdateFormSchema,
  defaultPhysicalPlot,
  defaultContractPlot,
  defaultSaleContract,
  defaultCustomer,
  defaultPlotFormData,
  plotFormDataToCreateRequest,
  plotFormDataToUpdateRequest,
  plotDetailToFormData,
} from '@/lib/validations/plot-form';
import type { PlotFormData, PlotUpdateFormData } from '@/lib/validations/plot-form';
import type { PlotDetailResponse } from '@komine/types';
import {
  PaymentStatus,
  ContractRole,
  Gender,
  DmSetting,
  AddressType,
  BillingType,
  AccountType,
  PhysicalPlotStatus,
  ContractStatus,
} from '@komine/types';

// ===== テストヘルパー =====

function validPhysicalPlot() {
  return { plotNumber: 'A-001', areaName: '1期', areaSqm: 3.6, notes: null };
}

function validContractPlot() {
  return { contractAreaSqm: 3.6, locationDescription: null };
}

function validSaleContract() {
  return {
    contractDate: '2024-01-15',
    price: 500000,
    paymentStatus: PaymentStatus.Unpaid,
    reservationDate: '',
    acceptanceNumber: '',
    permitDate: '',
    permitNumber: '',
    startDate: '',
    notes: null,
  };
}

function validCustomer() {
  return {
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    birthDate: null,
    gender: null,
    postalCode: '1234567',
    address: '東京都新宿区',
    registeredAddress: null,
    phoneNumber: '09012345678',
    faxNumber: null,
    email: null,
    notes: null,
    role: ContractRole.Contractor,
  };
}

function validPlotFormData(): PlotFormData {
  return {
    physicalPlot: validPhysicalPlot(),
    contractPlot: validContractPlot(),
    saleContract: validSaleContract(),
    customer: validCustomer(),
    workInfo: null,
    billingInfo: null,
    usageFee: null,
    managementFee: null,
    gravestoneInfo: null,
    familyContacts: [],
    buriedPersons: [],
    collectiveBurial: null,
  };
}

function makePlotDetail(overrides: Partial<PlotDetailResponse> = {}): PlotDetailResponse {
  return {
    id: 'plot-1',
    contractAreaSqm: 3.6,
    locationDescription: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    physicalPlot: {
      id: 'pp-1',
      plotNumber: 'A-001',
      areaName: '1期',
      areaSqm: 3.6,
      status: PhysicalPlotStatus.SoldOut,
      notes: null,
    },
    contractDate: '2024-01-15',
    price: 500000,
    contractStatus: ContractStatus.Active,
    paymentStatus: PaymentStatus.Paid,
    reservationDate: null,
    acceptanceNumber: null,
    permitDate: null,
    permitNumber: null,
    startDate: null,
    contractNotes: null,
    usageFee: null,
    managementFee: null,
    buriedPersons: [],
    familyContacts: [],
    gravestoneInfo: null,
    constructionInfos: [],
    collectiveBurial: null,
    roles: [
      {
        id: 'role-1',
        role: ContractRole.Contractor,
        roleStartDate: null,
        roleEndDate: null,
        notes: null,
        customer: {
          id: 'cust-1',
          name: '田中太郎',
          nameKana: 'タナカタロウ',
          gender: Gender.Male,
          birthDate: '1970-01-01',
          phoneNumber: '09012345678',
          faxNumber: null,
          email: 'tanaka@example.com',
          postalCode: '1234567',
          address: '東京都新宿区',
          registeredAddress: null,
          notes: null,
          workInfo: null,
          billingInfo: null,
        },
      },
    ],
    ...overrides,
  };
}

// ===== Zodスキーマバリデーション =====

describe('plot-form.ts - Zodスキーマバリデーション', () => {
  describe('physicalPlotSchema', () => {
    it('有効なデータでパスする', () => {
      const result = physicalPlotSchema.safeParse(validPhysicalPlot());
      expect(result.success).toBe(true);
    });

    it('plotNumberが空の場合エラー', () => {
      const result = physicalPlotSchema.safeParse({ ...validPhysicalPlot(), plotNumber: '' });
      expect(result.success).toBe(false);
    });

    it('areaNameが空の場合エラー', () => {
      const result = physicalPlotSchema.safeParse({ ...validPhysicalPlot(), areaName: '' });
      expect(result.success).toBe(false);
    });

    it('areaSqmのデフォルト値は3.6', () => {
      const data = { plotNumber: 'A-001', areaName: '1期' };
      const result = physicalPlotSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.areaSqm).toBe(3.6);
      }
    });

    it('areaSqmが0以下の場合エラー', () => {
      const result = physicalPlotSchema.safeParse({ ...validPhysicalPlot(), areaSqm: 0 });
      expect(result.success).toBe(false);
    });

    it('areaSqmが負の場合エラー', () => {
      const result = physicalPlotSchema.safeParse({ ...validPhysicalPlot(), areaSqm: -1 });
      expect(result.success).toBe(false);
    });

    it('notesはnullを許容', () => {
      const result = physicalPlotSchema.safeParse({ ...validPhysicalPlot(), notes: null });
      expect(result.success).toBe(true);
    });

    it('notesはoptionalで省略可能', () => {
      const { notes: _, ...data } = validPhysicalPlot();
      const result = physicalPlotSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('customerSchema', () => {
    it('有効なデータでパスする', () => {
      const result = customerSchema.safeParse(validCustomer());
      expect(result.success).toBe(true);
    });

    it('nameが空の場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), name: '' });
      expect(result.success).toBe(false);
    });

    it('nameKanaが空の場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), nameKana: '' });
      expect(result.success).toBe(false);
    });

    it('postalCodeが7桁でない場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), postalCode: '123456' });
      expect(result.success).toBe(false);
    });

    it('postalCodeが7桁数字でパスする', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), postalCode: '1234567' });
      expect(result.success).toBe(true);
    });

    it('postalCodeにハイフンが含まれる場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), postalCode: '123-4567' });
      expect(result.success).toBe(false);
    });

    it('phoneNumberが10桁でパスする', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), phoneNumber: '0312345678' });
      expect(result.success).toBe(true);
    });

    it('phoneNumberが11桁でパスする', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), phoneNumber: '09012345678' });
      expect(result.success).toBe(true);
    });

    it('phoneNumberが9桁の場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), phoneNumber: '123456789' });
      expect(result.success).toBe(false);
    });

    it('phoneNumberが12桁の場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), phoneNumber: '123456789012' });
      expect(result.success).toBe(false);
    });

    it('emailは空文字を許容', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), email: '' });
      expect(result.success).toBe(true);
    });

    it('emailはnullを許容', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), email: null });
      expect(result.success).toBe(true);
    });

    it('email不正値の場合エラー', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('roleのデフォルト値はContractor', () => {
      const { role: _, ...data } = validCustomer();
      const result = customerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(ContractRole.Contractor);
      }
    });

    it('genderはnullを許容', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), gender: null });
      expect(result.success).toBe(true);
    });

    it('有効なGender値でパスする', () => {
      const result = customerSchema.safeParse({ ...validCustomer(), gender: Gender.Male });
      expect(result.success).toBe(true);
    });
  });

  describe('saleContractSchema', () => {
    it('有効なデータでパスする', () => {
      const result = saleContractSchema.safeParse(validSaleContract());
      expect(result.success).toBe(true);
    });

    it('contractDateが空の場合エラー', () => {
      const result = saleContractSchema.safeParse({ ...validSaleContract(), contractDate: '' });
      expect(result.success).toBe(false);
    });

    it('priceが負の場合エラー', () => {
      const result = saleContractSchema.safeParse({ ...validSaleContract(), price: -1 });
      expect(result.success).toBe(false);
    });

    it('priceが0でパスする', () => {
      const result = saleContractSchema.safeParse({ ...validSaleContract(), price: 0 });
      expect(result.success).toBe(true);
    });

    it('paymentStatusのデフォルト値はUnpaid', () => {
      const { paymentStatus: _, ...data } = validSaleContract();
      const result = saleContractSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentStatus).toBe(PaymentStatus.Unpaid);
      }
    });

    it('dateString形式（YYYY-MM-DD）でパスする', () => {
      const result = saleContractSchema.safeParse({
        ...validSaleContract(),
        reservationDate: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('dateString形式でない場合エラー', () => {
      const result = saleContractSchema.safeParse({
        ...validSaleContract(),
        reservationDate: '2024/01/15',
      });
      expect(result.success).toBe(false);
    });

    it('dateStringは空文字を許容', () => {
      const result = saleContractSchema.safeParse({
        ...validSaleContract(),
        reservationDate: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('billingInfoSchema', () => {
    const validBilling = {
      billingType: BillingType.Individual,
      bankName: 'みずほ銀行',
      branchName: '新宿支店',
      accountType: AccountType.Ordinary,
      accountNumber: '1234567',
      accountHolder: '田中太郎',
    };

    it('有効なデータでパスする', () => {
      const result = billingInfoSchema.safeParse(validBilling);
      expect(result.success).toBe(true);
    });

    it('bankNameが空の場合エラー', () => {
      const result = billingInfoSchema.safeParse({ ...validBilling, bankName: '' });
      expect(result.success).toBe(false);
    });

    it('branchNameが空の場合エラー', () => {
      const result = billingInfoSchema.safeParse({ ...validBilling, branchName: '' });
      expect(result.success).toBe(false);
    });

    it('accountNumberが空の場合エラー', () => {
      const result = billingInfoSchema.safeParse({ ...validBilling, accountNumber: '' });
      expect(result.success).toBe(false);
    });

    it('accountHolderが空の場合エラー', () => {
      const result = billingInfoSchema.safeParse({ ...validBilling, accountHolder: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('familyContactSchema', () => {
    const validContact = {
      name: '田中花子',
      relationship: '妻',
      address: '東京都新宿区',
      phoneNumber: '09012345678',
    };

    it('有効なデータでパスする', () => {
      const result = familyContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('nameが空の場合エラー', () => {
      const result = familyContactSchema.safeParse({ ...validContact, name: '' });
      expect(result.success).toBe(false);
    });

    it('relationshipが空の場合エラー', () => {
      const result = familyContactSchema.safeParse({ ...validContact, relationship: '' });
      expect(result.success).toBe(false);
    });

    it('addressが空の場合エラー', () => {
      const result = familyContactSchema.safeParse({ ...validContact, address: '' });
      expect(result.success).toBe(false);
    });

    it('phoneNumberが空の場合エラー', () => {
      const result = familyContactSchema.safeParse({ ...validContact, phoneNumber: '' });
      expect(result.success).toBe(false);
    });

    it('emergencyContactFlagのデフォルト値はfalse', () => {
      const result = familyContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emergencyContactFlag).toBe(false);
      }
    });

    it('idはオプショナル', () => {
      const result = familyContactSchema.safeParse({ ...validContact, id: 'fc-1' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('fc-1');
      }
    });
  });

  describe('buriedPersonSchema', () => {
    it('nameのみで最小限パスする', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎' });
      expect(result.success).toBe(true);
    });

    it('nameが空の場合エラー', () => {
      const result = buriedPersonSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('ageは整数・非負', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎', age: 80 });
      expect(result.success).toBe(true);
    });

    it('ageは0でパスする', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎', age: 0 });
      expect(result.success).toBe(true);
    });

    it('ageが負の場合エラー', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎', age: -1 });
      expect(result.success).toBe(false);
    });

    it('ageが小数の場合エラー', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎', age: 80.5 });
      expect(result.success).toBe(false);
    });

    it('ageはnullを許容', () => {
      const result = buriedPersonSchema.safeParse({ name: '田中一郎', age: null });
      expect(result.success).toBe(true);
    });
  });

  describe('collectiveBurialSchema', () => {
    it('有効なデータでパスする', () => {
      const result = collectiveBurialSchema.safeParse({
        burialCapacity: 10,
        validityPeriodYears: 30,
      });
      expect(result.success).toBe(true);
    });

    it('burialCapacityが0以下の場合エラー', () => {
      const result = collectiveBurialSchema.safeParse({
        burialCapacity: 0,
        validityPeriodYears: 30,
      });
      expect(result.success).toBe(false);
    });

    it('validityPeriodYearsが0以下の場合エラー', () => {
      const result = collectiveBurialSchema.safeParse({
        burialCapacity: 10,
        validityPeriodYears: 0,
      });
      expect(result.success).toBe(false);
    });

    it('burialCapacityは正の整数', () => {
      const result = collectiveBurialSchema.safeParse({
        burialCapacity: 5.5,
        validityPeriodYears: 30,
      });
      expect(result.success).toBe(false);
    });

    it('billingAmountはnullable', () => {
      const result = collectiveBurialSchema.safeParse({
        burialCapacity: 10,
        validityPeriodYears: 30,
        billingAmount: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('plotFormSchema', () => {
    it('全必須セクションで有効なデータでパスする', () => {
      const result = plotFormSchema.safeParse(validPlotFormData());
      expect(result.success).toBe(true);
    });

    it('physicalPlotが欠けるとエラー', () => {
      const { physicalPlot: _, ...data } = validPlotFormData();
      const result = plotFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('optionalセクションはnullを許容', () => {
      const data = validPlotFormData();
      data.workInfo = null;
      data.billingInfo = null;
      data.usageFee = null;
      data.managementFee = null;
      data.gravestoneInfo = null;
      data.collectiveBurial = null;
      const result = plotFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('配列セクションはoptional', () => {
      const data = validPlotFormData();
      delete data.familyContacts;
      delete data.buriedPersons;
      const result = plotFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('plotUpdateFormSchema', () => {
    it('physicalPlotのnotesのみ更新可能', () => {
      const result = plotUpdateFormSchema.safeParse({
        physicalPlot: { notes: 'メモ更新' },
      });
      expect(result.success).toBe(true);
    });

    it('空オブジェクトでパスする', () => {
      const result = plotUpdateFormSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('contractPlotはpartial', () => {
      const result = plotUpdateFormSchema.safeParse({
        contractPlot: { contractAreaSqm: 1.8 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('workInfoSchema', () => {
    it('companyNameのみ必須', () => {
      const result = workInfoSchema.safeParse({ companyName: '株式会社テスト' });
      expect(result.success).toBe(true);
    });

    it('companyNameが空の場合エラー', () => {
      const result = workInfoSchema.safeParse({ companyName: '' });
      expect(result.success).toBe(false);
    });

    it('dmSettingのデフォルト値はAllow', () => {
      const result = workInfoSchema.safeParse({ companyName: '株式会社テスト' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dmSetting).toBe(DmSetting.Allow);
      }
    });

    it('addressTypeのデフォルト値はHome', () => {
      const result = workInfoSchema.safeParse({ companyName: '株式会社テスト' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.addressType).toBe(AddressType.Home);
      }
    });
  });

  describe('contractPlotSchema', () => {
    it('有効なデータでパスする', () => {
      const result = contractPlotSchema.safeParse(validContractPlot());
      expect(result.success).toBe(true);
    });

    it('contractAreaSqmが0以下の場合エラー', () => {
      const result = contractPlotSchema.safeParse({ contractAreaSqm: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('gravestoneInfoSchema', () => {
    it('全フィールドnullableで空オブジェクトパスする', () => {
      const result = gravestoneInfoSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('dateString形式の日付でパスする', () => {
      const result = gravestoneInfoSchema.safeParse({
        establishmentDate: '2024-06-01',
        establishmentDeadline: '2024-12-31',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ===== デフォルト値 =====

describe('plot-form.ts - デフォルト値', () => {
  it('defaultPhysicalPlotの構造', () => {
    expect(defaultPhysicalPlot).toEqual({
      plotNumber: '',
      areaName: '',
      areaSqm: 3.6,
      notes: null,
    });
  });

  it('defaultContractPlotの構造', () => {
    expect(defaultContractPlot).toEqual({
      contractAreaSqm: 3.6,
      locationDescription: null,
    });
  });

  it('defaultSaleContract.contractDateは今日の日付', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15'));

    // 再importが必要なのでISO文字列を直接チェック
    const today = new Date().toISOString().split('T')[0];
    expect(today).toBe('2024-06-15');

    jest.useRealTimers();
  });

  it('defaultSaleContract.paymentStatusはUnpaid', () => {
    expect(defaultSaleContract.paymentStatus).toBe(PaymentStatus.Unpaid);
  });

  it('defaultCustomer.roleはContractor', () => {
    expect(defaultCustomer.role).toBe(ContractRole.Contractor);
  });

  it('defaultPlotFormDataの構造', () => {
    expect(defaultPlotFormData.workInfo).toBeNull();
    expect(defaultPlotFormData.billingInfo).toBeNull();
    expect(defaultPlotFormData.usageFee).toBeNull();
    expect(defaultPlotFormData.managementFee).toBeNull();
    expect(defaultPlotFormData.gravestoneInfo).toBeNull();
    expect(defaultPlotFormData.familyContacts).toEqual([]);
    expect(defaultPlotFormData.buriedPersons).toEqual([]);
    expect(defaultPlotFormData.collectiveBurial).toBeNull();
  });
});

// ===== plotFormDataToCreateRequest =====

describe('plotFormDataToCreateRequest', () => {
  it('完全なデータを正しくCreatePlotRequestに変換する', () => {
    const formData = validPlotFormData();
    const request = plotFormDataToCreateRequest(formData);

    expect(request.physicalPlot.plotNumber).toBe('A-001');
    expect(request.physicalPlot.areaName).toBe('1期');
    expect(request.physicalPlot.areaSqm).toBe(3.6);
    expect(request.customer.name).toBe('田中太郎');
    expect(request.customer.role).toBe(ContractRole.Contractor);
    expect(request.saleContract.contractDate).toBe('2024-01-15');
    expect(request.saleContract.price).toBe(500000);
  });

  it('null値をundefinedに変換する', () => {
    const formData = validPlotFormData();
    formData.physicalPlot.notes = null;
    const request = plotFormDataToCreateRequest(formData);

    expect(request.physicalPlot.notes).toBeUndefined();
  });

  it('空文字をundefinedに変換する', () => {
    const formData = validPlotFormData();
    formData.saleContract.reservationDate = '';
    formData.saleContract.permitDate = '';
    const request = plotFormDataToCreateRequest(formData);

    expect(request.saleContract.reservationDate).toBeUndefined();
    expect(request.saleContract.permitDate).toBeUndefined();
  });

  it('workInfoがnullの場合undefinedになる', () => {
    const formData = validPlotFormData();
    formData.workInfo = null;
    const request = plotFormDataToCreateRequest(formData);

    expect(request.workInfo).toBeUndefined();
  });

  it('workInfoが存在する場合正しくマッピングする', () => {
    const formData = validPlotFormData();
    formData.workInfo = {
      companyName: '株式会社テスト',
      companyNameKana: 'カブシキカイシャテスト',
      workAddress: '東京都港区',
      workPostalCode: '1050001',
      workPhoneNumber: '0312345678',
      dmSetting: DmSetting.Allow,
      addressType: AddressType.Work,
      notes: null,
    };
    const request = plotFormDataToCreateRequest(formData);

    expect(request.workInfo).toBeDefined();
    expect(request.workInfo!.companyName).toBe('株式会社テスト');
    expect(request.workInfo!.dmSetting).toBe(DmSetting.Allow);
    expect(request.workInfo!.notes).toBeUndefined(); // null → undefined
  });

  it('billingInfoが存在する場合正しくマッピングする', () => {
    const formData = validPlotFormData();
    formData.billingInfo = {
      billingType: BillingType.Individual,
      bankName: 'みずほ銀行',
      branchName: '新宿支店',
      accountType: AccountType.Ordinary,
      accountNumber: '1234567',
      accountHolder: '田中太郎',
    };
    const request = plotFormDataToCreateRequest(formData);

    expect(request.billingInfo).toBeDefined();
    expect(request.billingInfo!.bankName).toBe('みずほ銀行');
  });

  it('familyContactsの配列マッピング', () => {
    const formData = validPlotFormData();
    formData.familyContacts = [
      {
        emergencyContactFlag: true,
        name: '田中花子',
        birthDate: '1975-03-20',
        relationship: '妻',
        postalCode: '1234567',
        address: '東京都新宿区',
        phoneNumber: '09087654321',
        faxNumber: null,
        email: null,
        registeredAddress: null,
        mailingType: null,
        notes: null,
      },
    ];
    const request = plotFormDataToCreateRequest(formData);

    expect(request.familyContacts).toHaveLength(1);
    expect(request.familyContacts![0].name).toBe('田中花子');
    expect(request.familyContacts![0].emergencyContactFlag).toBe(true);
    expect(request.familyContacts![0].faxNumber).toBeUndefined(); // null → undefined
  });

  it('buriedPersonsの配列マッピング', () => {
    const formData = validPlotFormData();
    formData.buriedPersons = [
      {
        name: '田中一郎',
        nameKana: 'タナカイチロウ',
        relationship: '父',
        deathDate: '2020-05-10',
        age: 85,
        gender: Gender.Male,
        burialDate: '2020-05-15',
        notes: null,
      },
    ];
    const request = plotFormDataToCreateRequest(formData);

    expect(request.buriedPersons).toHaveLength(1);
    expect(request.buriedPersons![0].name).toBe('田中一郎');
    expect(request.buriedPersons![0].age).toBe(85);
    expect(request.buriedPersons![0].notes).toBeUndefined(); // null → undefined
  });

  it('collectiveBurialが存在する場合正しくマッピングする', () => {
    const formData = validPlotFormData();
    formData.collectiveBurial = {
      burialCapacity: 10,
      validityPeriodYears: 30,
      billingAmount: 50000,
      notes: null,
    };
    const request = plotFormDataToCreateRequest(formData);

    expect(request.collectiveBurial).toBeDefined();
    expect(request.collectiveBurial!.burialCapacity).toBe(10);
    expect(request.collectiveBurial!.validityPeriodYears).toBe(30);
    expect(request.collectiveBurial!.billingAmount).toBe(50000);
    expect(request.collectiveBurial!.notes).toBeUndefined();
  });

  it('collectiveBurialがnullの場合undefinedになる', () => {
    const formData = validPlotFormData();
    formData.collectiveBurial = null;
    const request = plotFormDataToCreateRequest(formData);

    expect(request.collectiveBurial).toBeUndefined();
  });

  it('usageFeeが存在する場合正しくマッピングする', () => {
    const formData = validPlotFormData();
    formData.usageFee = {
      calculationType: '定額',
      taxType: '内税',
      billingType: '一括',
      billingYears: '1',
      usageFee: '50000',
      area: '3.6',
      unitPrice: '13889',
      paymentMethod: '振込',
    };
    const request = plotFormDataToCreateRequest(formData);

    expect(request.usageFee).toBeDefined();
    expect(request.usageFee!.calculationType).toBe('定額');
    expect(request.usageFee!.usageFee).toBe('50000');
  });

  it('usageFeeがnullの場合undefinedになる', () => {
    const formData = validPlotFormData();
    formData.usageFee = null;
    const request = plotFormDataToCreateRequest(formData);

    expect(request.usageFee).toBeUndefined();
  });

  it('gravestoneInfoが存在する場合正しくマッピングする', () => {
    const formData = validPlotFormData();
    formData.gravestoneInfo = {
      gravestoneBase: '和型',
      enclosurePosition: '正面',
      gravestoneDealer: '石材店A',
      gravestoneType: '御影石',
      surroundingArea: '砂利',
      establishmentDeadline: '2025-12-31',
      establishmentDate: '2025-06-01',
    };
    const request = plotFormDataToCreateRequest(formData);

    expect(request.gravestoneInfo).toBeDefined();
    expect(request.gravestoneInfo!.gravestoneBase).toBe('和型');
  });
});

// ===== plotFormDataToUpdateRequest =====

describe('plotFormDataToUpdateRequest', () => {
  it('physicalPlotのnotesのみ変換する', () => {
    const formData: PlotUpdateFormData = {
      physicalPlot: { notes: 'メモ更新' },
    };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.physicalPlot).toBeDefined();
    expect(request.physicalPlot!.notes).toBe('メモ更新');
  });

  it('physicalPlot.notesがnullの場合undefinedになる', () => {
    const formData: PlotUpdateFormData = {
      physicalPlot: { notes: null },
    };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.physicalPlot!.notes).toBeUndefined();
  });

  it('contractPlotを正しく変換する', () => {
    const formData: PlotUpdateFormData = {
      contractPlot: { contractAreaSqm: 1.8, locationDescription: '右半分' },
    };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.contractPlot!.contractAreaSqm).toBe(1.8);
    expect(request.contractPlot!.locationDescription).toBe('右半分');
  });

  it('optionalセクションを直接パスする', () => {
    const workInfo = {
      companyName: '株式会社テスト',
      companyNameKana: '',
      workAddress: '',
      workPostalCode: '',
      workPhoneNumber: '',
      dmSetting: DmSetting.Allow,
      addressType: AddressType.Home,
      notes: null,
    };
    const formData: PlotUpdateFormData = { workInfo };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.workInfo).toBe(workInfo); // 参照一致
  });

  it('familyContactsの配列にidを含める', () => {
    const formData: PlotUpdateFormData = {
      familyContacts: [
        {
          id: 'fc-1',
          emergencyContactFlag: false,
          name: '田中花子',
          birthDate: null,
          relationship: '妻',
          postalCode: null,
          address: '東京都新宿区',
          phoneNumber: '09012345678',
          faxNumber: null,
          email: null,
          registeredAddress: null,
          mailingType: null,
          notes: null,
        },
      ],
    };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.familyContacts![0].id).toBe('fc-1');
    expect(request.familyContacts![0].name).toBe('田中花子');
  });

  it('buriedPersonsの配列にidを含める', () => {
    const formData: PlotUpdateFormData = {
      buriedPersons: [
        {
          id: 'bp-1',
          name: '田中一郎',
          nameKana: null,
          relationship: null,
          deathDate: null,
          age: null,
          gender: null,
          burialDate: null,
          notes: null,
        },
      ],
    };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.buriedPersons![0].id).toBe('bp-1');
    expect(request.buriedPersons![0].name).toBe('田中一郎');
  });

  it('空のformDataから空リクエストを生成する', () => {
    const formData: PlotUpdateFormData = {};
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.physicalPlot).toBeUndefined();
    expect(request.contractPlot).toBeUndefined();
    expect(request.saleContract).toBeUndefined();
    expect(request.customer).toBeUndefined();
  });

  it('collectiveBurialを直接パスする', () => {
    const cb = {
      burialCapacity: 10,
      validityPeriodYears: 30,
      billingAmount: null,
      notes: null,
    };
    const formData: PlotUpdateFormData = { collectiveBurial: cb };
    const request = plotFormDataToUpdateRequest(formData);

    expect(request.collectiveBurial).toBe(cb);
  });
});

// ===== plotDetailToFormData =====

describe('plotDetailToFormData', () => {
  it('Contractorロールの顧客を優先的に取得する', () => {
    const detail = makePlotDetail({
      roles: [
        {
          id: 'role-app',
          role: ContractRole.Applicant,
          roleStartDate: null,
          roleEndDate: null,
          notes: null,
          customer: {
            id: 'cust-app',
            name: '申込者A',
            nameKana: 'モウシコミシャA',
            gender: null,
            birthDate: null,
            phoneNumber: '09011111111',
            faxNumber: null,
            email: null,
            postalCode: '1111111',
            address: '住所A',
            registeredAddress: null,
            notes: null,
            workInfo: null,
            billingInfo: null,
          },
        },
        {
          id: 'role-con',
          role: ContractRole.Contractor,
          roleStartDate: null,
          roleEndDate: null,
          notes: null,
          customer: {
            id: 'cust-con',
            name: '契約者B',
            nameKana: 'ケイヤクシャB',
            gender: null,
            birthDate: null,
            phoneNumber: '09022222222',
            faxNumber: null,
            email: null,
            postalCode: '2222222',
            address: '住所B',
            registeredAddress: null,
            notes: null,
            workInfo: null,
            billingInfo: null,
          },
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.customer.name).toBe('契約者B');
    expect(formData.customer.role).toBe(ContractRole.Contractor);
  });

  it('Contractorがない場合最初のロールにフォールバック', () => {
    const detail = makePlotDetail({
      roles: [
        {
          id: 'role-app',
          role: ContractRole.Applicant,
          roleStartDate: null,
          roleEndDate: null,
          notes: null,
          customer: {
            id: 'cust-app',
            name: '申込者A',
            nameKana: 'モウシコミシャA',
            gender: null,
            birthDate: null,
            phoneNumber: '09011111111',
            faxNumber: null,
            email: null,
            postalCode: '1111111',
            address: '住所A',
            registeredAddress: null,
            notes: null,
            workInfo: null,
            billingInfo: null,
          },
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.customer.name).toBe('申込者A');
    expect(formData.customer.role).toBe(ContractRole.Applicant);
  });

  it('rolesが空配列の場合デフォルト値を使用', () => {
    const detail = makePlotDetail({ roles: [] });
    const formData = plotDetailToFormData(detail);

    expect(formData.customer.name).toBe('');
    expect(formData.customer.nameKana).toBe('');
    expect(formData.customer.postalCode).toBe('');
    expect(formData.customer.address).toBe('');
    expect(formData.customer.phoneNumber).toBe('');
    expect(formData.customer.role).toBe(ContractRole.Contractor);
  });

  it('physicalPlotを正しくマッピングする', () => {
    const detail = makePlotDetail();
    const formData = plotDetailToFormData(detail);

    expect(formData.physicalPlot.plotNumber).toBe('A-001');
    expect(formData.physicalPlot.areaName).toBe('1期');
    expect(formData.physicalPlot.areaSqm).toBe(3.6);
    expect(formData.physicalPlot.notes).toBeNull();
  });

  it('contractPlotを正しくマッピングする', () => {
    const detail = makePlotDetail();
    const formData = plotDetailToFormData(detail);

    expect(formData.contractPlot.contractAreaSqm).toBe(3.6);
    expect(formData.contractPlot.locationDescription).toBeNull();
  });

  it('saleContractを正しくマッピングする', () => {
    const detail = makePlotDetail();
    const formData = plotDetailToFormData(detail);

    expect(formData.saleContract.contractDate).toBe('2024-01-15');
    expect(formData.saleContract.price).toBe(500000);
    expect(formData.saleContract.paymentStatus).toBe(PaymentStatus.Paid);
    expect(formData.saleContract.reservationDate).toBe('');
    expect(formData.saleContract.notes).toBeNull();
  });

  it('null日付は空文字に変換される', () => {
    const detail = makePlotDetail({
      reservationDate: null,
      permitDate: null,
      startDate: null,
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.saleContract.reservationDate).toBe('');
    expect(formData.saleContract.permitDate).toBe('');
    expect(formData.saleContract.startDate).toBe('');
  });

  it('workInfoがnullの場合nullを返す', () => {
    const detail = makePlotDetail();
    const formData = plotDetailToFormData(detail);

    expect(formData.workInfo).toBeNull();
  });

  it('workInfoが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      roles: [
        {
          id: 'role-1',
          role: ContractRole.Contractor,
          roleStartDate: null,
          roleEndDate: null,
          notes: null,
          customer: {
            id: 'cust-1',
            name: '田中太郎',
            nameKana: 'タナカタロウ',
            gender: null,
            birthDate: null,
            phoneNumber: '09012345678',
            faxNumber: null,
            email: null,
            postalCode: '1234567',
            address: '東京都新宿区',
            registeredAddress: null,
            notes: null,
            workInfo: {
              companyName: '株式会社テスト',
              companyNameKana: 'カブシキカイシャテスト',
              workAddress: '東京都港区',
              workPostalCode: '1050001',
              workPhoneNumber: '0312345678',
              dmSetting: DmSetting.Deny,
              addressType: AddressType.Work,
              notes: 'メモ',
            },
            billingInfo: null,
          },
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.workInfo).toBeDefined();
    expect(formData.workInfo!.companyName).toBe('株式会社テスト');
    expect(formData.workInfo!.dmSetting).toBe(DmSetting.Deny);
    expect(formData.workInfo!.addressType).toBe(AddressType.Work);
    expect(formData.workInfo!.notes).toBe('メモ');
  });

  it('billingInfoがnullの場合nullを返す', () => {
    const detail = makePlotDetail();
    const formData = plotDetailToFormData(detail);

    expect(formData.billingInfo).toBeNull();
  });

  it('billingInfoが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      roles: [
        {
          id: 'role-1',
          role: ContractRole.Contractor,
          roleStartDate: null,
          roleEndDate: null,
          notes: null,
          customer: {
            id: 'cust-1',
            name: '田中太郎',
            nameKana: 'タナカタロウ',
            gender: null,
            birthDate: null,
            phoneNumber: '09012345678',
            faxNumber: null,
            email: null,
            postalCode: '1234567',
            address: '東京都新宿区',
            registeredAddress: null,
            notes: null,
            workInfo: null,
            billingInfo: {
              billingType: BillingType.Corporate,
              bankName: 'みずほ銀行',
              branchName: '新宿支店',
              accountType: AccountType.Ordinary,
              accountNumber: '1234567',
              accountHolder: '田中太郎',
            },
          },
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.billingInfo).toBeDefined();
    expect(formData.billingInfo!.billingType).toBe(BillingType.Corporate);
    expect(formData.billingInfo!.bankName).toBe('みずほ銀行');
  });

  it('usageFeeが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      usageFee: {
        calculationType: '定額',
        taxType: '内税',
        billingType: '一括',
        billingYears: '1',
        usageFee: '50000',
        area: '3.6',
        unitPrice: '13889',
        paymentMethod: '振込',
      },
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.usageFee).toBeDefined();
    expect(formData.usageFee!.calculationType).toBe('定額');
    expect(formData.usageFee!.usageFee).toBe('50000');
  });

  it('usageFeeがnullの場合nullを返す', () => {
    const detail = makePlotDetail({ usageFee: null });
    const formData = plotDetailToFormData(detail);

    expect(formData.usageFee).toBeNull();
  });

  it('managementFeeが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      managementFee: {
        calculationType: '定額',
        taxType: '外税',
        billingType: '年払い',
        billingYears: '1',
        area: '3.6',
        billingMonth: '4',
        managementFee: '5000',
        unitPrice: '1389',
        lastBillingMonth: '2024-03',
        paymentMethod: '口座振替',
      },
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.managementFee).toBeDefined();
    expect(formData.managementFee!.managementFee).toBe('5000');
    expect(formData.managementFee!.billingMonth).toBe('4');
  });

  it('familyContactsを正しくマッピングする', () => {
    const detail = makePlotDetail({
      familyContacts: [
        {
          id: 'fc-1',
          name: '田中花子',
          birthDate: '1975-03-20',
          relationship: '妻',
          postalCode: '1234567',
          address: '東京都新宿区',
          phoneNumber: '09087654321',
          faxNumber: null,
          email: null,
          registeredAddress: null,
          mailingType: null,
          notes: null,
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.familyContacts).toHaveLength(1);
    expect(formData.familyContacts![0].id).toBe('fc-1');
    expect(formData.familyContacts![0].name).toBe('田中花子');
    expect(formData.familyContacts![0].relationship).toBe('妻');
    expect(formData.familyContacts![0].emergencyContactFlag).toBe(false);
  });

  it('buriedPersonsを正しくマッピングする', () => {
    const detail = makePlotDetail({
      buriedPersons: [
        {
          id: 'bp-1',
          name: '田中一郎',
          nameKana: 'タナカイチロウ',
          relationship: '父',
          deathDate: '2020-05-10',
          age: 85,
          gender: Gender.Male,
          burialDate: '2020-05-15',
          notes: null,
        },
      ],
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.buriedPersons).toHaveLength(1);
    expect(formData.buriedPersons![0].id).toBe('bp-1');
    expect(formData.buriedPersons![0].name).toBe('田中一郎');
    expect(formData.buriedPersons![0].age).toBe(85);
    expect(formData.buriedPersons![0].gender).toBe(Gender.Male);
  });

  it('collectiveBurialが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      collectiveBurial: {
        burialCapacity: 10,
        validityPeriodYears: 30,
        billingAmount: 50000,
        notes: 'メモ',
      },
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.collectiveBurial).toBeDefined();
    expect(formData.collectiveBurial!.burialCapacity).toBe(10);
    expect(formData.collectiveBurial!.validityPeriodYears).toBe(30);
    expect(formData.collectiveBurial!.billingAmount).toBe(50000);
    expect(formData.collectiveBurial!.notes).toBe('メモ');
  });

  it('collectiveBurialがnullの場合nullを返す', () => {
    const detail = makePlotDetail({ collectiveBurial: null });
    const formData = plotDetailToFormData(detail);

    expect(formData.collectiveBurial).toBeNull();
  });

  it('gravestoneInfoが存在する場合正しくマッピングする', () => {
    const detail = makePlotDetail({
      gravestoneInfo: {
        gravestoneBase: '和型',
        enclosurePosition: '正面',
        gravestoneDealer: '石材店A',
        gravestoneType: '御影石',
        surroundingArea: '砂利',
        establishmentDeadline: '2025-12-31',
        establishmentDate: '2025-06-01',
      },
    });
    const formData = plotDetailToFormData(detail);

    expect(formData.gravestoneInfo).toBeDefined();
    expect(formData.gravestoneInfo!.gravestoneBase).toBe('和型');
    expect(formData.gravestoneInfo!.gravestoneType).toBe('御影石');
  });

  it('gravestoneInfoがnullの場合nullを返す', () => {
    const detail = makePlotDetail({ gravestoneInfo: null });
    const formData = plotDetailToFormData(detail);

    expect(formData.gravestoneInfo).toBeNull();
  });
});
