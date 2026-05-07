'use client';

/**
 * PlotDetailView - 区画詳細表示コンポーネント
 *
 * @komine/types の PlotDetailResponse を直接使用し、Customer型への変換なしで表示
 * Phase 2-B: Plot-centric migration
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  PlotDetailResponse,
  PaymentStatus,
  ContractStatus,
  PhysicalPlotStatus,
  Gender,
  ContractRole,
  AddressType,
  DmSetting,
} from '@komine/types';
import { usePlotDetail } from '@/hooks/usePlots';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { StatusBadge, type StatusBadgeProps } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { HistoryTab } from '@/components/plot-form/HistoryTab';
import { useAuth } from '@/contexts/auth-context';
import BillingManagement from '@/components/billing';
import PaymentManagement from '@/components/payment';

// ===== 型定義 =====

interface PlotDetailViewProps {
  plotId: string;
  onEdit?: () => void;
  onBack?: () => void;
  onDelete?: (plotCode: string, customerName: string) => void;
}

// ===== ステータスラベル =====

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: '未入金',
  [PaymentStatus.Paid]: '入金済',
  [PaymentStatus.PartialPaid]: '一部入金',
  [PaymentStatus.Overdue]: '滞納',
  [PaymentStatus.Refunded]: '返金済',
};

const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, StatusBadgeProps['variant']> = {
  [PaymentStatus.Unpaid]: 'unpaid',
  [PaymentStatus.Paid]: 'paid',
  [PaymentStatus.PartialPaid]: 'partial',
  [PaymentStatus.Overdue]: 'overdue',
  [PaymentStatus.Refunded]: 'refunded',
};

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.Vacant]: '空き',
  [ContractStatus.Active]: '有効',
  [ContractStatus.Terminated]: '終了',
};

const CONTRACT_STATUS_VARIANTS: Record<ContractStatus, StatusBadgeProps['variant']> = {
  [ContractStatus.Vacant]: 'neutral',
  [ContractStatus.Active]: 'active',
  [ContractStatus.Terminated]: 'neutral',
};

const PHYSICAL_STATUS_LABELS: Record<PhysicalPlotStatus, string> = {
  [PhysicalPlotStatus.Available]: '利用可能',
  [PhysicalPlotStatus.PartiallySold]: '一部販売済',
  [PhysicalPlotStatus.SoldOut]: '完売',
};

const PHYSICAL_STATUS_VARIANTS: Record<PhysicalPlotStatus, StatusBadgeProps['variant']> = {
  [PhysicalPlotStatus.Available]: 'available',
  [PhysicalPlotStatus.PartiallySold]: 'pending',
  [PhysicalPlotStatus.SoldOut]: 'sold',
};

const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Male]: '男性',
  [Gender.Female]: '女性',
  [Gender.NotAnswered]: '未回答',
};

const CONTRACT_ROLE_LABELS: Record<ContractRole, string> = {
  [ContractRole.Applicant]: '申込者',
  [ContractRole.Contractor]: '契約者',
};

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  [AddressType.Home]: '自宅',
  [AddressType.Work]: '勤務先',
  [AddressType.Other]: 'その他',
};

const DM_SETTING_LABELS: Record<DmSetting, string> = {
  [DmSetting.Allow]: '送付する',
  [DmSetting.Deny]: '送付しない',
  [DmSetting.Limited]: '制限付き',
};

// ===== ヘルパー関数 =====

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return `${price.toLocaleString()} 円`;
}

// ===== サブコンポーネント =====

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-2">
      <dt className="text-sm text-hai">{label}</dt>
      <dd className="mt-1 font-semibold text-sumi text-sm">{value || '-'}</dd>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const headingId = `section-${title.replace(/\s+/g, '-')}`;

  return (
    <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden mb-4">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={headingId}
          className="w-full px-4 md:px-5 py-3 md:py-4 bg-kinari border-b border-gin flex items-center justify-between hover:bg-kinari/70 transition-colors"
        >
          <h3 className="font-semibold text-sumi flex items-center text-sm md:text-base">
            <span className="w-1 h-4 md:h-5 bg-matsu rounded-full mr-2 md:mr-3" />
            {title}
          </h3>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-hai transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      ) : (
        <div className="px-5 py-4 bg-kinari border-b border-gin">
          <h3 className="font-semibold text-sumi flex items-center">
            <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
            {title}
          </h3>
        </div>
      )}
      {isOpen && (
        <dl id={headingId} className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {children}
        </dl>
      )}
    </div>
  );
}

// ===== タブコンポーネント =====

function BasicInfoTab({ plot }: { plot: PlotDetailResponse }) {
  const primaryRole = plot.roles.find(r => r.role === ContractRole.Contractor) || plot.roles[0];
  const customer = primaryRole?.customer;

  return (
    <div className="space-y-4">
      {/* 区画情報 */}
      <Section title="区画情報">
        <InfoField label="区画番号" value={plot.physicalPlot.plotNumber} />
        <InfoField label="エリア" value={plot.physicalPlot.areaName} />
        <InfoField label="面積 (m²)" value={plot.physicalPlot.areaSqm?.toString()} />
        <InfoField label="契約面積 (m²)" value={plot.contractAreaSqm?.toString()} />
        <InfoField label="区画状態" value={PHYSICAL_STATUS_LABELS[plot.physicalPlot.status as PhysicalPlotStatus]} />
        <InfoField label="備考" value={plot.locationDescription} />
      </Section>

      {/* 契約情報 */}
      <Section title="契約情報">
        <InfoField label="契約日" value={formatDate(plot.contractDate)} />
        <InfoField label="契約金額" value={formatPrice(plot.price)} />
        <InfoField label="契約状態" value={CONTRACT_STATUS_LABELS[plot.contractStatus as ContractStatus]} />
        <InfoField label="入金状態" value={PAYMENT_STATUS_LABELS[plot.paymentStatus as PaymentStatus]} />
        <InfoField label="予約日" value={formatDate(plot.reservationDate)} />
        <InfoField label="受付番号" value={plot.acceptanceNumber} />
        <InfoField label="受付日" value={formatDate(plot.acceptanceDate)} />
        <InfoField label="担当者" value={plot.staffInCharge} />
        <InfoField label="取扱" value={plot.agentName} />
        <InfoField label="許可日" value={formatDate(plot.permitDate)} />
        <InfoField label="許可番号" value={plot.permitNumber} />
        <InfoField label="開始日" value={formatDate(plot.startDate)} />
        <InfoField label="契約備考" value={plot.contractNotes} />
      </Section>

      {/* 顧客情報（主たる契約者） */}
      {customer && (
        <Section title="契約者情報">
          <InfoField label="氏名" value={customer.name} />
          <InfoField label="ふりがな" value={customer.nameKana} />
          <InfoField label="性別" value={customer.gender ? GENDER_LABELS[customer.gender as Gender] : null} />
          <InfoField label="生年月日" value={formatDate(customer.birthDate)} />
          <InfoField label="電話番号" value={customer.phoneNumber} />
          <InfoField label="FAX" value={customer.faxNumber} />
          <InfoField label="メール" value={customer.email} />
          <InfoField label="郵便番号" value={customer.postalCode} />
          <InfoField label="住所" value={customer.address} />
          <InfoField label="住所2" value={customer.addressLine2} />
          <InfoField label="本籍地" value={customer.registeredAddress} />
          <InfoField label="役割" value={primaryRole?.role ? CONTRACT_ROLE_LABELS[primaryRole.role as ContractRole] : null} />
          <InfoField label="備考" value={customer.notes} />
        </Section>
      )}

      {/* 勤務先情報 */}
      {customer?.workInfo && (
        <Section title="勤務先情報">
          <InfoField label="勤務先名称" value={customer.workInfo.companyName} />
          <InfoField label="勤務先かな" value={customer.workInfo.companyNameKana} />
          <InfoField label="勤務先郵便番号" value={customer.workInfo.workPostalCode} />
          <InfoField label="勤務先住所" value={customer.workInfo.workAddress} />
          <InfoField label="勤務先電話番号" value={customer.workInfo.workPhoneNumber} />
          <InfoField label="DM設定" value={customer.workInfo.dmSetting ? DM_SETTING_LABELS[customer.workInfo.dmSetting as DmSetting] : null} />
          <InfoField label="宛先区分" value={customer.workInfo.addressType ? ADDRESS_TYPE_LABELS[customer.workInfo.addressType as AddressType] : null} />
          <InfoField label="備考" value={customer.workInfo.notes} />
        </Section>
      )}

      {/*
        請求情報（BillingInfo）セクションは Phase 2 移行で廃止。
        Phase 3 で Billing/Payment エンティティとして再設計予定。
        Refs: zaitsu82/komine-crm-backend#106
      */}
    </div>
  );
}

