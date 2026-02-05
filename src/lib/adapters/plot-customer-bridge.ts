/**
 * Plot-Customer Bridge Adapter
 *
 * CustomerForm (CustomerFormData) と Plot API (CreatePlotRequest/UpdatePlotRequest) の
 * 変換アダプター。CustomerForm の完全な Plot API 移行が完了するまでの暫定措置。
 *
 * Phase 4 完了: Customer 型は customer-form/types.ts にローカル定義として残存。
 * 将来的に CustomerForm 自体を PlotForm に置き換えた際に本ファイルは削除可能。
 */

import type { CreatePlotRequest, UpdatePlotRequest } from '@komine/types';
import type { CustomerFormData } from '@/lib/validations';

// ===== ヘルパー関数 =====

/** 面積文字列を数値に変換（例: "3.6㎡" → 3.6） */
function parseArea(size?: string): number {
  if (!size) return 3.6;
  const match = size.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 3.6;
}

/** 価格文字列を数値に変換 */
function parsePrice(price?: string): number {
  if (!price) return 0;
  const cleaned = price.replace(/[,円]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/** 電話番号からハイフンを除去 */
function formatPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[-－ー]/g, '');
}

/** ひらがなをカタカナに変換 */
function toKatakana(str?: string): string {
  if (!str) return '';
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
}

/** 日付をISO形式（YYYY-MM-DD）に変換 */
function toIsoDate(date?: string | Date | null): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date)) {
    return date.replace(/\//g, '-').replace(/-(\d)(?=-|$)/g, '-0$1');
  }
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return undefined;
}

// ===== 公開関数 =====

/**
 * CustomerFormData → CreatePlotRequest 変換
 */
export function formDataToCreateRequest(data: CustomerFormData): CreatePlotRequest {
  return {
    physicalPlot: {
      plotNumber: data.plotNumber || data.customerCode || '',
      areaName: data.section || data.plotPeriod || '',
      areaSqm: parseArea(data.plotInfo?.size),
    },
    contractPlot: {
      contractAreaSqm: parseArea(data.plotInfo?.size),
    },
    saleContract: {
      contractDate: toIsoDate(data.plotInfo?.contractDate) || toIsoDate(data.reservationDate) || new Date().toISOString().split('T')[0],
      price: parsePrice(data.plotInfo?.price),
      paymentStatus: 'unpaid' as const,
      ...(data.reservationDate && { reservationDate: toIsoDate(data.reservationDate) }),
      ...(data.acceptanceNumber && { acceptanceNumber: data.acceptanceNumber }),
      ...(data.permitDate && { permitDate: toIsoDate(data.permitDate) }),
      ...(data.startDate && { startDate: toIsoDate(data.startDate) }),
    },
    customer: {
      name: data.name,
      nameKana: toKatakana(data.nameKana),
      postalCode: (data.postalCode || '0000000').replace(/-/g, ''),
      address: data.address,
      phoneNumber: formatPhone(data.phoneNumber),
      ...(data.gender && { gender: data.gender }),
      ...(data.birthDate && { birthDate: toIsoDate(data.birthDate) }),
      ...(data.registeredAddress && { registeredAddress: data.registeredAddress }),
      ...(data.faxNumber && { faxNumber: formatPhone(data.faxNumber) }),
      ...(data.email && { email: data.email }),
    },
  } as CreatePlotRequest;
}

/**
 * CustomerFormData → UpdatePlotRequest 変換
 */
export function formDataToUpdateRequest(data: CustomerFormData): UpdatePlotRequest {
  return {
    contractPlot: {
      contractAreaSqm: parseArea(data.plotInfo?.size),
    },
    saleContract: {
      contractDate: toIsoDate(data.plotInfo?.contractDate) || toIsoDate(data.reservationDate),
      price: parsePrice(data.plotInfo?.price),
      ...(data.reservationDate && { reservationDate: toIsoDate(data.reservationDate) }),
      ...(data.acceptanceNumber && { acceptanceNumber: data.acceptanceNumber }),
      ...(data.permitDate && { permitDate: toIsoDate(data.permitDate) }),
      ...(data.startDate && { startDate: toIsoDate(data.startDate) }),
    },
    customer: {
      name: data.name,
      nameKana: toKatakana(data.nameKana),
      postalCode: (data.postalCode || '0000000').replace(/-/g, ''),
      address: data.address,
      phoneNumber: formatPhone(data.phoneNumber),
      ...(data.gender && { gender: data.gender }),
      ...(data.birthDate && { birthDate: toIsoDate(data.birthDate) }),
      ...(data.registeredAddress && { registeredAddress: data.registeredAddress }),
      ...(data.faxNumber && { faxNumber: formatPhone(data.faxNumber) }),
      ...(data.email && { email: data.email }),
    },
  } as UpdatePlotRequest;
}
