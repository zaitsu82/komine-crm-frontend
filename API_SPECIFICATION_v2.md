# 小峰霊園CRM API 仕様書 v2.0

## 概要

Komine Cemetery CRM システムの REST API 仕様書です。この API は霊園顧客管理システムのバックエンドサービスを提供します。

### 基本情報

- **Base URL**: `https://api.komine-crm.com/api/v1` (本番環境)
- **Dev URL**: `http://localhost:3001/api/v1` (開発環境)
- **認証方式**: Supabase JWT Bearer Token
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8

## 認証

### Supabase Auth を使用した認証

```http
POST /api/v1/auth/login
```

認証が必要なエンドポイントでは、リクエストヘッダーに Supabase JWT トークンを含める必要があります。

```http
Authorization: Bearer <supabase_jwt_token>
```

### Row Level Security (RLS)

Supabase の Row Level Security を使用して、テーブルレベルでのアクセス制御を実施します。

## 共通レスポンス形式

### 成功レスポンス

```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### エラーレスポンス

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}
```

### エラーコード

| コード | HTTP Status | 説明 |
|--------|-------------|------|
| `VALIDATION_ERROR` | 400 | 入力値検証エラー |
| `UNAUTHORIZED` | 401 | 認証失敗 |
| `FORBIDDEN` | 403 | 権限不足 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `CONFLICT` | 409 | データ競合エラー |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

## API エンドポイント一覧

### 認証系 (Authentication)
- `POST /auth/login` - ログイン
- `POST /auth/logout` - ログアウト
- `POST /auth/signup` - 新規ユーザー登録
- `PUT /auth/password` - パスワード更新
- `POST /auth/reset-password` - パスワードリセット要求
- `POST /auth/refresh` - トークンリフレッシュ
- `GET /auth/me` - 現在のユーザー情報取得

### 顧客管理 (Customers)
- `GET /customers` - 顧客一覧取得
- `GET /customers/:id` - 顧客詳細取得
- `GET /customers/search` - 顧客検索（あいうえお順フィルタ対応）
- `GET /customers/code/:customerCode` - 顧客コードで検索
- `POST /customers` - 顧客登録
- `PUT /customers/:id` - 顧客情報更新
- `DELETE /customers/:id` - 顧客削除（論理削除）
- `GET /customers/:id/history` - 顧客変更履歴取得

### 合祀管理 (Collective Burials)
- `GET /collective-burials` - 合祀申請一覧取得
- `GET /collective-burials/:id` - 合祀申請詳細取得
- `GET /collective-burials/search` - 合祀申請検索
- `POST /collective-burials` - 合祀申請登録
- `PUT /collective-burials/:id` - 合祀申請更新
- `DELETE /collective-burials/:id` - 合祀申請削除
- `PUT /collective-burials/:id/status` - 合祀申請ステータス更新

### 家族連絡先管理 (Family Contacts)
- `GET /customers/:customerId/family-contacts` - 家族連絡先一覧取得
- `POST /customers/:customerId/family-contacts` - 家族連絡先登録
- `PUT /family-contacts/:id` - 家族連絡先更新
- `DELETE /family-contacts/:id` - 家族連絡先削除

### 埋葬者管理 (Buried Persons)
- `GET /customers/:customerId/buried-persons` - 埋葬者一覧取得
- `GET /buried-persons/search` - 埋葬者検索
- `POST /customers/:customerId/buried-persons` - 埋葬者登録
- `PUT /buried-persons/:id` - 埋葬者更新
- `DELETE /buried-persons/:id` - 埋葬者削除

### 区画管理 (Plot Management)
- `GET /plots` - 区画一覧取得
- `GET /plots/:plotNumber` - 区画詳細取得
- `GET /plots/availability` - 空き区画検索
- `PUT /plots/:plotNumber/status` - 区画ステータス更新

### 請求管理 (Billing)
- `GET /customers/:customerId/billing` - 顧客請求情報取得
- `POST /billing/calculate` - 請求金額計算
- `POST /billing/generate` - 請求書生成
- `GET /billing/overdue` - 滞納一覧取得

