'use client';

/**
 * PlotDetailView - 区画詳細表示コンポーネント
 *
 * @komine/types の PlotDetailResponse を直接使用し、Customer型への変換なしで表示
 * Phase 2-B: Plot-centric migration
 */

import {
  PlotDetailResponse,
  PaymentStatus,
  ContractStatus,
  PhysicalPlotStatus,
  Gender,
  ContractRole,
  AddressType,
  DmSetting,
  BillingType,
  AccountType,
} from '@komine/types';
import { usePlotDetail } from '@/hooks/usePlots';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ===== 型定義 =====

interface PlotDetailViewProps {
  plotId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

// ===== ステータスラベル =====

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: '未入金',
  [PaymentStatus.Paid]: '入金済',
  [PaymentStatus.PartialPaid]: '一部入金',
  [PaymentStatus.Overdue]: '滞納',
  [PaymentStatus.Refunded]: '返金済',
  [PaymentStatus.Cancelled]: 'キャンセル',
};

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: '下書き',
  [ContractStatus.Reserved]: '予約済',
  [ContractStatus.Active]: '有効',
  [ContractStatus.Suspended]: '一時停止',
  [ContractStatus.Terminated]: '終了',
  [ContractStatus.Cancelled]: '解約',
  [ContractStatus.Transferred]: '継承済',
};

const PHYSICAL_STATUS_LABELS: Record<PhysicalPlotStatus, string> = {
  [PhysicalPlotStatus.Available]: '利用可能',
  [PhysicalPlotStatus.PartiallySold]: '一部販売済',
  [PhysicalPlotStatus.SoldOut]: '完売',
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

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  [BillingType.Individual]: '個人',
  [BillingType.Corporate]: '法人',
  [BillingType.BankTransfer]: '銀行振込',
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.Ordinary]: '普通預金',
  [AccountType.Current]: '当座預金',
  [AccountType.Savings]: '貯蓄預金',
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden mb-4">
      <div className="px-5 py-4 bg-kinari border-b border-gin">
        <h3 className="font-semibold text-sumi flex items-center">
          <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
          {title}
        </h3>
      </div>
      <dl className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </dl>
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

      {/* 請求情報 */}
      {customer?.billingInfo && (
        <Section title="請求情報">
          <InfoField label="請求種別" value={customer.billingInfo.billingType ? BILLING_TYPE_LABELS[customer.billingInfo.billingType as BillingType] : null} />
          <InfoField label="機関名称" value={customer.billingInfo.bankName} />
          <InfoField label="支店名称" value={customer.billingInfo.branchName} />
          <InfoField label="口座科目" value={customer.billingInfo.accountType ? ACCOUNT_TYPE_LABELS[customer.billingInfo.accountType as AccountType] : null} />
          <InfoField label="記号番号" value={customer.billingInfo.accountNumber} />
          <InfoField label="口座名義" value={customer.billingInfo.accountHolder} />
        </Section>
      )}
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
        <div className="text-center text-hai py-8">
          料金情報が登録されていません
        </div>
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
            <div key={role.id || idx} className="col-span-full border border-gin rounded-elegant p-4 mb-2 bg-kinari/30">
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
            <div key={contact.id || idx} className="col-span-full border border-gin rounded-elegant p-4 mb-2 bg-kinari/30">
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
            <div key={person.id || idx} className="col-span-full border border-gin rounded-elegant p-4 mb-2 bg-kinari/30">
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

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE: '作成',
  UPDATE: '更新',
  DELETE: '削除',
};

