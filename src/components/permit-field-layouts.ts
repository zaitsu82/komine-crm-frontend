/**
 * 許可証テンプレート PDF のフィールド座標定義（フロント側コピー）
 *
 * バックエンドの komine-crm-backend/src/documents/templates/permit/fieldLayouts.ts と
 * 同じ座標系・同じフィールド ID を使用する。修正はバック／フロント両方に反映すること。
 *
 * 座標系: PDF の points（原点: 各ページの左下）
 */

export type FieldDirection = 'horizontal' | 'vertical' | 'rotated';
export type FieldAlign = 'left' | 'center' | 'right';

export interface PermitField {
  id: string;
  label: string;
  placeholder?: string;
  pageIndex: number;
  x: number;
  y: number;
  fontSize: number;
  bold?: boolean;
  direction: FieldDirection;
  align?: FieldAlign;
  lineHeight?: number;
  widthPt?: number;
  heightPt?: number;
  hint?: string;
}

export interface PermitPageLayout {
  pageIndex: number;
  label: string;
  previewPng: string;
  widthPt: number;
  heightPt: number;
  previewWidthPx: number;
  previewHeightPx: number;
  fields: PermitField[];
  enabled: boolean;
}

const PAGE_1_FIELDS: PermitField[] = [
  {
    id: 'permitNumber',
    label: '許可番号（第○号）',
    placeholder: '12345',
    pageIndex: 0,
    x: 530,
    y: 340,
    fontSize: 14,
    bold: true,
    direction: 'horizontal',
    align: 'left',
    widthPt: 85,
    heightPt: 18,
  },
  {
    id: 'permitType',
    label: '種別',
    placeholder: '普通墓地',
    pageIndex: 0,
    x: 520,
    y: 295,
    fontSize: 13,
    direction: 'horizontal',
    align: 'left',
    widthPt: 95,
    heightPt: 18,
  },
  {
    id: 'plotNumber',
    label: '区画番号',
    placeholder: 'A-56',
    pageIndex: 0,
    x: 530,
    y: 248,
    fontSize: 13,
    direction: 'horizontal',
    align: 'left',
    widthPt: 85,
    heightPt: 18,
  },
  {
    id: 'area',
    label: '面積（㎡）',
    placeholder: '4.5',
    pageIndex: 0,
    x: 525,
    y: 198,
    fontSize: 13,
    direction: 'horizontal',
    align: 'left',
    widthPt: 95,
    heightPt: 18,
  },
  {
    id: 'issueYear',
    label: '発行 年',
    placeholder: '2026',
    pageIndex: 0,
    x: 450,
    y: 155,
    fontSize: 12,
    direction: 'horizontal',
    align: 'center',
    widthPt: 50,
    heightPt: 16,
  },
  {
    id: 'issueMonth',
    label: '発行 月',
    placeholder: '4',
    pageIndex: 0,
    x: 530,
    y: 155,
    fontSize: 12,
    direction: 'horizontal',
    align: 'center',
    widthPt: 30,
    heightPt: 16,
  },
  {
    id: 'issueDay',
    label: '発行 日',
    placeholder: '23',
    pageIndex: 0,
    x: 590,
    y: 155,
    fontSize: 12,
    direction: 'horizontal',
    align: 'center',
    widthPt: 30,
    heightPt: 16,
  },
  {
    id: 'applicantName',
    label: '使用者名（殿）',
    placeholder: '丸山 千代美',
    pageIndex: 0,
    x: 180,
    y: 345,
    fontSize: 16,
    bold: true,
    direction: 'horizontal',
    align: 'left',
    widthPt: 180,
    heightPt: 22,
  },
  {
    id: 'registeredAddress',
    label: '本籍',
    placeholder: '福岡県北九州市八幡西区小嶺',
    pageIndex: 0,
    x: 140,
    y: 298,
    fontSize: 12,
    direction: 'horizontal',
    align: 'left',
    widthPt: 230,
    heightPt: 18,
  },
  {
    id: 'currentAddress',
    label: '現住所',
    placeholder: '福岡県北九州市八幡西区…',
    pageIndex: 0,
    x: 140,
    y: 248,
    fontSize: 12,
    direction: 'horizontal',
    align: 'left',
    widthPt: 230,
    heightPt: 18,
  },
];