### マスタデータ管理 (Masters)
- `GET /masters/usage-status` - 利用状況マスタ
- `GET /masters/gender` - 性別マスタ
- `GET /masters/payment-method` - 支払方法マスタ
- `GET /masters/tax-type` - 税区分マスタ
- `GET /masters/calc-type` - 計算区分マスタ
- `GET /masters/billing-type` - 請求区分マスタ
- `GET /masters/account-type` - 口座科目マスタ
- `GET /masters/relationship` - 続柄マスタ
- `GET /masters/burial-type` - 合祀種別マスタ
- `GET /masters/document-type` - 書類種別マスタ
- `GET /masters/religion` - 宗派マスタ

## 主要なTypeScript型定義

```typescript
// ===== 顧客管理型定義 =====

// 顧客基本情報
export interface Customer {
  id: string;
  
  // 顧客基本情報
  customerCode: string; // 顧客コード（例：A-56）*必須
  plotNumber?: string; // 区画番号
  section?: string; // 区域（東区、西区など）
  
  // 申込者情報
  applicantInfo?: ApplicantInfo;
  
  // 契約者情報
  reservationDate: Date | null; // 予約日
  acceptanceNumber?: string; // 承諾書番号
  permitDate: Date | null; // 許可日
  startDate: Date | null; // 開始年月日
  name: string; // 氏名 *必須
  nameKana: string; // 振り仮名（ひらがな）*必須
  birthDate: Date | null; // 生年月日
  gender: 'male' | 'female' | undefined; // 性別 *必須
  phoneNumber: string; // 電話番号 *必須
  faxNumber?: string; // ファックス
  email?: string; // メール
  address: string; // 住所 *必須
  registeredAddress?: string; // 本籍地住所
  
  // 料金情報
  usageFee?: UsageFeeInfo;
  managementFee?: ManagementFeeInfo;
  
  // 墓石情報
  gravestoneInfo?: GravestoneInfo;
  
  // 関連情報
  familyContacts?: FamilyContact[];
  buriedPersons?: BuriedPerson[];
  collectiveBurialInfo?: CollectiveBurialInfo[];
  
  // 勤務先・連絡情報
  workInfo?: WorkInfo;
  
  // 請求情報
  billingInfo?: BillingInfo;
  
  // 区画情報
  plotInfo?: PlotInfo | null;
  
  // システム情報
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive'; // 契約ステータス
}

// 申込者情報
interface ApplicantInfo {
  applicationDate: Date | null; // 申込日
  staffName: string; // 担当者氏名
  name: string; // 氏名
  nameKana: string; // 振り仮名
  postalCode: string; // 郵便番号
  phoneNumber: string; // 電話番号
  address: string; // 住所
}

// 使用料情報
interface UsageFeeInfo {
  calculationType: string; // 計算区分
  taxType: string; // 税区分
  billingType: string; // 請求区分
  billingYears: string; // 請求年数
  area: string; // 面積（例：10㎡）
  unitPrice: string; // 単価
  usageFee: string; // 使用料
  paymentMethod: string; // 支払い方法
}

// 管理料情報
interface ManagementFeeInfo {
  calculationType: string; // 計算区分
  taxType: string; // 税区分
  billingType: string; // 請求区分
  billingYears: string; // 請求年数
  area: string; // 面積
  billingMonth: string; // 請求月（1-12）
  managementFee: string; // 管理料
  unitPrice: string; // 単価
  lastBillingMonth: string; // 最終請求月（----年--月）
  paymentMethod: string; // 支払方法
}

// 墓石情報
interface GravestoneInfo {
  gravestoneBase: string; // 墓石台
  enclosurePosition: string; // 包囲位置
  gravestoneDealer: string; // 墓石取扱い
  gravestoneType: string; // 墓石タイプ
  surroundingArea: string; // 周辺設備
  establishmentDeadline: Date | null; // 設立期限
  establishmentDate: Date | null; // 設立日
}

// 家族連絡先
interface FamilyContact {
  id: string;
  customerId: string; // 顧客ID（外部キー）
  name: string; // 氏名
  birthDate: Date | null; // 生年月日
  relationship: string; // 続柄
  address: string; // 住所
  phoneNumber: string; // 電話番号
  faxNumber?: string; // ファックス
  email?: string; // イーメール
  registeredAddress?: string; // 本籍住所
  mailingType: 'home' | 'work' | 'other' | undefined; // 送付先区分
  companyName?: string; // 勤務先名称
  companyNameKana?: string; // 勤務先かな
  companyAddress?: string; // 勤務先住所
  companyPhone?: string; // 勤務先電話番号
  notes?: string; // 備考
  createdAt: Date;
  updatedAt: Date;
}

// 埋葬者情報
interface BuriedPerson {
  id: string;
  customerId: string; // 顧客ID（外部キー）
  name: string; // 氏名
  nameKana?: string; // 氏名カナ
  relationship?: string; // 続柄
  deathDate?: Date | null; // 死亡日
  age?: number; // 年齢
  gender: 'male' | 'female' | undefined; // 性別
  burialDate?: Date | null; // 埋葬日
  memo?: string; // メモ
  createdAt: Date;
  updatedAt: Date;
}

// 勤務先情報
interface WorkInfo {
  companyName: string; // 勤務先名称
  companyNameKana: string; // 勤務先仮名
  workAddress: string; // 就職先住所
  workPostalCode: string; // 郵便番号
  workPhoneNumber: string; // 電話番号
  dmSetting: 'allow' | 'deny' | 'limited'; // DM設定
  addressType: 'home' | 'work' | 'other'; // 宛先区分
  notes: string; // 備考
}

// 請求情報
interface BillingInfo {
  billingType: 'individual' | 'corporate' | 'bank_transfer'; // 請求種別
  bankName: string; // 銀行名称
  branchName: string; // 支店名称
  accountType: 'ordinary' | 'current' | 'savings'; // 口座科目
  accountNumber: string; // 記号番号
  accountHolder: string; // 口座名義
}

// 区画情報
interface PlotInfo {
  plotNumber: string; // 区画番号
  section: string; // 区域
  usage: 'in_use' | 'available' | 'reserved'; // 利用状況
  size: string; // 面積
  price: string; // 金額
  contractDate: Date | null; // 契約日
}

// ===== 合祀管理型定義 =====

// 合祀種別
export type CollectiveBurialType = 'family' | 'relative' | 'other';

// 合祀ステータス
export type CollectiveBurialStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

// 合祀申請
export interface CollectiveBurialApplication {
  id: string;
  applicationDate: Date; // 申込日
  desiredDate: Date | null; // 希望日
  burialType: CollectiveBurialType; // 合祀種別
  status: CollectiveBurialStatus; // ステータス
  mainRepresentative: string; // 主たる代表者
  
  // 申込者情報
  applicant: {
    name: string; // 氏名
    nameKana: string; // 氏名カナ
    phone: string; // 電話番号
    email?: string; // メール
    postalCode?: string; // 郵便番号
    address: string; // 住所
  };
  
  // 区画情報
  plot: {
    section: string; // 区域
    number: string; // 区画番号
  };
  
  // 合祀対象者一覧
  persons: CollectiveBurialPerson[];
  
  // 儀式情報
  ceremonies: CollectiveBurialCeremony[];
  
  // 書類情報
  documents: CollectiveBurialDocument[];
  
  // 料金情報
  payment: CollectiveBurialPaymentInfo;
  
  // 特別な要望
  specialRequests?: string;
  
  // システム情報
  createdAt: Date;
  updatedAt: Date;
}

// 合祀対象者
interface CollectiveBurialPerson {
  id: string;
  name: string; // 氏名
  nameKana: string; // 氏名カナ
  relationship: string; // 続柄
  deathDate: Date | null; // 死亡日
  age?: number | null; // 享年
  gender?: 'male' | 'female' | ''; // 性別
  originalPlotNumber?: string; // 元の墓所・区画番号
  certificateNumber?: string; // 改葬許可証番号
  memo?: string; // 備考
}

// 合祀儀式
interface CollectiveBurialCeremony {
  id: string;
  date: Date | null; // 実施日
  officiant?: string; // 導師・執行者
  religion?: string; // 宗派
  participants?: number | null; // 参列者数
  location?: string; // 実施場所
  memo?: string; // 備考
}

// 合祀書類
interface CollectiveBurialDocument {
  id: string;
  type: 'permit' | 'certificate' | 'agreement' | 'other'; // 書類種別
  name: string; // 書類名
  issuedDate: Date | null; // 発行日
  memo?: string; // 備考
}

// 合祀料金情報
interface CollectiveBurialPaymentInfo {
  totalFee?: number | null; // 合祀料金総額
  depositAmount?: number | null; // 入金額
  paymentMethod?: string | null; // 支払方法
  paymentDueDate?: Date | null; // 支払期限
}

// ===== ページネーション型定義 =====

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

// ===== 検索条件型定義 =====

interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string; // 氏名、氏名カナ、顧客コード、電話番号、住所で検索
  aiueoTab?: string; // あいうえお順フィルタ（'全', 'あ', 'か', 'さ', ...）
  status?: 'active' | 'inactive'; // 契約ステータス
  plotUsage?: 'in_use' | 'available' | 'reserved'; // 区画利用状況
  section?: string; // 区域
}

interface CollectiveBurialSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CollectiveBurialStatus;
  burialType?: CollectiveBurialType;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

// ===== ステータス表示型定義 =====

export type ContractStatus = 'active' | 'attention' | 'overdue';

export interface CustomerStatusDisplay {
  status: ContractStatus;
  label: string;
  icon: string;
  className: string;
}
```