function HistoryInfoTab({ plot }: { plot: PlotDetailResponse }) {
  const histories = plot.histories || [];

  if (histories.length === 0) {
    return (
      <div className="text-center text-hai py-8">
        履歴データはありません
      </div>
    );
  }

  return (
    <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
      <div className="px-5 py-4 bg-kinari border-b border-gin">
        <h3 className="font-semibold text-sumi flex items-center">
          <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
          履歴情報
        </h3>
      </div>
      <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-kinari/50 border-b border-gin text-sm font-medium text-hai">
        <span>日時</span>
        <span>操作</span>
        <span>更新事由</span>
        <span>変更フィールド</span>
        <span>変更者</span>
      </div>
      <div className="divide-y divide-gin">
        {histories.map((history) => (
          <div
            key={history.id}
            className="grid grid-cols-5 gap-4 px-4 py-2 text-sm hover:bg-matsu-50 transition-colors duration-200 cursor-default"
          >
            <span>{new Date(history.createdAt).toLocaleString('ja-JP')}</span>
            <span>{ACTION_TYPE_LABELS[history.actionType] || history.actionType}</span>
            <span>{history.changeReason || '-'}</span>
            <span className="truncate">
              {history.changedFields?.join(', ') || '-'}
            </span>
            <span>{history.changedBy || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstructionInfoTab({ plot }: { plot: PlotDetailResponse }) {
  return (
    <div className="space-y-4">
      <Section title="工事記録">
        {plot.constructionInfos && plot.constructionInfos.length > 0 ? (
          plot.constructionInfos.map((record, idx) => (
            <div key={record.id || idx} className="col-span-full border border-gin rounded-elegant p-4 mb-2 bg-kinari/30">
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

export default function PlotDetailView({ plotId, onEdit, onBack }: PlotDetailViewProps) {
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
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-5">
        <div>
          <h2 className="text-2xl font-bold text-sumi">
            {plot.physicalPlot.plotNumber} - {plot.physicalPlot.areaName}
          </h2>
          {primaryCustomer && (
            <p className="text-hai mt-1">
              契約者: {primaryCustomer.name}
              {primaryCustomer.nameKana && ` (${primaryCustomer.nameKana})`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {onBack && (
            <Button onClick={onBack} variant="outline">
              戻る
            </Button>
          )}
          {onEdit && (
            <Button onClick={onEdit} className="bg-matsu hover:bg-matsu-dark text-white">
              編集
            </Button>
          )}
        </div>
      </div>

      {/* ステータスバッジ */}
      <div className="flex gap-2 mb-4">
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          plot.paymentStatus === PaymentStatus.Paid ? 'bg-matsu-50 text-matsu' :
            plot.paymentStatus === PaymentStatus.Unpaid ? 'bg-kohaku-50 text-kohaku-dark' :
              plot.paymentStatus === PaymentStatus.Overdue ? 'bg-beni-50 text-beni' :
                'bg-kinari text-hai'
        )}>
          {PAYMENT_STATUS_LABELS[plot.paymentStatus as PaymentStatus]}
        </span>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          plot.contractStatus === ContractStatus.Active ? 'bg-ai-50 text-ai-dark' :
            plot.contractStatus === ContractStatus.Suspended ? 'bg-kohaku-50 text-kohaku-dark' :
              'bg-kinari text-hai'
        )}>
          {CONTRACT_STATUS_LABELS[plot.contractStatus as ContractStatus]}
        </span>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          plot.uncollectedAmount > 0 ? 'bg-beni-50 text-beni' : 'bg-kinari text-hai'
        )}>
          未集金額: {plot.uncollectedAmount.toLocaleString()}円
        </span>
      </div>

      {/* タブ */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="basic" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="fee" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            料金情報
          </TabsTrigger>
          <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            連絡先
          </TabsTrigger>
          <TabsTrigger value="burial" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            埋葬情報
          </TabsTrigger>
          <TabsTrigger value="construction" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            工事情報
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-matsu data-[state=active]:text-white">
            履歴情報
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="fee" className="mt-6">
          <FeeInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactsTab plot={plot} />
        </TabsContent>

        <TabsContent value="burial" className="mt-6">
          <BurialInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="construction" className="mt-6">
          <ConstructionInfoTab plot={plot} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryInfoTab plot={plot} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
