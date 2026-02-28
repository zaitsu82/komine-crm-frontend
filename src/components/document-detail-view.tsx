'use client';

/**
 * 書類詳細表示コンポーネント
 */

import { Button } from '@/components/ui/button';
import {
  useDocumentDetail,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
} from '@/hooks/useDocuments';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  FileText,
  Calendar,
  User,
  MapPin,
  File,
} from 'lucide-react';
import { PageHeader } from '@/components/shared';

interface DocumentDetailViewProps {
  documentId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function DocumentDetailView({
  documentId,
  onBack,
  onEdit,
  onDelete,
  onDownload,
}: DocumentDetailViewProps) {
  const { data, isLoading, error, refresh } = useDocumentDetail(documentId);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-kohaku" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <div className="p-4 bg-beni-50 text-beni rounded-elegant-lg border border-beni-200">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <div className="p-8 text-center text-hai">
          <FileText className="mx-auto h-12 w-12 text-gin mb-2" />
          書類が見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-shiro">
      <PageHeader
        color="kohaku"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title={data.name}
        subtitle="書類詳細"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              戻る
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(documentId)}>
              <Edit className="mr-1 h-4 w-4" />
              編集
            </Button>
            {data.fileName && (
              <Button variant="outline" size="sm" onClick={() => onDownload(documentId)}>
                <Download className="mr-1 h-4 w-4" />
                DL
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-beni hover:text-beni-dark hover:bg-beni-50"
              onClick={() => onDelete(documentId)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              削除
            </Button>
          </div>
        }
      />

      {/* メイン情報 */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
        {/* 基本情報 */}
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden">
          <div className="bg-kinari px-6 py-3 border-b border-gin">
            <h3 className="text-sm font-semibold text-sumi flex items-center">
              <FileText className="mr-2 h-4 w-4 text-kohaku" />
              基本情報
            </h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-hai">書類名</dt>
                <dd className="text-sumi font-medium">{data.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-hai">種類</dt>
                <dd>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-ai-50 text-ai">
                    {DOCUMENT_TYPE_LABELS[data.type]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-hai">ステータス</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${DOCUMENT_STATUS_COLORS[data.status]}`}
                  >
                    {DOCUMENT_STATUS_LABELS[data.status]}
                  </span>
                </dd>
              </div>
              {data.description && (
                <div>
                  <dt className="text-sm text-hai">説明</dt>
                  <dd className="text-sumi">{data.description}</dd>
                </div>
              )}
              {data.notes && (
                <div>
                  <dt className="text-sm text-hai">備考</dt>
                  <dd className="text-sumi whitespace-pre-wrap">{data.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* ファイル情報 */}
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden">
          <div className="bg-kinari px-6 py-3 border-b border-gin">
            <h3 className="text-sm font-semibold text-sumi flex items-center">
              <File className="mr-2 h-4 w-4 text-kohaku" />
              ファイル情報
            </h3>
          </div>
          <div className="p-6">
            {data.fileName ? (
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-hai">ファイル名</dt>
                  <dd className="text-sumi">{data.fileName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-hai">ファイルサイズ</dt>
                  <dd className="text-sumi">{formatFileSize(data.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-hai">MIMEタイプ</dt>
                  <dd className="text-sumi">{data.mimeType || '-'}</dd>
                </div>
                {data.generatedAt && (
                  <div>
                    <dt className="text-sm text-hai">生成日時</dt>
                    <dd className="text-sumi">{formatDate(data.generatedAt)}</dd>
                  </div>
                )}
                {data.sentAt && (
                  <div>
                    <dt className="text-sm text-hai">送付日時</dt>
                    <dd className="text-sumi">{formatDate(data.sentAt)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <div className="text-center py-8 text-hai">
                <File className="mx-auto h-12 w-12 text-gin mb-2" />
                ファイルがアップロードされていません
              </div>
            )}
          </div>
        </div>

        {/* 関連情報 */}
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden">
          <div className="bg-kinari px-6 py-3 border-b border-gin">
            <h3 className="text-sm font-semibold text-sumi flex items-center">
              <User className="mr-2 h-4 w-4 text-kohaku" />
              関連情報
            </h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              {data.customer ? (
                <div>
                  <dt className="text-sm text-hai">顧客</dt>
                  <dd className="text-sumi">
                    <div className="font-medium">{data.customer.name}</div>
                    {data.customer.nameKana && (
                      <div className="text-sm text-hai">{data.customer.nameKana}</div>
                    )}
                  </dd>
                </div>
              ) : (
                <div className="text-hai">顧客情報なし</div>
              )}
              {data.contractPlot ? (
                <div>
                  <dt className="text-sm text-hai flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    区画
                  </dt>
                  <dd className="text-sumi">
                    {data.contractPlot.physicalPlot.areaName} - {data.contractPlot.physicalPlot.plotNumber}
                  </dd>
                </div>
              ) : (
                <div className="text-hai">区画情報なし</div>
              )}
            </dl>
          </div>
        </div>

        {/* 日時情報 */}
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden">
          <div className="bg-kinari px-6 py-3 border-b border-gin">
            <h3 className="text-sm font-semibold text-sumi flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-kohaku" />
              日時情報
            </h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-hai">作成日時</dt>
                <dd className="text-sumi">{formatDate(data.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-hai">更新日時</dt>
                <dd className="text-sumi">{formatDate(data.updatedAt)}</dd>
              </div>
              {data.createdBy && (
                <div>
                  <dt className="text-sm text-hai">作成者</dt>
                  <dd className="text-sumi">{data.createdBy}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* テンプレートデータ（デバッグ用、必要に応じて表示） */}
        {data.templateData && Object.keys(data.templateData).length > 0 && (
          <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant-sm overflow-hidden lg:col-span-2">
            <div className="bg-kinari px-6 py-3 border-b border-gin">
              <h3 className="text-sm font-semibold text-sumi">テンプレートデータ</h3>
            </div>
            <div className="p-6">
              <pre className="text-sm text-sumi bg-shiro p-4 rounded-elegant overflow-x-auto">
                {JSON.stringify(data.templateData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