const PAGE_2_FIELDS: PermitField[] = [
  {
    id: 'recipientPostalCode',
    label: '郵便番号',
    placeholder: '807-0081',
    pageIndex: 1,
    x: 230,
    y: 605,
    fontSize: 18,
    direction: 'horizontal',
    align: 'left',
    widthPt: 180,
    heightPt: 24,
  },
  {
    id: 'recipientAddress',
    label: '宛先住所',
    placeholder: '福岡県北九州市八幡西区…',
    pageIndex: 1,
    x: 130,
    y: 480,
    fontSize: 16,
    direction: 'horizontal',
    align: 'left',
    widthPt: 300,
    heightPt: 24,
  },
  {
    id: 'recipientAddress2',
    label: '宛先住所（2行目）',
    placeholder: '',
    pageIndex: 1,
    x: 150,
    y: 445,
    fontSize: 16,
    direction: 'horizontal',
    align: 'left',
    widthPt: 280,
    heightPt: 24,
  },
  {
    id: 'recipientName',
    label: '宛名',
    placeholder: '丸山 千代美 様',
    pageIndex: 1,
    x: 150,
    y: 380,
    fontSize: 22,
    bold: true,
    direction: 'horizontal',
    align: 'left',
    widthPt: 280,
    heightPt: 30,
  },
];

const PAGE_4_FIELDS: PermitField[] = [
  {
    id: 'recipientPostalCode',
    label: '郵便番号',
    placeholder: '807-0081',
    pageIndex: 3,
    x: 530,
    y: 950,
    fontSize: 20,
    direction: 'horizontal',
    align: 'left',
    widthPt: 180,
    heightPt: 26,
  },
  {
    id: 'recipientAddress',
    label: '宛先住所',
    placeholder: '福岡県北九州市八幡西区…',
    pageIndex: 3,
    x: 120,
    y: 820,
    fontSize: 18,
    direction: 'horizontal',
    align: 'left',
    widthPt: 500,
    heightPt: 28,
  },
  {
    id: 'recipientAddress2',
    label: '宛先住所（2行目）',
    placeholder: '',
    pageIndex: 3,
    x: 140,
    y: 780,
    fontSize: 18,
    direction: 'horizontal',
    align: 'left',
    widthPt: 480,
    heightPt: 28,
  },
  {
    id: 'recipientName',
    label: '宛名',
    placeholder: '丸山 千代美 様',
    pageIndex: 3,
    x: 180,
    y: 700,
    fontSize: 26,
    bold: true,
    direction: 'horizontal',
    align: 'left',
    widthPt: 460,
    heightPt: 36,
  },
];

export const PERMIT_PAGE_LAYOUTS: PermitPageLayout[] = [
  {
    pageIndex: 0,
    label: '許可証書（1枚目・横向き）',
    previewPng: '/permit-templates/permit-page-1.png',
    widthPt: 728.4,
    heightPt: 515.76,
    previewWidthPx: 1214,
    previewHeightPx: 860,
    fields: PAGE_1_FIELDS,
    enabled: true,
  },
  {
    pageIndex: 1,
    label: '封筒表（2枚目）',
    previewPng: '/permit-templates/permit-page-2.png',
    widthPt: 515.76,
    heightPt: 728.4,
    previewWidthPx: 860,
    previewHeightPx: 1214,
    fields: PAGE_2_FIELDS,
    enabled: true,
  },
  {
    pageIndex: 2,
    label: '封筒裏（3枚目）',
    previewPng: '/permit-templates/permit-page-3.png',
    widthPt: 515.76,
    heightPt: 728.4,
    previewWidthPx: 860,
    previewHeightPx: 1214,
    fields: [],
    enabled: true,
  },
  {
    pageIndex: 3,
    label: '大型封筒表（4枚目）',
    previewPng: '/permit-templates/permit-page-4.png',
    widthPt: 728.4,
    heightPt: 1031.76,
    previewWidthPx: 1214,
    previewHeightPx: 1720,
    fields: PAGE_4_FIELDS,
    enabled: true,
  },
  {
    pageIndex: 4,
    label: '大型封筒裏（5枚目）',
    previewPng: '/permit-templates/permit-page-5.png',
    widthPt: 1031.76,
    heightPt: 728.4,
    previewWidthPx: 1720,
    previewHeightPx: 1214,
    fields: [],
    enabled: true,
  },
];

/**
 * 全ページから入力が必要なフィールド ID を集める
 */
export function getAllPermitFieldIds(): string[] {
  const ids = new Set<string>();
  PERMIT_PAGE_LAYOUTS.forEach((p) => p.fields.forEach((f) => ids.add(f.id)));
  return Array.from(ids);
}
