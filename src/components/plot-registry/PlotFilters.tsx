import { PaymentStatus, PhysicalPlotStatus } from '@komine/types';
import type { GraveClassificationsResponse } from '@komine/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAYMENT_STATUS_LABELS, PLOT_STATUS_LABELS } from './constants';

interface PlotFiltersProps {
  filterStatus: PhysicalPlotStatus | undefined;
  onFilterStatusChange: (value: string) => void;
  filterPaymentStatus: PaymentStatus | undefined;
  onFilterPaymentStatusChange: (value: string) => void;
  filterAreaName: string;
  onFilterAreaNameChange: (value: string) => void;
  filterGraveKind: number | undefined;
  onFilterGraveKindChange: (value: string) => void;
  filterGraveKubun: number | undefined;
  onFilterGraveKubunChange: (value: string) => void;
  filterGraveType: number | undefined;
  onFilterGraveTypeChange: (value: string) => void;
  graveClassifications: GraveClassificationsResponse;
  showBuriedPersons: boolean;
  onToggleBuriedPersons: (checked: boolean) => void;
}

/** 折りたたみフィルタ行。 */
export function PlotFilters({
  filterStatus,
  onFilterStatusChange,
  filterPaymentStatus,
  onFilterPaymentStatusChange,
  filterAreaName,
  onFilterAreaNameChange,
  filterGraveKind,
  onFilterGraveKindChange,
  filterGraveKubun,
  onFilterGraveKubunChange,
  filterGraveType,
  onFilterGraveTypeChange,
  graveClassifications,
  showBuriedPersons,
  onToggleBuriedPersons,
}: PlotFiltersProps) {
  return (
    <div className="mb-3 p-3 bg-white border border-gin rounded-elegant grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 sm:flex-wrap">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">区画:</span>
        <Select value={filterStatus || 'all'} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {Object.entries(PLOT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">入金:</span>
        <Select value={filterPaymentStatus || 'all'} onValueChange={onFilterPaymentStatusChange}>
          <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">エリア:</span>
        <Input
          type="text"
          placeholder="エリア名"
          value={filterAreaName}
          onChange={(e) => onFilterAreaNameChange(e.target.value)}
          className="w-full sm:w-28 h-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">形状:</span>
        <Select
          value={filterGraveKind === undefined ? 'all' : String(filterGraveKind)}
          onValueChange={onFilterGraveKindChange}
        >
          <SelectTrigger className="w-full sm:w-20 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {graveClassifications.graveKinds.map((v) => (
              <SelectItem key={v} value={String(v)}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">基地:</span>
        <Select
          value={filterGraveKubun === undefined ? 'all' : String(filterGraveKubun)}
          onValueChange={onFilterGraveKubunChange}
        >
          <SelectTrigger className="w-full sm:w-20 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {graveClassifications.graveKubuns.map((v) => (
              <SelectItem key={v} value={String(v)}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-hai whitespace-nowrap">区分:</span>
        <Select
          value={filterGraveType === undefined ? 'all' : String(filterGraveType)}
          onValueChange={onFilterGraveTypeChange}
        >
          <SelectTrigger className="w-full sm:w-20 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {graveClassifications.graveTypes.map((v) => (
              <SelectItem key={v} value={String(v)}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="md:hidden items-center gap-1.5 text-xs sm:text-sm text-hai cursor-pointer col-span-2 select-none flex">
        <input
          type="checkbox"
          checked={showBuriedPersons}
          onChange={(e) => onToggleBuriedPersons(e.target.checked)}
          className="rounded border-gin accent-matsu"
        />
        埋葬者を表示
      </label>
    </div>
  );
}
