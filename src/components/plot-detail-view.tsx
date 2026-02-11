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
} from '@komine/types';
import { usePlotDetail } from '@/hooks/usePlots';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <InfoField label="本籍地" value={customer.registeredAddress} />
          <InfoField label="役割" value={primaryRole?.role ? CONTRACT_ROLE_LABELS[primaryRole.role as ContractRole] : null} />
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
        <div className="text-center text-gray-500 py-8">
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
            <div key={role.id || idx} className="col-span-full border rounded p-4 mb-2">
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
          <div className="col-span-full text-center text-gray-500 py-4">
            契約関係者が登録されていません
          </div>
        )}
      </Section>

      {/* 家族連絡先 */}
      <Section title="家族連絡先">
        {plot.familyContacts && plot.familyContacts.length > 0 ? (
          plot.familyContacts.map((contact, idx) => (
            <div key={contact.id || idx} className="col-span-full border rounded p-4 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="氏名" value={contact.name} />
                <InfoField label="続柄" value={contact.relationship} />
                <InfoField label="電話番号" value={contact.phoneNumber} />
                <InfoField label="住所" value={contact.address} />
                <InfoField label="生年月日" value={formatDate(contact.birthDate)} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">
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
            <div key={person.id || idx} className="col-span-full border rounded p-4 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="氏名" value={person.name} />
                <InfoField label="ふりがな" value={person.nameKana} />
                <InfoField label="性別" value={person.gender ? GENDER_LABELS[person.gender as Gender] : null} />
                <InfoField label="死亡日" value={formatDate(person.deathDate)} />
                <InfoField label="享年" value={person.age?.toString()} />
                <InfoField label="納骨日" value={formatDate(person.burialDate)} />
                <InfoField label="続柄" value={person.relationship} />
                <InfoField label="備考" value={person.notes} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">
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
      <div className="text-center text-gray-500 py-8">
        履歴データはありません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">履歴情報</h3>
      <div className="grid grid-cols-4 gap-4 px-3 py-2 bg-gray-100 border rounded-t-md text-sm font-medium text-gray-600">
        <span>日時</span>
        <span>操作</span>
        <span>変更フィールド</span>
        <span>変更者</span>
      </div>
      <div className="border border-t-0 rounded-b-md divide-y">
        {histories.map((history) => (
          <div
            key={history.id}
            className="grid grid-cols-4 gap-4 px-3 py-2 text-sm hover:bg-blue-50"
          >
            <span>{new Date(history.createdAt).toLocaleString('ja-JP')}</span>
            <span>{ACTION_TYPE_LABELS[history.actionType] || history.actionType}</span>
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
            <div key={record.id || idx} className="col-span-full border rounded p-4 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="施工業者" value={record.contractor} />
                <InfoField label="監督者" value={record.supervisor} />
                <InfoField label="工事種別" value={record.constructionType} />
                <InfoField label="進捗" value={record.progress} />
                <InfoField label="開始日" value={formatDate(record.startDate)} />
                <InfoField label="完了日" value={formatDate(record.completionDate)} />
                <InfoField label="許可番号" value={record.permitNumber} />
                <InfoField label="許可日" value={formatDate(record.permitDate)} />
                <InfoField label="許可状態" value={record.permitStatus} />
                <InfoField label="備考" value={record.notes} />
              </div>
              {/* 工事項目 */}
              {(record.workItem1 || record.workItem2) && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">工事項目</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {record.workItem1 && (
                      <div className="border rounded p-2">
                        <InfoField label="項目1" value={record.workItem1} />
                        <InfoField label="日付" value={formatDate(record.workDate1)} />
                        <InfoField label="金額" value={formatPrice(record.workAmount1)} />
                        <InfoField label="状態" value={record.workStatus1} />
                      </div>
                    )}
                    {record.workItem2 && (
                      <div className="border rounded p-2">
                        <InfoField label="項目2" value={record.workItem2} />
                        <InfoField label="日付" value={formatDate(record.workDate2)} />
                        <InfoField label="金額" value={formatPrice(record.workAmount2)} />
                        <InfoField label="状態" value={record.workStatus2} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">エラーが発生しました: {error}</p>
        <Button onClick={refresh} variant="outline">
          再読み込み
        </Button>
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">区画が見つかりません</p>
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
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow p-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {plot.physicalPlot.plotNumber} - {plot.physicalPlot.areaName}
          </h2>
          {primaryCustomer && (
            <p className="text-gray-600 mt-1">
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
          <Button onClick={refresh} variant="outline">
            更新
          </Button>
          {onEdit && (
            <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
              編集
            </Button>
          )}
        </div>
      </div>

      {/* ステータスバッジ */}
      <div className="flex gap-2 mb-4">
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          plot.paymentStatus === PaymentStatus.Paid ? 'bg-green-100 text-green-800' :
            plot.paymentStatus === PaymentStatus.Unpaid ? 'bg-yellow-100 text-yellow-800' :
              plot.paymentStatus === PaymentStatus.Overdue ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
        )}>
          {PAYMENT_STATUS_LABELS[plot.paymentStatus as PaymentStatus]}
        </span>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          plot.contractStatus === ContractStatus.Active ? 'bg-blue-100 text-blue-800' :
            plot.contractStatus === ContractStatus.Suspended ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
        )}>
          {CONTRACT_STATUS_LABELS[plot.contractStatus as ContractStatus]}
        </span>
      </div>

      {/* タブ */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="fee" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            料金情報
          </TabsTrigger>
          <TabsTrigger value="contacts" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            連絡先
          </TabsTrigger>
          <TabsTrigger value="burial" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            埋葬情報
          </TabsTrigger>
          <TabsTrigger value="construction" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            工事情報
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
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
