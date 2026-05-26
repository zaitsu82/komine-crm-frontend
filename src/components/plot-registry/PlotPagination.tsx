import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIUEO_TABS } from './constants';

interface PlotPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  activeTab: string;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function PlotPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage,
  activeTab,
  onPrev,
  onNext,
  onGoToPage,
  onItemsPerPageChange,
}: PlotPaginationProps) {
  return (
    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-4 text-hai">
        <div>
          <span className="font-semibold text-sumi">{totalItems > 0 ? startIndex + 1 : 0}</span>
          〜
          <span className="font-semibold text-sumi">{endIndex}</span>
          {' / '}
          <span className="font-semibold text-sumi">{totalItems}</span> 件
          {activeTab !== '全' && (
            <span className="ml-2">（{AIUEO_TABS.find(t => t.key === activeTab)?.label}）</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="h-8 px-3"
        >
          ← 前へ
        </Button>
        <div className="flex items-center gap-1">
          {(() => {
            const pageNumbers: (number | string)[] = [];
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
              for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
              }
            } else {
              if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
              } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
              } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
              }
            }

            return pageNumbers.map((page, idx) => (
              typeof page === 'number' ? (
                <Button
                  key={idx}
                  variant={page === currentPage ? 'matsu' : 'outline'}
                  size="sm"
                  onClick={() => onGoToPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-1 text-hai">...</span>
              )
            ));
          })()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 px-3"
        >
          次へ →
        </Button>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-hai">
        <span>表示件数:</span>
        <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
          <SelectTrigger className="w-24 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50件</SelectItem>
            <SelectItem value="100">100件</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