## API エンドポイント詳細

### 1. 認証系 API

#### 1.1 ログイン

```http
POST /api/v1/auth/login
```

**リクエスト**:
```typescript
{
  email: string;
  password: string;
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      createdAt: Date;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    };
  };
}
```

#### 1.2 ログアウト

```http
POST /api/v1/auth/logout
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: {
    message: "ログアウトしました";
  };
}
```

### 2. 顧客管理 API

#### 2.1 顧客一覧取得

```http
GET /api/v1/customers
```

**認証**: 必要

**クエリパラメータ**:
```typescript
{
  page?: number; // デフォルト: 1
  limit?: number; // デフォルト: 50
  search?: string; // 検索キーワード
  aiueoTab?: string; // あいうえお順フィルタ
  status?: 'active' | 'inactive';
  section?: string;
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: Customer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### 2.2 顧客詳細取得

```http
GET /api/v1/customers/:id
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: Customer; // 家族連絡先、埋葬者、合祀情報など全て含む
}
```

#### 2.3 顧客検索（あいうえお順対応）

```http
GET /api/v1/customers/search
```

**認証**: 必要

**クエリパラメータ**: CustomerSearchParams

**レスポンス**:
```typescript
{
  success: true;
  data: Customer[];
  meta: PaginationInfo;
}
```

**実装例**:
```typescript
// あいうえお順フィルタリング
GET /api/v1/customers/search?aiueoTab=あ&page=1&limit=50