function FeeInfoTab({ plot }: { plot: PlotDetailResponse }) {
  return (
    <div className="space-y-4">
      {/* 使用料 */}
      {plot.usageFee && (
        <Section title="使用料">
          <InfoField label="計算タイプ" value={plot.usageFee.calculationType} />
          <InfoField label="税区分" value={plot.usageFee.taxType} />
          <InfoField label="請求タイプ" value={plot.usageFee.billingType} />
          <InfoField label="請求年数" value={plot.usageFee.billingYears?.toString()} />
          <InfoField label="面積" value={plot.usageFee.area} />
          <InfoField label="単価" value={plot.usageFee.unitPrice} />
          <InfoField label="使用料" value={plot.usageFee.usageFee} />
          <InfoField label="支払方法" value={plot.usageFee.paymentMethod} />
        </Section>
      )}

      {/* 管理料 */}
      {plot.managementFee && (
        <Section title="管理料">
          <InfoField label="計算タイプ" value={plot.managementFee.calculationType} />
          <InfoField label="税区分" value={plot.managementFee.taxType} />
          <InfoField label="請求タイプ" value={plot.managementFee.billingType} />
          <InfoField label="請求年数" value={plot.managementFee.billingYears?.toString()} />
          <InfoField label="面積" value={plot.managementFee.area} />
          <InfoField label="請求月" value={plot.managementFee.billingMonth?.toString()} />
          <InfoField label="管理料" value={plot.managementFee.managementFee} />
          <InfoField label="単価" value={plot.managementFee.unitPrice} />
          <InfoField label="最終請求月" value={plot.managementFee.lastBillingMonth} />
          <InfoField label="支払方法" value={plot.managementFee.paymentMethod} />
        </Section>
      )}

      {!plot.usageFee && !plot.managementFee && (
        <Section title="料金情報">
          <div className="col-span-full text-center text-hai py-4">
            料金情報が登録されていません
          </div>
        </Section>
      )}
    </div>
  );
}

