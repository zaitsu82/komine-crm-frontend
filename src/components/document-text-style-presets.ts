/**
 * 書類プレビュー・PDF共通の「テキストの種」プリセット
 * バックエンド documentService の許可リストと ID を一致させること
 */
export const DOCUMENT_TEXT_STYLE_PRESET_IDS = [
  'default',
  'mincho',
  'gothic_large',
  'compact',
] as const;

export type DocumentTextStylePresetId =
  (typeof DOCUMENT_TEXT_STYLE_PRESET_IDS)[number];

export interface DocumentTextStylePreset {
  id: DocumentTextStylePresetId;
  label: string;
  description: string;
}

export const DOCUMENT_TEXT_STYLE_PRESETS: DocumentTextStylePreset[] = [
  {
    id: 'default',
    label: '標準',
    description: 'ゴシック系・バランス型。用途を問わず使いやすい既定スタイルです。',
  },
  {
    id: 'mincho',
    label: '明朝・格式',
    description: '明朝体で落ち着いた印象。正式な請求書や通知向きです。',
  },
  {
    id: 'gothic_large',
    label: 'ゴシック大',
    description: 'やや大きめのゴシック。視認性を重視したいときに。',
  },
  {
    id: 'compact',
    label: 'コンパクト',
    description: '文字サイズを抑えて情報密度を上げたレイアウトです。',
  },
];

export function normalizeTextStylePreset(
  raw: string | undefined | null
): DocumentTextStylePresetId {
  const s = String(raw || 'default');
  if (
    DOCUMENT_TEXT_STYLE_PRESET_IDS.includes(s as DocumentTextStylePresetId)
  ) {
    return s as DocumentTextStylePresetId;
  }
  return 'default';
}