// 顧客コード検索
GET /api/v1/customers/search?search=A-56

// 名前検索
GET /api/v1/customers/search?search=山田太郎

// 電話番号検索
GET /api/v1/customers/search?search=090-1234-5678
```

#### 2.4 顧客コードで検索

```http
GET /api/v1/customers/code/:customerCode
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: Customer;
}
```

#### 2.5 顧客登録

```http
POST /api/v1/customers
```

**認証**: 必要

**リクエスト**: Customer（id, createdAt, updatedAt を除く）

**レスポンス**:
```typescript
{
  success: true;
  data: Customer;
}
```

**バリデーション**:
- customerCode: 必須、一意
- name: 必須
- nameKana: 必須、ひらがなのみ
- gender: 必須（'male' | 'female'）
- phoneNumber: 必須、日本の電話番号形式
- address: 必須
- email: メール形式（任意）

#### 2.6 顧客情報更新

```http
PUT /api/v1/customers/:id
```

**認証**: 必要

**リクエスト**: Partial<Customer>

**レスポンス**:
```typescript
{
  success: true;
  data: Customer;
}
```

#### 2.7 顧客削除（論理削除）

```http
DELETE /api/v1/customers/:id
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: {
    message: "顧客を削除しました";
  };
}
```

### 3. 合祀管理 API

#### 3.1 合祀申請一覧取得

```http
GET /api/v1/collective-burials
```

**認証**: 必要

**クエリパラメータ**: CollectiveBurialSearchParams

**レスポンス**:
```typescript
{
  success: true;
  data: CollectiveBurialApplication[];
  meta: PaginationInfo;
}
```

#### 3.2 合祀申請詳細取得

```http
GET /api/v1/collective-burials/:id
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: CollectiveBurialApplication;
}
```

#### 3.3 合祀申請登録

```http
POST /api/v1/collective-burials
```

**認証**: 必要

**リクエスト**: CollectiveBurialApplication（id, createdAt, updatedAt を除く）

**レスポンス**:
```typescript
{
  success: true;
  data: CollectiveBurialApplication;
}
```

**バリデーション**:
- applicationDate: 必須
- burialType: 必須（'family' | 'relative' | 'other'）
- mainRepresentative: 必須
- applicant.name: 必須
- applicant.nameKana: 必須、ひらがなのみ
- applicant.phone: 必須
- applicant.address: 必須
- plot.section: 必須
- plot.number: 必須
- persons: 最低1名必須

#### 3.4 合祀申請更新

```http
PUT /api/v1/collective-burials/:id
```

**認証**: 必要

**リクエスト**: Partial<CollectiveBurialApplication>

**レスポンス**:
```typescript
{
  success: true;
  data: CollectiveBurialApplication;
}
```

#### 3.5 合祀申請ステータス更新

```http
PUT /api/v1/collective-burials/:id/status
```

**認証**: 必要

**リクエスト**:
```typescript
{
  status: CollectiveBurialStatus;
  note?: string; // ステータス変更理由
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: CollectiveBurialApplication;
}
```

### 4. 家族連絡先 API

#### 4.1 家族連絡先一覧取得

```http
GET /api/v1/customers/:customerId/family-contacts
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: FamilyContact[];
}
```

#### 4.2 家族連絡先登録

```http
POST /api/v1/customers/:customerId/family-contacts
```

**認証**: 必要

**リクエスト**: FamilyContact（id, customerId, createdAt, updatedAt を除く）

**レスポンス**:
```typescript
{
  success: true;
  data: FamilyContact;
}
```

#### 4.3 家族連絡先更新

```http
PUT /api/v1/family-contacts/:id
```

**認証**: 必要

**リクエスト**: Partial<FamilyContact>

**レスポンス**:
```typescript
{
  success: true;
  data: FamilyContact;
}
```

#### 4.4 家族連絡先削除

```http
DELETE /api/v1/family-contacts/:id
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: {
    message: "家族連絡先を削除しました";
  };
}
```

### 5. 埋葬者管理 API

#### 5.1 埋葬者一覧取得

```http
GET /api/v1/customers/:customerId/buried-persons
```

**認証**: 必要

**レスポンス**:
```typescript
{
  success: true;
  data: BuriedPerson[];
}
```

#### 5.2 埋葬者検索

```http
GET /api/v1/buried-persons/search
```

**認証**: 必要

**クエリパラメータ**:
```typescript
{
  search?: string; // 氏名、氏名カナで検索
  deathDateFrom?: string; // YYYY-MM-DD
  deathDateTo?: string; // YYYY-MM-DD
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: BuriedPerson[];
}
```

#### 5.3 埋葬者登録

```http
POST /api/v1/customers/:customerId/buried-persons
```

**認証**: 必要

**リクエスト**: BuriedPerson（id, customerId, createdAt, updatedAt を除く）

**レスポンス**:
```typescript
{
  success: true;
  data: BuriedPerson;
}
```

### 6. 区画管理 API

#### 6.1 区画一覧取得

```http
GET /api/v1/plots
```

**認証**: 必要

**クエリパラメータ**:
```typescript
{
  section?: string; // 区域フィルタ
  usage?: 'in_use' | 'available' | 'reserved'; // 利用状況フィルタ
  page?: number;
  limit?: number;
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: PlotInfo[];
  meta: PaginationInfo;
}
```

#### 6.2 空き区画検索

```http
GET /api/v1/plots/availability
```

**認証**: 必要

**クエリパラメータ**:
```typescript
{
  section?: string; // 区域
  minSize?: string; // 最小面積
  maxPrice?: number; // 最大価格
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: PlotInfo[];
}
```

### 7. マスタデータ API

#### 7.1 マスタデータ取得（汎用）

```http
GET /api/v1/masters/:masterType
```

**認証**: 必要

**パスパラメータ**:
- `masterType`: マスタデータ種別

**利用可能なマスタ種別**:
- `usage-status` - 利用状況
- `gender` - 性別
- `payment-method` - 支払方法
- `tax-type` - 税区分
- `calc-type` - 計算区分
- `billing-type` - 請求区分
- `account-type` - 口座科目
- `relationship` - 続柄
- `burial-type` - 合祀種別
- `document-type` - 書類種別
- `religion` - 宗派
- `mailing-type` - 送付先区分
- `dm-setting` - DM設定

**レスポンス**:
```typescript
{
  success: true;
  data: Array<{
    code: string; // 業務キー
    name: string; // 表示名
    description?: string; // 説明
    sortOrder: number; // 表示順序
  }>;
}
```

## 業務ルール・制約

### 顧客管理の業務ルール

1. **顧客コードの一意性**
   - 顧客コード（customerCode）は霊園内で一意である必要がある
   - 形式: `[A-Z]-[0-9]{1,4}` （例: A-56, B-123）

2. **あいうえお順フィルタ**
   - 氏名カナ（nameKana）の先頭文字でフィルタリング
   - タブ: 全、あ、か、さ、た、な、は、ま、や、ら、わ、その他

3. **契約ステータス判定**
   - `active`: 通常の契約中
   - `attention`: 1年以上更新なし（滞納注意）
   - `overdue`: 2年以上更新なし（要対応）

4. **データ更新**
   - 更新時は `updatedAt` を自動更新
   - 重要な変更は履歴として記録（将来実装予定）

### 合祀管理の業務ルール

1. **合祀対象者**
   - 最低1名の合祀対象者が必要
   - 各対象者には氏名、氏名カナ、続柄、死亡日が必須

2. **ステータス遷移**
   - `pending` → `scheduled` → `completed`
   - `cancelled` への遷移は任意のステータスから可能

3. **書類管理**
   - 改葬許可証番号の記録
   - 書類種別に応じた必須情報の管理

### データバリデーション

#### 電話番号形式
- 固定電話: `0[0-9]{1,4}-[0-9]{1,4}-[0-9]{4}`
- 携帯電話: `0[789]0-[0-9]{4}-[0-9]{4}`

#### 郵便番号形式
- `[0-9]{3}-[0-9]{4}`

#### メールアドレス
- RFC 5322準拠の標準的なメール形式

#### 氏名カナ
- ひらがなのみ（スペース許可）
- パターン: `/^[ぁ-ん\s]+$/`

## セキュリティ要件

### 認証・認可

1. **Supabase Auth による認証**
   - JWT トークンによる認証
   - 有効期限: 1時間（自動リフレッシュ）

2. **Row Level Security (RLS)**
   - テーブル単位でのアクセス制御
   - ユーザーロールに応じた権限管理

3. **権限レベル**
   - `viewer`: 参照のみ
   - `operator`: 登録・更新
   - `manager`: 削除を含む全操作
   - `admin`: マスタデータ管理

### データ保護

1. **個人情報の暗号化**
   - 通信: HTTPS/TLS 1.3
   - 保存: Supabase の標準暗号化

2. **機微情報の取扱い**
   - 宗教情報: 特に慎重な取扱い
   - 本籍地: アクセスログ記録

3. **監査ログ**
   - 全ての重要操作を記録
   - 誰が・いつ・何を・どうしたかを追跡可能

## パフォーマンス要件

### レスポンス時間目標

- **参照系API**: 200ms以内
- **登録・更新系API**: 500ms以内
- **検索API**: 1秒以内
- **一括処理**: 10秒以内

### スループット

- **同時リクエスト数**: 100件/秒
- **同時ユーザー数**: 50人
- **可用性**: 99.9%以上

### キャッシュ戦略

- マスタデータ: 1時間キャッシュ
- 顧客一覧: 5分キャッシュ
- 詳細情報: キャッシュなし（常に最新データ）

## エラーハンドリング

### バリデーションエラー例

```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR";
    message: "入力値に誤りがあります";
    details: [
      {
        field: "nameKana";
        message: "振り仮名はひらがなで入力してください";
      },
      {
        field: "phoneNumber";
        message: "電話番号の形式が正しくありません";
      }
    ];
  };
}
```

### 認証エラー例

```typescript
{
  success: false;
  error: {
    code: "UNAUTHORIZED";
    message: "認証トークンが無効です";
    details: [];
  };
}
```

### リソース不在エラー例

```typescript
{
  success: false;
  error: {
    code: "NOT_FOUND";
    message: "指定された顧客が見つかりません";
    details: [
      {
        field: "customerId";
        message: "ID: abc-123 の顧客は存在しません";
      }
    ];
  };
}
```

## 開発・テスト情報

### ローカル開発環境

```bash
# Supabase ローカル開発環境起動
npx supabase start