function ContactsTab({ plot }: { plot: PlotDetailResponse }) {
  return (
    <div className="space-y-4">
      {/* 契約関係者一覧 */}
      <Section title="契約関係者">
        {plot.roles.length > 0 ? (
          plot.roles.map((role, idx) => (
            <div key={role.id || idx} className={`col-span-full ${idx > 0 ? 'border-t border-gin pt-4' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="役割" value={CONTRACT_ROLE_LABELS[role.role as ContractRole]} />
                <InfoField label="氏名" value={role.customer.name} />
                <InfoField label="ふりがな" value={role.customer.nameKana} />
                <InfoField label="電話番号" value={role.customer.phoneNumber} />
                <InfoField label="住所" value={role.customer.address} />
                <InfoField label="開始日" value={formatDate(role.roleStartDate)} />
                <InfoField label="終了日" value={formatDate(role.roleEndDate)} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-hai py-4">
            契約関係者が登録されていません
          </div>
        )}
      </Section>

      {/* 家族連絡先 */}
      <Section title="家族連絡先">
        {plot.familyContacts && plot.familyContacts.length > 0 ? (
          plot.familyContacts.map((contact, idx) => (
            <div key={contact.id || idx} className={`col-span-full ${idx > 0 ? 'border-t border-gin pt-4' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="氏名" value={contact.name} />
                <InfoField label="ふりがな" value={contact.nameKana} />
                <InfoField label="続柄" value={contact.relationship} />
                <InfoField label="生年月日" value={formatDate(contact.birthDate)} />
                <InfoField label="郵便番号" value={contact.postalCode} />
                <InfoField label="住所" value={contact.address} />
                <InfoField label="電話番号" value={contact.phoneNumber} />
                <InfoField label="電話番号2" value={contact.phoneNumber2} />
                <InfoField label="FAX" value={contact.faxNumber} />
                <InfoField label="メール" value={contact.email} />
                <InfoField label="本籍住所" value={contact.registeredAddress} />
                <InfoField label="送付先区分" value={contact.mailingType ? ADDRESS_TYPE_LABELS[contact.mailingType as AddressType] : null} />
                <InfoField label="連絡方法" value={contact.contactMethod} />
              </div>
              {/* 勤務先情報 */}
              {(contact.workCompanyName || contact.workAddress || contact.workPhoneNumber) && (
                <div className="mt-3 pt-3 border-t border-gin">
                  <h4 className="text-sm font-medium text-hai mb-2">勤務先</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoField label="勤務先名称" value={contact.workCompanyName} />
                    <InfoField label="勤務先かな" value={contact.workCompanyNameKana} />
                    <InfoField label="勤務先住所" value={contact.workAddress} />
                    <InfoField label="勤務先電話番号" value={contact.workPhoneNumber} />
                  </div>
                </div>
              )}
              {contact.notes && (
                <div className="mt-3 pt-3 border-t border-gin">
                  <InfoField label="備考" value={contact.notes} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-hai py-4">
            家族連絡先が登録されていません
          </div>
        )}
      </Section>
    </div>
  );
}

function BurialInfoTab({ plot }: { plot: PlotDetailResponse }) {
  return (
    <div className="space-y-4">
      {/* 埋葬者情報 */}
      <Section title="埋葬者一覧">
        {plot.buriedPersons && plot.buriedPersons.length > 0 ? (
          plot.buriedPersons.map((person, idx) => (
            <div key={person.id || idx} className={`col-span-full ${idx > 0 ? 'border-t border-gin pt-4' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="氏名" value={person.name} />
                <InfoField label="ふりがな" value={person.nameKana} />
                <InfoField label="戒名" value={person.posthumousName} />
                <InfoField label="性別" value={person.gender ? GENDER_LABELS[person.gender as Gender] : null} />
                <InfoField label="生年月日" value={formatDate(person.birthDate)} />
                <InfoField label="死亡日" value={formatDate(person.deathDate)} />
                <InfoField label="享年" value={person.age?.toString()} />
                <InfoField label="納骨日" value={formatDate(person.burialDate)} />
                <InfoField label="届出日" value={formatDate(person.reportDate)} />
                <InfoField label="続柄" value={person.relationship} />
                <InfoField label="宗派" value={person.religion} />
                <InfoField label="備考" value={person.notes} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-hai py-4">
            埋葬者が登録されていません
          </div>
        )}
      </Section>

      {/* 合祀情報 */}
      {plot.collectiveBurial && (
        <Section title="合祀情報">
          <InfoField label="収容可能人数" value={plot.collectiveBurial.burialCapacity?.toString()} />
          <InfoField label="現在の埋葬数" value={plot.collectiveBurial.currentBurialCount?.toString()} />
          <InfoField label="有効期間（年）" value={plot.collectiveBurial.validityPeriodYears?.toString()} />
          <InfoField label="上限到達日" value={formatDate(plot.collectiveBurial.capacityReachedDate)} />
          <InfoField label="請求予定日" value={formatDate(plot.collectiveBurial.billingScheduledDate)} />
          <InfoField label="請求状態" value={plot.collectiveBurial.billingStatus} />
          <InfoField label="請求金額" value={formatPrice(plot.collectiveBurial.billingAmount)} />
          <InfoField label="備考" value={plot.collectiveBurial.notes} />
        </Section>
      )}

      {/* 墓石情報 */}
      {plot.gravestoneInfo && (
        <Section title="墓石情報">
          <InfoField label="墓石基礎" value={plot.gravestoneInfo.gravestoneBase} />
          <InfoField label="外柵位置" value={plot.gravestoneInfo.enclosurePosition} />
          <InfoField label="石材店" value={plot.gravestoneInfo.gravestoneDealer} />
          <InfoField label="墓石種類" value={plot.gravestoneInfo.gravestoneType} />
          <InfoField label="周辺面積" value={plot.gravestoneInfo.surroundingArea} />
          <InfoField label="建立期限" value={formatDate(plot.gravestoneInfo.establishmentDeadline)} />
          <InfoField label="建立日" value={formatDate(plot.gravestoneInfo.establishmentDate)} />
        </Section>
      )}
    </div>
  );
}

function HistoryInfoTab({ plot }: { plot: PlotDetailResponse }) {
  // 改良版の HistoryTab を再利用（差分表示・日本語ラベル付き）
  return <HistoryTab plotDetail={plot} />;
}

function ConstructionInfoTab({ plot }: { plot: PlotDetailResponse }) {
  return (
    <div className="space-y-4">
      <Section title="工事記録">
        {plot.constructionInfos && plot.constructionInfos.length > 0 ? (
          plot.constructionInfos.map((record, idx) => (
            <div key={record.id || idx} className={`col-span-full ${idx > 0 ? 'border-t border-gin pt-4' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="施工業者" value={record.contractor} />
                <InfoField label="監督者" value={record.supervisor} />
                <InfoField label="工事種別" value={record.constructionType} />
                <InfoField label="工事内容" value={record.constructionContent} />
                <InfoField label="進捗" value={record.progress} />
                <InfoField label="開始日" value={formatDate(record.startDate)} />
                <InfoField label="完了日" value={formatDate(record.completionDate)} />
                <InfoField label="終了予定日" value={formatDate(record.scheduledEndDate)} />
                <InfoField label="申請日" value={formatDate(record.applicationDate)} />
                <InfoField label="許可番号" value={record.permitNumber} />
                <InfoField label="許可日" value={formatDate(record.permitDate)} />
                <InfoField label="許可状態" value={record.permitStatus} />
                <InfoField label="備考" value={record.notes} />
              </div>
              {/* 工事項目 */}
              {(record.workItem1 || record.workItem2) && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-sumi mb-2">工事項目</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {record.workItem1 && (
                      <div className="border border-gin rounded-elegant p-2">
                        <InfoField label="項目1" value={record.workItem1} />
                        <InfoField label="日付" value={formatDate(record.workDate1)} />
                        <InfoField label="金額" value={formatPrice(record.workAmount1)} />
                        <InfoField label="状態" value={record.workStatus1} />
                      </div>
                    )}
                    {record.workItem2 && (
                      <div className="border border-gin rounded-elegant p-2">
                        <InfoField label="項目2" value={record.workItem2} />
                        <InfoField label="日付" value={formatDate(record.workDate2)} />
                        <InfoField label="金額" value={formatPrice(record.workAmount2)} />
                        <InfoField label="状態" value={record.workStatus2} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 入金情報 */}
              {(record.paymentType1 || record.paymentType2) && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-sumi mb-2">入金情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {record.paymentType1 && (
                      <div className="border border-gin rounded-elegant p-2">
                        <InfoField label="入金種別1" value={record.paymentType1} />
                        <InfoField label="入金額" value={formatPrice(record.paymentAmount1)} />
                        <InfoField label="入金日" value={formatDate(record.paymentDate1)} />
                        <InfoField label="状態" value={record.paymentStatus1} />
                      </div>
                    )}
                    {record.paymentType2 && (
                      <div className="border border-gin rounded-elegant p-2">
                        <InfoField label="入金種別2" value={record.paymentType2} />
                        <InfoField label="入金額" value={formatPrice(record.paymentAmount2)} />
                        <InfoField label="入金予定日" value={formatDate(record.paymentScheduledDate2)} />
                        <InfoField label="状態" value={record.paymentStatus2} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-hai py-4">
            工事記録が登録されていません
          </div>
        )}
      </Section>
    </div>
  );
}

// ===== メインコンポーネント =====

export default function PlotDetailView({ plotId, onEdit, onBack, onDelete }: PlotDetailViewProps) {
  const { user } = useAuth();
  const { plot, isLoading, error, refresh } = usePlotDetail(plotId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-beni-50 border border-beni-200 rounded-elegant-lg p-6 text-center">
        <p className="text-beni mb-4">エラーが発生しました: {error}</p>
        <Button onClick={refresh} variant="outline">
          再読み込み
        </Button>
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="bg-kinari border border-gin rounded-elegant-lg p-6 text-center">
        <p className="text-hai">区画が見つかりません</p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            戻る
          </Button>
        )}
      </div>
    );
  }

  const primaryCustomer = plot.roles.find(r => r.role === ContractRole.Contractor)?.customer
    || plot.roles[0]?.customer;

  return (
    <div className="w-full">
      {/* パンくずナビゲーション */}
      <nav className="flex items-center gap-1.5 text-sm text-hai mb-3" aria-label="パンくず">
        <Link href="/plots" className="hover:text-matsu transition-colors">
          台帳
        </Link>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sumi font-medium truncate">
          {plot.physicalPlot.plotNumber}
        </span>
      </nav>

      {/* ヘッダー + ツールバー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4 md:p-5">
        <div className="min-w-0">
          <h2 className="text-lg md:text-2xl font-bold text-sumi truncate">
            {plot.physicalPlot.plotNumber} - {plot.physicalPlot.areaName}
          </h2>
          {primaryCustomer && (
            <p className="text-hai mt-1 text-sm md:text-base truncate">
              契約者: {primaryCustomer.name}
              {primaryCustomer.nameKana && ` (${primaryCustomer.nameKana})`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* 書類作成・履歴は PC 専用画面に遷移するためモバイルでは非表示 */}
          <Link href={`/plots/${plotId}/documents/create`} className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>書類作成</span>
            </Button>
          </Link>
          <Link href={`/plots/${plotId}/documents`} className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>書類履歴</span>
            </Button>
          </Link>
          {onEdit && (
            <Button onClick={onEdit} className="bg-matsu hover:bg-matsu-dark text-white" size="sm">
              編集
            </Button>
          )}
          {/* ... ドロップダウンメニュー（削除等） */}
          {user?.role === 'admin' && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2" aria-label="その他の操作">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(
                    plot.physicalPlot.plotNumber,
                    primaryCustomer?.name || plot.physicalPlot.plotNumber
                  )}
                  className="text-beni focus:text-beni"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  区画情報を削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* サマリーカード */}
      <div className="mb-4 md:mb-6 rounded-elegant-lg border border-gin bg-white shadow-elegant-sm p-4 md:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {/* 契約者 */}
          <div className="min-w-0 col-span-2 md:col-span-1">
            <p className="text-[11px] md:text-xs text-hai">契約者</p>
            <p className="mt-1 text-base md:text-lg font-semibold text-sumi truncate">
              {primaryCustomer?.name || '-'}
            </p>
            {primaryCustomer?.nameKana && (
              <p className="text-[11px] md:text-xs text-hai truncate">
                {primaryCustomer.nameKana}
              </p>
            )}
          </div>
          {/* 未収金額 */}
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs text-hai">未収金額</p>
            <p className={cn(
              'mt-1 text-lg md:text-2xl font-semibold tabular-nums',
              (plot.uncollectedAmount ?? 0) > 0 ? 'text-beni' : 'text-sumi'
            )}>
              {(plot.uncollectedAmount ?? 0).toLocaleString()}
              <span className="text-xs md:text-sm text-hai ml-1 font-normal">円</span>
            </p>
          </div>
          {/* 直近請求月（管理料） */}
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs text-hai">直近請求</p>
            <p className="mt-1 text-sm md:text-base font-semibold text-sumi tabular-nums truncate">
              {plot.managementFee?.lastBillingMonth || '―'}
            </p>
          </div>
          {/* 区画状態 */}
          <div className="min-w-0 col-span-2 md:col-span-1">
            <p className="text-[11px] md:text-xs text-hai mb-1.5">状態</p>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge
                variant={PAYMENT_STATUS_VARIANTS[plot.paymentStatus as PaymentStatus]}
                withSymbol
              >
                {PAYMENT_STATUS_LABELS[plot.paymentStatus as PaymentStatus]}
              </StatusBadge>
              <StatusBadge
                variant={CONTRACT_STATUS_VARIANTS[plot.contractStatus as ContractStatus]}
                withSymbol
              >
                {CONTRACT_STATUS_LABELS[plot.contractStatus as ContractStatus]}
              </StatusBadge>
              <StatusBadge
                variant={PHYSICAL_STATUS_VARIANTS[plot.physicalPlot.status]}
                withSymbol
              >
                {PHYSICAL_STATUS_LABELS[plot.physicalPlot.status]}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* タブ — モバイル: 横スクロール / タブレット以上: グリッド */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList
          className={cn(
            // モバイル: フルwidthで横スクロール、スナップ付き
            // justify-start で base の justify-center を打ち消す
            // (overflow時に中央寄せだと左端が見切れてスクロール不可になるため)
            'flex w-full justify-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-thin h-auto gap-1',
            // sm以上: グリッドレイアウトに戻す
            'sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible sm:snap-none'
          )}
        >
          <TabsTrigger value="basic" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="fee" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            料金情報
          </TabsTrigger>
          <TabsTrigger value="contacts" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            連絡先
          </TabsTrigger>
          <TabsTrigger value="burial" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            埋葬情報
          </TabsTrigger>
          <TabsTrigger value="construction" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            工事情報
          </TabsTrigger>
          <TabsTrigger value="billing" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            請求
          </TabsTrigger>
          <TabsTrigger value="payment" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            入金
          </TabsTrigger>
          <TabsTrigger value="history" className="shrink-0 sm:shrink snap-start px-3 sm:px-2 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-matsu data-[state=active]:text-white">
            履歴情報
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 md:mt-6">
          <BasicInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="fee" className="mt-4 md:mt-6">
          <FeeInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-4 md:mt-6">
          <ContactsTab plot={plot} />
        </TabsContent>

        <TabsContent value="burial" className="mt-4 md:mt-6">
          <BurialInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="construction" className="mt-4 md:mt-6">
          <ConstructionInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="billing" className="mt-4 md:mt-6">
          <div className="bg-white border border-gin rounded-elegant-lg overflow-hidden">
            <BillingManagement
              contractPlotId={plot.id}
              customerId={
                plot.roles.find((r) => r.role === ContractRole.Contractor)?.customer.id ??
                plot.roles[0]?.customer.id
              }
              showHeader={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-4 md:mt-6">
          <div className="bg-white border border-gin rounded-elegant-lg overflow-hidden">
            <PaymentManagement
              contractPlotId={plot.id}
              customerId={
                plot.roles.find((r) => r.role === ContractRole.Contractor)?.customer.id ??
                plot.roles[0]?.customer.id
              }
              showHeader={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4 md:mt-6">
          <HistoryInfoTab plot={plot} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