# API サーバーURL
http://localhost:54321

# データベースURL
postgresql://postgres:postgres@localhost:54322/postgres
```

### テストユーザー

開発環境でのテスト用ログイン情報：

| メールアドレス | パスワード | 権限 |
|----------------|------------|------|
| admin@komine-crm.test | Admin@123 | admin |
| manager@komine-crm.test | Manager@123 | manager |
| operator@komine-crm.test | Operator@123 | operator |
| viewer@komine-crm.test | Viewer@123 | viewer |

### サンプルデータ

```bash
# デモデータ投入
npx supabase db seed
```

### APIテスト例

```bash
# ログイン
curl -X POST http://localhost:54321/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -H "apikey: <your-anon-key>" \
  -d '{"email": "operator@komine-crm.test", "password": "Operator@123"}'

# 顧客一覧取得
curl -X GET "http://localhost:54321/rest/v1/customers?limit=50" \
  -H "Authorization: Bearer <access-token>" \
  -H "apikey: <your-anon-key>"

# 顧客検索（あいうえお順）
curl -X GET "http://localhost:54321/rest/v1/customers?name_kana=like.あ*&order=name_kana.asc" \
  -H "Authorization: Bearer <access-token>" \
  -H "apikey: <your-anon-key>"

# 顧客登録
curl -X POST http://localhost:54321/rest/v1/customers \
  -H "Authorization: Bearer <access-token>" \
  -H "apikey: <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_code": "A-999",
    "name": "テスト太郎",
    "name_kana": "てすとたろう",
    "gender": "male",
    "phone_number": "090-1234-5678",
    "address": "東京都渋谷区テスト1-2-3"
  }'
```

## データベーススキーマ参照

### 主要テーブル

1. **customers** - 顧客情報
2. **family_contacts** - 家族連絡先
3. **buried_persons** - 埋葬者情報
4. **collective_burials** - 合祀申請
5. **collective_burial_persons** - 合祀対象者
6. **collective_burial_ceremonies** - 合祀儀式
7. **collective_burial_documents** - 合祀書類
8. **plots** - 区画情報
9. **master_data** - 各種マスタデータ

### リレーション

```
customers (1) ─── (N) family_contacts
customers (1) ─── (N) buried_persons
customers (1) ─── (1) plots

collective_burials (1) ─── (N) collective_burial_persons
collective_burials (1) ─── (N) collective_burial_ceremonies
collective_burials (1) ─── (N) collective_burial_documents
```

## 今後の拡張予定

### フェーズ2（2025年Q2予定）

- [ ] 請求書自動生成API
- [ ] 入金管理API
- [ ] 滞納者一覧・督促状生成
- [ ] メール通知機能

### フェーズ3（2025年Q3予定）

- [ ] 履歴管理・変更追跡
- [ ] データ復元機能
- [ ] 一括インポート・エクスポート
- [ ] レポート生成API

### フェーズ4（2025年Q4予定）

- [ ] モバイルアプリAPI対応
- [ ] リアルタイム通知（WebSocket）
- [ ] AI支援機能（顧客対応提案等）

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-10-03 | 2.0.0 | 現状実装ベースの全面改訂 - 顧客管理、合祀管理、マスタデータ対応 |
| 2024-09-13 | 1.0.0 | 初版作成（墓石管理ベース） |

---

## 📋 この仕様書について

この仕様書は Komine Cemetery CRM システムの現状実装に基づいたAPI仕様を定義しています。Supabase をバックエンドとして、顧客管理・合祀管理を中心とした霊園業務の効率化を実現します。

## 🎯 主な特徴

- **現状実装準拠**: フロントエンドの型定義と完全に整合
- **Supabase 最適化**: Row Level Security・リアルタイム機能対応
- **霊園業務特化**: あいうえお順検索・合祀管理など業界特有機能
- **拡張性**: 将来的な機能追加を見据えた設計

## 🚀 実装状況

- ✅ 認証システム（Supabase Auth）
- ✅ 顧客管理（基本機能）
- ✅ 合祀管理（基本機能）
- ✅ マスタデータ管理
- 🔄 請求管理（計画中）
- 🔄 履歴管理（計画中）
- 🔄 レポート機能（計画中）

**プロジェクト**: Komine Cemetery CRM  
**担当**: フロントエンド開発チーム  
**最終更新**: 2025年10月3日

